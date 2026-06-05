"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  RotateCcw,
  Headphones,
  Clock,
  Calendar,
  Users,
  Wifi,
  Zap,
  Layers,
  Droplet,
  Lightbulb,
  Wind,
  CheckCircle,
  Star,
  Navigation,
  CreditCard,
  User,
  Check,
  ChevronDown,
  Info,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchBuses, useScheduleSeats, useScheduleDetails } from "@/hooks/use-search";
import { useCreateBooking, useLockSeats } from "@/hooks/use-booking";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Time formatting utility helper
const formatTime12h = (timeStr: string) => {
  if (!timeStr) return "--:--";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

// Image URL generator helper
const getImageUrl = (path: string, busId?: number) => {
  if (!path) return `/bus-${busId || 1}.png`;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
  return `${storageUrl}/${cleanPath}`;
};

export function BookingPage() {
  const navigate = useNavigate();
  
  // Load search parameters
  const [searchParams] = useState(() => {
    const saved = localStorage.getItem("search_params");
    return saved ? JSON.parse(saved) : { from: "Delhi", to: "Jaipur", date: new Date().toISOString().split("T")[0] };
  });

  // Fetch all schedules matching search params
  const { data: schedules, isLoading: searching } = useSearchBuses({
    from_city: searchParams.from,
    to_city: searchParams.to,
    journey_date: searchParams.date,
  });

  // Track currently selected schedule ID (expandedBus)
  const [expandedBus, setExpandedBus] = useState<number | null>(() => {
    const savedId = localStorage.getItem("selected_schedule_id");
    return savedId ? Number(savedId) : null;
  });

  // Set default selected schedule if none is set
  useEffect(() => {
    if (schedules && schedules.length > 0 && !expandedBus) {
      setExpandedBus(schedules[0].id);
    }
  }, [schedules, expandedBus]);

  const { data: selectedSchedule, isLoading: loadingScheduleDetails } = useScheduleDetails(expandedBus || undefined);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<string>("");
  const [droppingPoint, setDroppingPoint] = useState<string>("");

  useEffect(() => {
    if (selectedSchedule) {
      if (!boardingPoint) setBoardingPoint(selectedSchedule.from);
      if (!droppingPoint) setDroppingPoint(selectedSchedule.to);
    }
  }, [selectedSchedule, boardingPoint, droppingPoint]);

  // Modal State for Passenger Details Form
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [passengerNames, setPassengerNames] = useState<Record<string, string>>({});

  // Fetch seats for the selected bus
  const { data: seatDataResponse, isLoading: loadingSeats } = useScheduleSeats(expandedBus);
  const seats = seatDataResponse?.seats || [];

  const lockSeatsMutation = useLockSeats();
  const createBookingMutation = useCreateBooking();

  const toggleSeat = async (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
      // Remove from passengerNames map
      const updatedNames = { ...passengerNames };
      delete updatedNames[seatNumber];
      setPassengerNames(updatedNames);
    } else {
      if (selectedSeats.length >= 6) {
        toast({ title: "Limit reached", description: "You can select up to 6 seats only." });
        return;
      }

      // Lock seat in backend
      try {
        await lockSeatsMutation.mutateAsync({
          schedule_id: expandedBus!,
          seat_numbers: [seatNumber],
          session_id: "temp-session-id",
        });
        setSelectedSeats([...selectedSeats, seatNumber]);
      } catch (error: any) {
        toast({
          title: "Seat Unavailable",
          description: error.response?.data?.message || "This seat is already locked or booked.",
          variant: "destructive"
        });
      }
    }
  };

  // Dynamic fare per seat based on boarding point
  const selectedStop = selectedSchedule?.stops?.find((s: any) => s.stop_name === boardingPoint);
  const farePerSeat = selectedStop ? Number(selectedStop.fare) : (selectedSchedule?.fare || 0);

  const baseFare = selectedSeats.length * farePerSeat;
  const serviceFee = selectedSeats.length > 0 ? 20 : 0; // Flat ₹20 service fee matching mockup
  const totalFare = baseFare + serviceFee;

  // Display boarding point details dynamically based on selected boarding point
  const boardingTime = selectedStop ? formatTime12h(selectedStop.departure_time || selectedStop.arrival_time) : selectedSchedule?.dep;
  const boardingLocation = boardingPoint || selectedSchedule?.from;

  // Handle final booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      toast({ title: "Validation Error", description: "Please fill in all customer contact details.", variant: "destructive" });
      return;
    }

    const passengersList = selectedSeats.map((seatNumber) => ({
      seat_number: seatNumber,
      passenger_name: passengerNames[seatNumber] || customerName, // Fallback to customer name if empty
      gender: seatNumber === "A4" || seatNumber === "E4" ? "female" : "male" // Auto-select female for ladies seats
    }));

    try {
      await createBookingMutation.mutateAsync({
        schedule_id: expandedBus!,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        seat_numbers: selectedSeats,
        total_amount: totalFare,
        passengers: passengersList,
      });
      toast({ 
        title: "Booking Successful", 
        description: `Your tickets from ${boardingLocation} to ${selectedSchedule?.to} have been booked successfully!` 
      });
      setSelectedSeats([]);
      setPassengerNames({});
      setIsPassengerModalOpen(false);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Something went wrong during checkout.",
        variant: "destructive"
      });
    }
  };

  if (searching || (expandedBus ? loadingScheduleDetails : false)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading schedule details...</p>
        </div>
      </div>
    );
  }

  if (!selectedSchedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md p-6 bg-white rounded-2xl border border-slate-150 text-center shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Buses Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't retrieve any schedules for the route from {searchParams.from} to {searchParams.to} on {searchParams.date}.
          </p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  // Format Date Helper
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "long"
    });
  };

  // Structured timeline details dynamically
  const journeyStops = [
    {
      name: selectedSchedule.from,
      location: `${selectedSchedule.from} Central Terminal, Platform 1`,
      arrival: "—",
      departure: selectedSchedule.dep,
      badge: "Boarding / Start",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dotClass: "border-emerald-500",
      fare: selectedSchedule.fare,
      isBoardingOption: true,
    },
    ...(selectedSchedule.stops || []).map((stop: any) => {
      return {
        name: stop.stop_name,
        location: `${stop.stop_name} Bus Stand`,
        arrival: formatTime12h(stop.arrival_time),
        departure: formatTime12h(stop.departure_time),
        badge: "Boarding Only",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
        dotClass: "border-blue-500",
        fare: Number(stop.fare),
        isBoardingOption: true,
      };
    }),
    {
      name: selectedSchedule.to,
      location: `${selectedSchedule.to} Swargate Station, Main Exit`,
      arrival: selectedSchedule.arr,
      departure: "—",
      badge: "Dropping Only",
      badgeClass: "bg-red-50 text-red-700 border-red-100",
      dotClass: "border-red-500",
      isBoardingOption: false,
    }
  ];

  // Group seats by rows for seat layout
  const seatRows: Record<string, any[]> = {};
  seats.forEach((seat: any) => {
    const rowChar = seat.seat_number.charAt(0);
    if (!seatRows[rowChar]) {
      seatRows[rowChar] = [];
    }
    seatRows[rowChar].push(seat);
  });
  const sortedRowKeys = Object.keys(seatRows).sort();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-800">
      
      {/* ═══ TOP NAVBAR HEADER ═══ */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group text-sm font-semibold"
            >
              <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
              <span>Modify Search</span>
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-8.5 h-8.5 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-blue-600">BusBook</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5">
            {["Home", "Buses", "Routes", "Offers", "Track Booking", "Help"].map((link, i) => (
              <button
                key={link}
                onClick={() => {
                  if (i === 0) navigate("/");
                }}
                className={cn(
                  "px-4 py-2 text-sm font-bold transition-all duration-150 rounded-full",
                  i === 1 ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="hidden sm:block w-4" />
        </div>
      </header>

      {/* ═══ TOP HERO SECTION: ROUTE INFO & SELECTED BUS CARD ═══ */}
      <section className="bg-white border-b border-slate-100 py-6 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Route Title block */}
          <div className="text-left shrink-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {selectedSchedule.from} to {selectedSchedule.to}
            </h1>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-xs text-slate-500 font-bold">{formatDisplayDate(selectedSchedule.date)}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {schedules?.length || 12} Buses Found
              </span>
            </div>
          </div>

          {/* Selected Bus card widget */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-5 justify-between">
            {/* Bus visual */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 select-none">
                <img
                  src={getImageUrl(selectedSchedule.images?.[0], selectedSchedule.id)}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-slate-900 text-sm truncate">{selectedSchedule.name}</h3>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 fill-emerald-50/50" />
                </div>
                <p className="text-[11px] text-slate-400 font-bold tracking-wide mt-0.5">{selectedSchedule.type}</p>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {selectedSchedule.amenities?.slice(0, 4).map((a: string) => (
                    <span key={a} className="text-[9px] font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{a}</span>
                  ))}
                  {selectedSchedule.amenities?.length > 4 && (
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                      +{selectedSchedule.amenities.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Timings row block */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start px-2 py-1 sm:py-0 border-y sm:border-y-0 border-slate-100/80">
              <div className="text-left">
                <p className="text-sm font-black text-slate-900">{selectedSchedule.dep}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{selectedSchedule.from}</p>
              </div>
              <div className="flex items-center gap-1 min-w-[70px] sm:min-w-[90px] shrink-0">
                <div className="w-full h-px bg-slate-200" />
                <div className="flex flex-col items-center shrink-0">
                  <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{selectedSchedule.duration}</span>
                  <div className="w-1.5 h-1.5 rounded-full border border-slate-300 bg-white -my-0.5" />
                </div>
                <div className="w-full h-px bg-slate-200" />
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">{selectedSchedule.arr}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{selectedSchedule.to}</p>
              </div>
            </div>

            {/* Price + View details CTA */}
            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-sm font-black text-slate-900">₹{selectedSchedule.fare}.00</p>
                <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">per seat</p>
                <div className="flex items-center gap-0.5 mt-1 sm:justify-end">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-black text-slate-600">4.5</span>
                  <span className="text-[9.5px] text-slate-400 font-bold">(120)</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/schedule/${selectedSchedule.id}`)}
                className="h-9 text-xs font-black text-blue-600 border-blue-150 hover:bg-blue-50 hover:text-blue-700 px-4 rounded-xl transition-all"
              >
                View Details
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ THREE COLUMN MAIN LAYOUT ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: JOURNEY DETAILS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col h-full justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Journey Details
              </h3>

              {/* Dynamic Timeline Wrapper */}
              <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
                {journeyStops.map((stop, sIdx) => {
                  const isSelected = boardingPoint === stop.name;
                  const canSelect = stop.isBoardingOption;

                  return (
                    <div key={sIdx} className="relative">
                      {/* Circle Pin */}
                      <div
                        className={cn(
                          "absolute -left-[20px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all z-10",
                          isSelected
                            ? "border-blue-600 bg-blue-600 ring-4 ring-blue-100 scale-110 z-20"
                            : stop.dotClass || "border-slate-300"
                        )}
                      />
                      
                      {/* Grid card content */}
                      <button
                        type="button"
                        disabled={!canSelect}
                        onClick={() => canSelect && setBoardingPoint(stop.name)}
                        className={cn(
                          "w-full flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-150 select-none",
                          canSelect
                            ? isSelected
                              ? "border-blue-500 bg-blue-50/30 shadow-xs ring-2 ring-blue-100/50"
                              : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 cursor-pointer"
                            : "border-slate-100 bg-slate-50/20 opacity-80 cursor-default"
                        )}
                      >
                        {/* Row 1: Name and Timing/Badge info */}
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className={cn("text-xs sm:text-sm font-black truncate", isSelected ? "text-blue-700" : "text-slate-900")}>
                              {stop.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-black shrink-0 leading-none">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                              <span>{stop.departure !== "—" ? "Dep:" : "Arr:"}</span>
                              <span className="text-slate-800 font-black">{stop.departure !== "—" ? stop.departure : stop.arrival}</span>
                            </div>
                            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0", stop.badgeClass)}>
                              {stop.badge}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Location and Fare */}
                        <div className="flex items-center justify-between w-full gap-3 text-[10px] border-t border-slate-100/60 pt-2 mt-0.5">
                          <span className="text-slate-400 font-medium truncate flex-1">
                            {stop.location}
                          </span>
                          
                          {stop.fare !== undefined && (
                            <span className={cn(
                              "font-black px-2 py-0.5 rounded border leading-none shrink-0",
                              isSelected 
                                ? "bg-blue-600 border-blue-700 text-white shadow-xs" 
                                : "bg-blue-50/60 border-blue-100 text-blue-600"
                            )}>
                              Fare: ₹{stop.fare}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline bottom advisory note */}
            <div className="mt-6 p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 font-bold leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>Note: Times are approximate and may vary due to traffic and road conditions.</p>
            </div>
          </div>

          {/* COLUMN 2: BOOKING SUMMARY */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col h-full justify-between">
            <div className="space-y-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Booking Summary
              </h3>

              {/* Operator Circle branding */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                  {selectedSchedule.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{selectedSchedule.name}</h4>
                  <p className="text-[10.5px] text-slate-400 font-bold tracking-wide mt-0.5">{selectedSchedule.type}</p>
                </div>
              </div>

              {/* Small timeline */}
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-black text-slate-900 w-16">{boardingTime}</span>
                  <span className="font-semibold text-slate-500 truncate">{boardingLocation} Bus Stand</span>
                </div>
                <div className="ml-1 border-l border-dashed border-slate-300 h-4" />
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="font-black text-slate-900 w-16">{selectedSchedule.arr}</span>
                  <span className="font-semibold text-slate-500 truncate">{selectedSchedule.to} Terminal</span>
                </div>
              </div>

              {/* Metadata listing grid */}
              <div className="space-y-2.5 py-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Date</span>
                  <span className="text-slate-900">{formatDisplayDate(selectedSchedule.date)}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Bus</span>
                  <span className="text-slate-900">{selectedSchedule.name}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Boarding Point</span>
                  <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded">
                    {boardingLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Seats</span>
                  <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded">
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
                  </span>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Base Fare ({selectedSeats.length} × ₹{farePerSeat})</span>
                  <span className="text-slate-800">₹{baseFare}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Service Fee</span>
                  <span className="text-slate-800">₹{serviceFee}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm font-black text-slate-900">Total Amount</span>
                  <span className="text-xl font-extrabold text-blue-600">₹{totalFare}</span>
                </div>
              </div>
            </div>

            {/* CTA Continue Booking and trust factor labels */}
            <div className="space-y-4 pt-6">
              <Button
                onClick={() => setIsPassengerModalOpen(true)}
                disabled={selectedSeats.length === 0}
                className="w-full h-11 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-100 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                Continue to Book
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-bold text-slate-400 select-none border-t border-slate-100 pt-4">
                {[
                  { icon: Shield, label: "Secure & Safe Booking", col: "text-blue-600" },
                  { icon: Headphones, label: "24/7 Customer Support", col: "text-purple-600" },
                  { icon: RotateCcw, label: "Easy Cancellation", col: "text-orange-500" },
                  { icon: Lock, label: "Secure Payments", col: "text-pink-600" },
                  { icon: CheckCircle, label: "Best Price Guarantee", col: "text-emerald-600" },
                  { icon: CreditCard, label: "Multiple Payment Options", col: "text-cyan-600" },
                ].map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <IconComponent className={cn("w-3.5 h-3.5", item.col)} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 3: SELECT YOUR SEATS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col justify-between h-full">
            <div>
              {/* Header and Seat Price Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Select Your Seats
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                  ₹{farePerSeat}.00 per seat
                </span>
              </div>

              {/* Legend status indicators */}
              <div className="flex items-center gap-3.5 mb-5 flex-wrap border-b border-slate-100 pb-4 select-none">
                {[
                  { label: "Available", bg: "bg-[#10B981] border-[#059669]" },
                  { label: "Selected", bg: "bg-blue-600 border-blue-700" },
                  { label: "Booked", bg: "bg-slate-200 border-slate-300" },
                  { label: "Ladies", bg: "bg-pink-400 border-pink-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
                    <div className={cn("w-3.5 h-3.5 rounded-sm border", item.bg)} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Custom Bus Seat layout box */}
              <div className="flex justify-center select-none py-1">
                {loadingSeats ? (
                  <div className="p-12 text-center text-xs text-slate-400 font-bold">Loading seat layout...</div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl w-full max-w-[280px] flex flex-col justify-between">
                    
                    {/* Top deck controls: Driver avatar and Lower Berth Badge */}
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shadow-xs">
                          <User className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Driver</span>
                      </div>
                      <span className="text-[9.5px] font-black text-blue-700 bg-blue-100 border border-blue-150 px-2 py-0.5 rounded">
                        Lower Berth
                      </span>
                    </div>

                    {/* Seat Rows mapping - 5 column layout with aisle */}
                    <div className="space-y-2.5">
                      {sortedRowKeys.map((rowChar) => {
                        const rowSeats = seatRows[rowChar] || [];
                        const s1 = rowSeats.find((s) => s.seat_number === `${rowChar}1`);
                        const s2 = rowSeats.find((s) => s.seat_number === `${rowChar}2`);
                        const s3 = rowSeats.find((s) => s.seat_number === `${rowChar}3`);
                        const s4 = rowSeats.find((s) => s.seat_number === `${rowChar}4`);

                        const renderSeatButton = (seat: any) => {
                          const isSelected = selectedSeats.includes(seat.seat_number);
                          const isBooked = seat.is_booked;
                          const isLocked = seat.is_locked;
                          const isLadies = seat.seat_number === "A4" || seat.seat_number === "E4";

                          return (
                            <button
                              type="button"
                              onClick={() => toggleSeat(seat.seat_number)}
                              disabled={isBooked || (isLocked && !isSelected)}
                              className={cn(
                                "w-8.5 h-8.5 rounded-lg text-[9.5px] font-black transition-all flex items-center justify-center border",
                                !isBooked && !isLocked && !isSelected && !isLadies && "bg-[#10B981] border-[#059669] text-white hover:scale-105 active:scale-95 cursor-pointer",
                                !isBooked && !isLocked && !isSelected && isLadies && "bg-pink-400 border-pink-500 text-white hover:scale-105 active:scale-95 cursor-pointer",
                                isSelected && "bg-blue-600 border-blue-700 text-white hover:scale-105 active:scale-95 shadow-md cursor-pointer",
                                isBooked && "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed",
                                isLocked && !isSelected && "bg-amber-400 border-amber-500 text-white cursor-not-allowed"
                              )}
                            >
                              {seat.seat_number}
                            </button>
                          );
                        };

                        return (
                          <div key={rowChar} className="flex items-center justify-between gap-1">
                            {/* Left Side: 2 Seats */}
                            <div className="flex gap-2">
                              {s1 ? renderSeatButton(s1) : <div className="w-8.5 h-8.5" />}
                              {s2 ? renderSeatButton(s2) : <div className="w-8.5 h-8.5" />}
                            </div>
                            
                            {/* Center Aisle space */}
                            <div className="w-4 shrink-0" />
                            
                            {/* Right Side: 2 Seats */}
                            <div className="flex gap-2">
                              {s3 ? renderSeatButton(s3) : <div className="w-8.5 h-8.5" />}
                              {s4 ? renderSeatButton(s4) : <div className="w-8.5 h-8.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Front label with arrow indicator pointing up */}
                    <div className="mt-5 pt-3 border-t border-slate-200/60 text-center flex items-center justify-center gap-1.5 text-[9.5px] text-slate-400 font-bold tracking-widest uppercase leading-none">
                      <span>↑</span>
                      <span>Front</span>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ═══ FOOTER FEATURES VALUES BAR ═══ */}
      <section className="bg-white border-t border-slate-100 py-6 mt-6 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {[
              { title: "Live Tracking", desc: "Track your bus in real-time", icon: MapPin, col: "text-emerald-500" },
              { title: "On-Time Guarantee", desc: "We value your time", icon: Clock, col: "text-blue-500" },
              { title: "Customer First", desc: "We're here to help you", icon: Headphones, col: "text-purple-500" },
              { title: "Safe & Reliable Travel", desc: "Your safety is our priority", icon: Shield, col: "text-indigo-500" },
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-3 justify-start md:justify-center">
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <StatIcon className={cn("w-4.5 h-4.5", stat.col)} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-900 leading-none">{stat.title}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-1 leading-none">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ BASE COPYRIGHT FOOTER ═══ */}
      <footer className="bg-slate-900 text-slate-400 py-6 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-white tracking-wide">BusBook</span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold">
            © 2026 BusBook. All rights reserved. | Terms | Privacy | Refund Policy
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
            <Shield className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
            <span>Secure & Verified Checkout</span>
          </div>
        </div>
      </footer>

      {/* ═══ PASSENGER DETAILS FORM MODAL ═══ */}
      <Dialog open={isPassengerModalOpen} onOpenChange={setIsPassengerModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white border border-slate-150 p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Passenger Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold mt-1">
              Please enter checkout info for selected seats: {selectedSeats.join(", ")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4 mt-3">
            {/* Customer name */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="cust_name" className="text-xs font-black text-slate-600">Customer Name</Label>
              <Input
                id="cust_name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter full name"
                className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="cust_email" className="text-xs font-black text-slate-600">Email Address</Label>
                <Input
                  id="cust_email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust_phone" className="text-xs font-black text-slate-600">Mobile Number</Label>
                <Input
                  id="cust_phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Unique passenger name for each seat */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Seat Occupant Names</span>
              
              <div className="max-h-[160px] overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
                {selectedSeats.map((seatNumber) => (
                  <div key={seatNumber} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg text-center shrink-0">
                      Seat {seatNumber}
                    </span>
                    <Input
                      required
                      placeholder={`Name for Seat ${seatNumber}`}
                      value={passengerNames[seatNumber] || ""}
                      onChange={(e) => setPassengerNames({ ...passengerNames, [seatNumber]: e.target.value })}
                      className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer submit buttons */}
            <DialogFooter className="pt-3 border-t border-slate-100 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPassengerModalOpen(false)}
                className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="h-9 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100"
              >
                {createBookingMutation.isPending ? "Confirming..." : "Confirm & Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
