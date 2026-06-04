"use client";

import React, { useState } from "react";
import {
  Bus,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Shield,
  Lock,
  RotateCcw,
  Headphones,
  Clock,
  Calendar,
  Users,
  Wifi,
  Plug,
  Snowflake,
  Wine,
  Tv,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Star,
  Navigation,
  CreditCard,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavStore } from "@/lib/nav-store";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════
   BUSBOOK BOOKING PAGE - Pixel Perfect
   ═══════════════════════════════════════════════ */

type SeatStatus = "available" | "booked" | "selected" | "ladies";

interface Seat {
  id: string;
  row: number;
  col: number;
  status: SeatStatus;
  price: number;
}

// Deterministic seed for seat layout
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  const rows = 8;
  const cols = ["A", "B", "D", "E"]; // 2 + aisle + 2
  let seed = 42;
  for (let r = 1; r <= rows; r++) {
    for (const col of cols) {
      seed++;
      const id = `${r}${col}`;
      const rand = seededRandom(seed);
      let status: SeatStatus = "available";
      if (rand < 0.25) status = "booked";
      else if (rand < 0.30) status = "ladies";
      seats.push({ id, row: r, col: cols.indexOf(col), status, price: 650 });
    }
  }
  // Last row - full width (5 seats)
  for (const col of ["A", "B", "C", "D", "E"]) {
    seed++;
    const id = `9${col}`;
    const rand = seededRandom(seed);
    let status: SeatStatus = "available";
    if (rand < 0.3) status = "booked";
    seats.push({ id, row: 9, col: cols.indexOf(col), status, price: 650 });
  }
  return seats;
}

const BUS_DATA = [
  { name: "RSRTC", type: "Volvo A/C Semi Sleeper (2+2)", dep: "07:00 AM", depLoc: "Kashmere Gate, Delhi", arr: "12:30 PM", arrLoc: "Sindhi Camp, Jaipur", duration: "5h 30m", nonStop: true, price: 650, seats: 12, amenities: ["A/C", "Charging Point", "Blanket", "Water Bottle", "Pillow"], color: "bg-orange-500", rating: 4.2, popular: true },
  { name: "Sharma Travels", type: "Volvo A/C Sleeper (2+1)", dep: "08:30 AM", depLoc: "ISBT Kashmere Gate, Delhi", arr: "02:15 PM", arrLoc: "Sindhi Camp, Jaipur", duration: "5h 45m", nonStop: true, price: 750, seats: 8, amenities: ["A/C", "Blanket", "Charging Point", "Water Bottle"], color: "bg-green-600", rating: 4.5, popular: false },
  { name: "Rajputana Express", type: "A/C Sleeper (2+1)", dep: "09:00 AM", depLoc: "Dhaula Kuan, Delhi", arr: "03:00 PM", arrLoc: "Narayan Singh Circle, Jaipur", duration: "6h 00m", nonStop: false, price: 600, seats: 15, amenities: ["A/C", "Water Bottle", "Charging Point"], color: "bg-blue-700", rating: 3.9, popular: false },
  { name: "Geetanjali Travels", type: "Volvo A/C Sleeper (2+1)", dep: "10:00 AM", depLoc: "RK Puram, Delhi", arr: "03:30 PM", arrLoc: "Station Road, Jaipur", duration: "5h 30m", nonStop: true, price: 800, seats: 6, amenities: ["A/C", "Blanket", "Water Bottle", "Pillow"], color: "bg-purple-600", rating: 4.7, popular: true },
  { name: "New Delhi Travels", type: "A/C Semi Sleeper (2+2)", dep: "11:00 AM", depLoc: "Connaught Place, Delhi", arr: "04:45 PM", arrLoc: "Sindhi Camp, Jaipur", duration: "5h 45m", nonStop: false, price: 550, seats: 20, amenities: ["A/C", "Charging Point"], color: "bg-teal-600", rating: 4.0, popular: false },
];

import { useSearchBuses, useScheduleSeats } from "@/hooks/use-search";
import { useCreateBooking, useLockSeats } from "@/hooks/use-booking";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useState(() => {
    const saved = localStorage.getItem("search_params");
    return saved ? JSON.parse(saved) : { from: "Delhi", to: "Jaipur", date: new Date().toISOString().split("T")[0] };
  });

  const { data: schedules, isLoading: searching } = useSearchBuses({
    from_city: searchParams.from,
    to_city: searchParams.to,
    journey_date: searchParams.date,
  });

  const [expandedBus, setExpandedBus] = useState<number | null>(() => {
    const savedId = localStorage.getItem("selected_schedule_id");
    if (savedId) {
      localStorage.removeItem("selected_schedule_id");
      return Number(savedId);
    }
    return null;
  });
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<string>("");
  const [droppingPoint, setDroppingPoint] = useState<string>("");
  const { data: seatDataResponse, isLoading: loadingSeats } = useScheduleSeats(expandedBus);
  const seats = seatDataResponse?.seats || [];

  const lockSeatsMutation = useLockSeats();
  const createBookingMutation = useCreateBooking();

  const toggleSeat = async (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
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
          session_id: "temp-session-id", // In real app, use a proper session id
        });
        setSelectedSeats([...selectedSeats, seatNumber]);
      } catch (error: any) {
        toast({ title: "Seat Unavailable", description: error.response?.data?.message || "This seat is already locked or booked.", variant: "destructive" });
      }
    }
  };

  const baseFare = selectedSeats.length * (schedules?.find((s: any) => s.id === expandedBus)?.fare || 0);
  const serviceFee = Math.round(baseFare * 0.05);
  const totalFare = baseFare + serviceFee;

  const handleBooking = async (passengerDetails: any) => {
    try {
      await createBookingMutation.mutateAsync({
        schedule_id: expandedBus,
        customer_name: passengerDetails.name,
        customer_phone: passengerDetails.phone,
        customer_email: passengerDetails.email,
        seat_numbers: selectedSeats,
        total_amount: totalFare,
        passengers: passengerDetails.passengers,
      });
      toast({ title: "Booking Successful", description: "Your tickets have been booked." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Booking Failed", description: error.response?.data?.message || "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      {/* ═══ TOP NAVIGATION BAR ═══ */}
      <header className="bg-[#d84a34] sticky top-0 z-50 shadow-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Modify Search</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                  <Bus className="w-4 h-4 text-[#d84a34]" />
                </div>
                <span className="text-lg font-bold text-white">BusBook</span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {["Home", "Buses", "Routes", "Offers", "Track Booking", "Help"].map((link, i) => (
                <a
                  key={link}
                  href="#"
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                    i === 1 ? "text-white bg-white/20" : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {link}
                </a>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:text-white hover:bg-white/10 text-xs font-medium h-8"
              >
                Download App
              </Button>
              <Button
                size="sm"
                className="bg-white text-[#d84a34] hover:bg-white/90 text-xs font-bold h-8 rounded"
              >
                Login / Signup
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ SEARCH FORM BAR ═══ */}
      <div className="bg-[#1a1a2e] py-4">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
              {/* From */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:border-[#d84a34]/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#d84a34]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">From</p>
                  <p className="text-sm font-bold text-gray-900">{searchParams.from}</p>
                </div>
              </div>
              {/* To */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:border-[#d84a34]/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#d84a34]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">To</p>
                  <p className="text-sm font-bold text-gray-900">{searchParams.to}</p>
                </div>
              </div>
              {/* Date */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:border-[#d84a34]/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-[#d84a34]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-medium">Date</p>
                  <p className="text-sm font-bold text-gray-900">{searchParams.date}</p>
                </div>
              </div>
              {/* Passengers */}
              <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 hover:border-[#d84a34]/50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-[#d84a34]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">Passengers</p>
                  <p className="text-sm font-bold text-gray-900">
                    {searchParams.passengers || 1} Passenger{(searchParams.passengers || 1) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {/* Search Button */}
              <Button className="bg-[#d84a34] hover:bg-[#c43a24] text-white font-bold rounded-lg h-full min-h-[44px] gap-1.5" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                {searchParams.from} to {searchParams.to}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{searchParams.date}</span>
                <span className="text-xs text-gray-300">|</span>
                <span className="text-xs font-semibold text-[#d84a34]">{schedules?.length || 0} Buses Found</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-medium">Filter by:</span>
              {["Departure Time", "Price", "Bus Type", "Amenities"].map((f) => (
                <select key={f} className="text-[11px] border border-gray-200 rounded px-2 py-1.5 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-[#d84a34] cursor-pointer">
                  <option>{f}</option>
                </select>
              ))}
              <div className="flex items-center gap-1 ml-1">
                <span className="text-[11px] text-gray-500 font-medium">Sort by:</span>
                <select className="text-[11px] border border-[#d84a34]/40 rounded px-2 py-1.5 text-[#d84a34] bg-red-50 focus:outline-none cursor-pointer font-medium">
                  <option>Departure Time</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT - Bus Listings + Seat Selection */}
            <div className="lg:col-span-2 space-y-3">
              {searching ? (
                <div className="bg-white p-8 text-center rounded-lg border border-gray-200">Searching for buses...</div>
              ) : schedules?.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-lg border border-gray-200">No buses found for this route and date.</div>
              ) : (
                schedules?.map((schedule: any) => (
                  <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {/* Bus Card */}
                    <div className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        {/* Operator */}
                        <div className="lg:w-[180px] shrink-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-blue-600")}>
                              {schedule.bus.bus_name.charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{schedule.bus.bus_name}</span>
                          </div>
                          <p className="text-[11px] text-gray-500">{schedule.bus.bus_type}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {schedule.bus.amenities?.map((a: string) => (
                              <span key={a} className="text-[9px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{a}</span>
                            ))}
                          </div>
                        </div>

                        {/* Departure */}
                        <div className="lg:w-[100px] shrink-0">
                          <p className="text-sm font-bold text-gray-900">{schedule.departure_time}</p>
                          <p className="text-[10px] text-gray-400">{schedule.route.from_city}</p>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1.5 lg:w-[120px] shrink-0">
                          <div className="flex-1 flex items-center gap-1">
                            <div className="w-4 h-px bg-gray-300" />
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] text-gray-400 font-medium">{schedule.route.duration}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400 -my-0.5" />
                            </div>
                            <div className="w-4 h-px bg-gray-300" />
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="lg:w-[100px] shrink-0">
                          <p className="text-sm font-bold text-gray-900">{schedule.arrival_time}</p>
                          <p className="text-[10px] text-gray-400">{schedule.route.to_city}</p>
                        </div>

                        {/* Badge */}
                        <div className="lg:w-[60px] shrink-0">
                          <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Available</span>
                        </div>

                        {/* Price + View Seats */}
                        <div className="flex items-center gap-3 lg:ml-auto lg:shrink-0">
                          <div className="text-right">
                            <p className="text-base font-extrabold text-gray-900">₹{schedule.fare}</p>
                            <div className="flex items-center gap-0.5 justify-end">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-semibold text-gray-500">4.5</span>
                            </div>
                          </div>
                          <Button
                            className={cn(
                              "text-xs font-bold rounded px-4 h-8",
                              expandedBus === schedule.id
                                ? "bg-[#d84a34] hover:bg-[#c43a24] text-white"
                                : "bg-[#d84a34] hover:bg-[#c43a24] text-white"
                            )}
                            onClick={() => {
                              setExpandedBus(expandedBus === schedule.id ? null : schedule.id);
                              setSelectedSeats([]);
                            }}
                          >
                            {expandedBus === schedule.id ? "Hide Seats" : "View Seats"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Seat Selection Panel (Expandable) */}
                    {expandedBus === schedule.id && (
                    <div className="border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Seat Layout */}
                        <div className="p-4 border-r border-gray-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Navigation className="w-3.5 h-3.5 text-[#d84a34]" />
                              <span className="text-xs font-bold text-gray-800">Select Your Seats</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#d84a34]">
                              ₹{schedule.fare} per seat
                            </span>
                          </div>

                          {/* Seat Legend */}
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-sm bg-green-500 border border-green-600" />
                              <span className="text-[10px] text-gray-500">Available</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-sm bg-blue-600 border border-blue-700" />
                              <span className="text-[10px] text-gray-500">Selected</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-sm bg-gray-300 border border-gray-400" />
                              <span className="text-[10px] text-gray-500">Booked</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-sm bg-pink-300 border border-pink-400" />
                              <span className="text-[10px] text-gray-500">Ladies</span>
                            </div>
                          </div>

                          {/* Bus Seat Layout */}
                          <div className="flex justify-center">
                            {loadingSeats ? (
                              <div className="p-8 text-center text-xs text-gray-500">Loading seat layout...</div>
                            ) : (
                              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 inline-block">
                                {/* Driver + Lower Deck Label */}
                                <div className="flex items-center justify-between mb-3 px-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-7 h-7 rounded bg-gray-600 flex items-center justify-center">
                                      <User className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-[9px] text-gray-400">Driver</span>
                                  </div>
                                  <div className="w-14 h-5 rounded bg-blue-100 flex items-center justify-center">
                                    <span className="text-[9px] text-blue-600 font-bold">LOWER</span>
                                  </div>
                                </div>

                                {/* Seat Rows */}
                                <div className="grid grid-cols-4 gap-2">
                                  {seats.map((seat: any) => {
                                    const isSelected = selectedSeats.includes(seat.seat_number);
                                    const isBooked = seat.is_booked;
                                    const isLocked = seat.is_locked;

                                    return (
                                      <button
                                        key={seat.id}
                                        onClick={() => toggleSeat(seat.seat_number)}
                                        disabled={isBooked || (isLocked && !isSelected)}
                                        className={cn(
                                          "w-8 h-8 rounded text-[9px] font-bold transition-all duration-100 flex items-center justify-center",
                                          !isBooked && !isLocked && !isSelected && "bg-green-500 text-white hover:bg-green-600 cursor-pointer",
                                          isSelected && "bg-blue-600 text-white shadow-sm cursor-pointer",
                                          isBooked && "bg-gray-300 text-gray-500 cursor-not-allowed",
                                          isLocked && !isSelected && "bg-amber-400 text-white cursor-not-allowed"
                                        )}
                                      >
                                        {seat.seat_number}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Front label */}
                                <div className="mt-4 text-center">
                                  <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Front</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Boarding & Dropping Points */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-green-600" />
                              Boarding Point
                            </h4>
                            <div className="space-y-1.5">
                              {[
                                { id: "kashmere", name: "Kashmere Gate", time: "07:00 AM", loc: "ISBT Kashmere Gate" },
                                { id: "dhaula", name: "Dhaula Kuan", time: "07:30 AM", loc: "Dhaula Kuan Metro" },
                                { id: "rk", name: "RK Puram", time: "07:50 AM", loc: "RK Puram Sector 12" },
                              ].map((bp) => (
                                <button
                                  key={bp.id}
                                  onClick={() => setBoardingPoint(bp.id)}
                                  className={cn(
                                    "w-full text-left p-2.5 rounded-lg border transition-all text-xs",
                                    boardingPoint === bp.id
                                      ? "border-[#d84a34] bg-red-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-900">{bp.name}</p>
                                      <p className="text-[10px] text-gray-500">{bp.loc}</p>
                                    </div>
                                    <span className={cn("font-bold", boardingPoint === bp.id ? "text-[#d84a34]" : "text-gray-600")}>
                                      {bp.time}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              Dropping Point
                            </h4>
                            <div className="space-y-1.5">
                              {[
                                { id: "sindhi", name: "Sindhi Camp", time: "12:30 PM", loc: "Sindhi Camp Bus Stand" },
                                { id: "narayan", name: "Narayan Singh Circle", time: "12:45 PM", loc: "Narayan Singh Circle" },
                                { id: "station", name: "Station Road", time: "01:00 PM", loc: "Jaipur Railway Station" },
                              ].map((dp) => (
                                <button
                                  key={dp.id}
                                  onClick={() => setDroppingPoint(dp.id)}
                                  className={cn(
                                    "w-full text-left p-2.5 rounded-lg border transition-all text-xs",
                                    droppingPoint === dp.id
                                      ? "border-[#d84a34] bg-red-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-900">{dp.name}</p>
                                      <p className="text-[10px] text-gray-500">{dp.loc}</p>
                                    </div>
                                    <span className={cn("font-bold", droppingPoint === dp.id ? "text-[#d84a34]" : "text-gray-600")}>
                                      {dp.time}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

            {/* RIGHT - Booking Summary */}
            <div className="space-y-3">
              {/* Trip Details */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-[#d84a34]">
                  <span className="text-sm font-bold text-white">Booking Summary</span>
                </div>
                <div className="p-4 space-y-3">
                  {/* Bus Info */}
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">R</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">RSRTC</p>
                      <p className="text-[10px] text-gray-500">Volvo A/C Semi Sleeper (2+2)</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="py-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[11px] text-gray-500">07:00 AM</span>
                      <span className="text-xs font-semibold text-gray-800">Kashmere Gate, Delhi</span>
                    </div>
                    <div className="ml-1 border-l-2 border-dashed border-gray-200 h-3" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-[11px] text-gray-500">12:30 PM</span>
                      <span className="text-xs font-semibold text-gray-800">Sindhi Camp, Jaipur</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Date</span>
                      <span className="text-[11px] font-semibold text-gray-700">24 May 2024, Friday</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Bus</span>
                      <span className="text-[11px] font-semibold text-gray-700">RSRTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Seats</span>
                      <span className="text-[11px] font-semibold text-gray-700">
                        {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
                      </span>
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="pt-3 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Base Fare ({selectedSeats.length} × ₹650)</span>
                      <span className="text-[11px] font-medium text-gray-700">₹{baseFare}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Service Fee (5%)</span>
                      <span className="text-[11px] font-medium text-gray-700">₹{serviceFee}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-900">Total Amount</span>
                      <span className="text-lg font-extrabold text-green-600">₹{totalFare}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue to Book Button */}
              <Button
                className="w-full h-11 text-sm font-bold bg-[#d84a34] hover:bg-[#c43a24] text-white rounded-lg gap-1.5"
                disabled={selectedSeats.length === 0}
              >
                Continue to Book
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Security Badges */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Shield, label: "Secure & Safe Booking", color: "text-blue-600" },
                    { icon: Headphones, label: "24x7 Customer Support", color: "text-green-600" },
                    { icon: RotateCcw, label: "Easy Cancellation", color: "text-orange-500" },
                    { icon: Lock, label: "Secure Payments", color: "text-purple-600" },
                    { icon: CheckCircle, label: "Best Price Guarantee", color: "text-teal-600" },
                    { icon: CreditCard, label: "Multiple Payment Options", color: "text-[#d84a34]" },
                  ].map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.label} className="flex items-center gap-1.5">
                        <Icon className={cn("w-3.5 h-3.5 shrink-0", badge.color)} />
                        <span className="text-[10px] text-gray-600 leading-tight">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[#1a1a2e] text-gray-400 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Bus className="w-3.5 h-3.5 text-[#d84a34]" />
              </div>
              <span className="text-sm font-bold text-white">BusBook</span>
            </div>
            <p className="text-[11px] text-gray-500">
              © 2024 BusBook. All rights reserved. | Terms | Privacy | Refund Policy
            </p>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] text-gray-500">Secure & Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
