import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Heart,
  Wifi,
  Zap,
  Layers,
  Droplet,
  Lightbulb,
  Wind,
  Shield,
  Lock,
  Headphones,
  CheckCircle,
  MapPin,
  Clock,
  Calendar,
  Users,
  Star,
  Bus,
  Tv,
  PhoneCall,
  User,
  Coffee,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScheduleDetails } from "@/hooks/use-search";
import { cn, getImageUrl } from "@/lib/utils";

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

export function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: schedule, isLoading, error } = useScheduleDetails(id);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const dbImages = schedule?.images ? (typeof schedule.images === 'string' ? JSON.parse(schedule.images) : schedule.images) : [];
  const allImages = Array.isArray(dbImages) && dbImages.length > 0 ? dbImages : ["buses/bus-1.png"];
  const busImage = allImages[activeImageIndex] || allImages[0] || "";

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading schedule details...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-6 bg-white rounded-2xl border text-center shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">We couldn't retrieve the details for this schedule.</p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const amenityIcons: Record<string, any> = {
    "Wi-Fi": Wifi, "Wifi": Wifi, "Charging Point": Zap, "Blanket": Layers,
    "Water Bottle": Droplet, "Reading Light": Lightbulb, "A/C": Wind, "AC": Wind,
    "CCTV": Tv, "GPS Tracking": MapPin, "Emergency Exit": Shield,
    "Fire Extinguisher": Lock, "Snacks": Coffee, "Pillow": Layers,
  };

  const allPossibleAmenities = [
    "Wi-Fi", "Charging Point", "Blanket", "Water Bottle", "Reading Light",
    "AC", "CCTV", "GPS Tracking", "Emergency Exit", "Fire Extinguisher"
  ];

  const busAmenities = schedule.amenities || [];
  const hasAmenity = (name: string) => busAmenities.some((a: string) => a.toLowerCase().includes(name.toLowerCase()));

  const boardingPoints = [
    { name: `${schedule.from} (Start)`, time: schedule.dep },
    ...(schedule.stops || [])
      .filter((stop: any) => stop.stop_name.toLowerCase() !== schedule.to.toLowerCase())
      .map((stop: any) => ({ name: stop.stop_name, time: formatTime12h(stop.departure_time || stop.arrival_time) }))
  ];

  const droppingPoints = [
    { name: `${schedule.to} (Destination)`, time: schedule.arr }
  ];

  const handleBookNow = () => {
    const searchParams = { from: schedule.from, to: schedule.to, date: schedule.date, passengers: 1 };
    localStorage.setItem("search_params", JSON.stringify(searchParams));
    localStorage.setItem("selected_schedule_id", String(schedule.id));
    navigate("/booking");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {["Home", "Buses", "Routes", "Track Booking"].map((link, i) => (
              <button
                key={link}
                onClick={() => { if (i === 0) navigate("/"); if (i === 1) navigate("/buses"); if (i === 2) navigate("/routes"); if (i === 3) navigate("/track"); }}
                className={cn("px-3 py-2 text-sm font-medium rounded-md transition-colors", i === 0 ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50")}
              >
                {link}
              </button>
            ))}
          </nav>
          <Button onClick={() => { localStorage.setItem("scroll_to_schedules", "true"); navigate("/"); }} className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg shadow-blue-200">
            Book Now
          </Button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6 pb-24 lg:pb-6">

        {/* ===== BREADCRUMB ===== */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Schedules
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 gap-2 rounded-xl text-xs font-bold border text-gray-600 hover:bg-gray-50" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }}>
              <Share2 className="w-3.5 h-3.5" /> Share
            </Button>
            <Button variant="outline" className={cn("h-9 gap-2 rounded-xl text-xs font-bold border", isSaved ? "bg-red-50 text-red-600 border-red-200" : "text-gray-600 hover:bg-gray-50")} onClick={() => setIsSaved(!isSaved)}>
              <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* ===== HERO SUMMARY CARD ===== */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

              {/* LEFT: Bus Name, Type, Amenities */}
              <div className="flex-1 space-y-3">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-600 text-white">
                    {schedule.bus_details?.bus_category || "Premium"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{schedule.name}</h1>
                <p className="text-sm text-gray-500 font-medium">{schedule.type} • {schedule.bus_details?.bus_type || "AC Sleeper"}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allPossibleAmenities.filter(a => hasAmenity(a)).slice(0, 5).map((am) => (
                    <span key={am} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {React.createElement(amenityIcons[am] || Wifi, { className: "w-3 h-3" })}
                      {am}
                    </span>
                  ))}
                  {busAmenities.length > 5 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                      +{busAmenities.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* CENTER: Route Timeline */}
              <div className="flex-1 flex flex-col items-center gap-2 py-3 px-4 bg-gray-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Departure</p>
                    <p className="text-lg sm:text-xl font-black text-gray-900 mt-1">{schedule.dep}</p>
                    <p className="text-[10px] font-semibold text-gray-400">{schedule.from}</p>
                  </div>
                  <div className="flex flex-col items-center flex-1 px-2">
                    <div className="w-full h-px border-t border-dashed border-gray-300 relative">
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-3">{schedule.duration} • {schedule.nonStop ? "Non Stop" : `${schedule.stops_count || 0} Stops`}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Arrival</p>
                    <p className="text-lg sm:text-xl font-black text-gray-900 mt-1">{schedule.arr}</p>
                    <p className="text-[10px] font-semibold text-gray-400">{schedule.to}</p>
                  </div>
                </div>
              </div>

              {/* RIGHT: Fare & CTA */}
              <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-4 lg:gap-3 lg:min-w-[200px]">
                <div className="text-center lg:text-left">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fare</p>
                  <p className="text-3xl lg:text-4xl font-black text-blue-600">{schedule.price}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Inclusive of taxes</p>
                </div>
                <div className="flex items-center gap-2 lg:gap-0 lg:flex-col w-full">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                    <Users className="w-3.5 h-3.5" />
                    {schedule.seats} Left
                  </span>
                  <Button onClick={handleBookNow} className="flex-1 lg:w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md">
                    Book Now
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== BUS GALLERY ===== */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[420px]">
            <img
              src={getImageUrl(busImage, schedule.bus_id || schedule.bus_details?.id)}
              alt={schedule.name}
              className="w-full h-full object-contain"
              onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="px-4 sm:px-6 py-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {allImages.map((thumb: string, tIdx: number) => (
                <div
                  key={tIdx}
                  onClick={() => setActiveImageIndex(tIdx)}
                  className={cn(
                    "w-20 h-14 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 flex-shrink-0 border-2",
                    activeImageIndex === tIdx ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <img
                    src={getImageUrl(thumb, schedule.bus_id || schedule.bus_details?.id)}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== QUICK INFORMATION ROW ===== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Bus Type", value: schedule.bus_details?.bus_type || "AC Sleeper", icon: Bus, bg: "bg-blue-50", color: "text-blue-600" },
            { label: "Capacity", value: `${schedule.bus_details?.total_seats || 45} Seats`, icon: Users, bg: "bg-purple-50", color: "text-purple-600" },
            { label: "Operator", value: schedule.bus_details?.operator || "Bhinder Bus Service", icon: User, bg: "bg-amber-50", color: "text-amber-600" },
            { label: "Driver", value: schedule.driver_name || "Not Assigned", icon: PhoneCall, bg: "bg-emerald-50", color: "text-emerald-600" },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", card.bg)}>
                  <Icon className={cn("w-5 h-5", card.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== MAIN CONTENT: 70/30 SPLIT ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ===== LEFT COLUMN (70%) ===== */}
          <div className="lg:col-span-7 space-y-6">

            {/* JOURNEY TIMELINE */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Journey Timeline
              </h3>
              <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-blue-500 bg-white shadow-sm z-10" />
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{schedule.from} - Boarding Point</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-blue-700 font-bold">{schedule.dep}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {(schedule.stops || []).map((stop: any, sIdx: number) => (
                  <div key={sIdx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-200 transition-all">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{stop.stop_name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Arr: {formatTime12h(stop.arrival_time)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            Dep: {formatTime12h(stop.departure_time)}
                          </span>
                        </div>
                      </div>
                      {stop.fare != null && (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 ml-3">
                          ₹{stop.fare}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-red-500 bg-white shadow-sm z-10" />
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50/50 border border-red-100">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{schedule.to} - Dropping Point</p>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-700 font-bold">{schedule.arr}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AMENITIES SECTION */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Bus Amenities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {allPossibleAmenities.map((amenity) => {
                  const IconComponent = amenityIcons[amenity] || Wifi;
                  const isActive = hasAmenity(amenity);
                  return (
                    <div
                      key={amenity}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all",
                        isActive ? "bg-blue-50/50 border-blue-200 text-blue-600" : "bg-gray-50/50 border-gray-100 text-gray-400"
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[10px] font-bold">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ===== RIGHT COLUMN (30%) ===== */}
          <div className="lg:col-span-5 space-y-6">

            {/* BOARDING CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Boarding Points
              </h4>
              <div className="space-y-3">
                {boardingPoints.map((bp, bpIdx) => (
                  <div key={bpIdx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-semibold text-gray-800">{bp.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{bp.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DROPPING CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Dropping Points
              </h4>
              <div className="space-y-3">
                {droppingPoints.map((dp, dpIdx) => (
                  <div key={dpIdx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold text-gray-800">{dp.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500">{dp.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DRIVER CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Driver Details
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center relative">
                  {schedule.driver_image ? (
                    <img src={schedule.driver_image} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "/bus-1.png"; }} />
                  ) : (
                    <User className="w-7 h-7 text-gray-300" />
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[7px] text-white">✓</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-900">{schedule.driver_name || "Not Assigned"}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{schedule.driver_experience || "N/A"}</p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                      Verified
                    </span>
                    {schedule.driver_rating && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        <Star className="w-2.5 h-2.5" />
                        {schedule.driver_rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BUS INFORMATION CARD */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-600" />
                Bus Information
              </h4>
              <div className="space-y-3 divide-y divide-gray-100">
                {[
                  { label: "Bus Number", val: schedule.bus_details?.bus_number || "—" },
                  { label: "Model", val: schedule.bus_details?.model || "—" },
                  { label: "Manufacturer", val: schedule.bus_details?.manufacturer || "—" },
                  { label: "Capacity", val: `${schedule.bus_details?.total_seats || 45} Seats` },
                  { label: "Fleet Owner", val: schedule.bus_details?.operator || "Bhinder Bus Service" },
                ].map((row, rIdx) => (
                  <div key={rIdx} className="flex items-center justify-between text-xs py-2.5 first:pt-0 last:pb-0">
                    <span className="font-semibold text-gray-400">{row.label}</span>
                    <span className="font-black text-gray-900">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ===== FARE SUMMARY SECTION ===== */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hidden lg:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ticket Price</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{schedule.price}</p>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-700">{schedule.seats} Seats Left</p>
                  <p className="text-[10px] text-gray-400">Hurry up!</p>
                </div>
              </div>
            </div>
            <Button onClick={handleBookNow} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200">
              Book Now <span className="ml-1">→</span>
            </Button>
          </div>
        </div>

      </main>

      {/* ===== STICKY BOTTOM BOOKING BAR (Mobile) ===== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 lg:hidden flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fare</p>
          <p className="text-lg font-black text-blue-600">{schedule.price}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Users className="w-3.5 h-3.5" />
            {schedule.seats}
          </span>
          <Button onClick={handleBookNow} className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg">
            Book Now
          </Button>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="mt-12 bg-white border-t border-gray-100 py-6 select-none mb-16 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {[
              { text: "Easy Booking", desc: "Simple & fast booking process", icon: Bus, col: "text-blue-600", bg: "bg-blue-50" },
              { text: "Best Prices", desc: "Get the best prices always", icon: Zap, col: "text-amber-500", bg: "bg-amber-50" },
              { text: "Top Rated Buses", desc: "Comfortable & safe journeys", icon: Star, col: "text-emerald-600", bg: "bg-emerald-50" },
              { text: "Customer Support", desc: "24/7 customer support", icon: Headphones, col: "text-purple-600", bg: "bg-purple-50" },
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5 justify-start md:justify-center">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border", stat.bg)}>
                    <StatIcon className={cn("w-5 h-5", stat.col)} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-gray-900 leading-none">{stat.text}</span>
                    <span className="text-[9.5px] font-semibold text-gray-400 mt-1 leading-none">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}