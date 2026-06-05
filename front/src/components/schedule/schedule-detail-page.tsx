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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScheduleDetails } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

// Time adding utility helper
const addMinutes = (timeStr: string, mins: number) => {
  if (!timeStr) return "";
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes + mins, 0, 0);

  let newHours = date.getHours();
  const newMins = date.getMinutes();
  const newAmpm = newHours >= 12 ? "PM" : "AM";

  newHours = newHours % 12;
  if (newHours === 0) newHours = 12;

  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')} ${newAmpm}`;
};

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

const getImageUrl = (path: string, busId?: number) => {
  if (!path) return `/bus-${busId || 1}.png`;
  
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  const storageUrl = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
  return `${storageUrl}/${cleanPath}`;
};



export function ScheduleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: schedule, isLoading, error } = useScheduleDetails(id);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Compute allImages unconditionally at the top level to follow React Rules of Hooks
  const dbImages = schedule?.images || [];
  const allImages = dbImages.length > 0 ? dbImages : ["buses/bus-1.png"];
  const busImage = allImages[activeImageIndex] || allImages[0] || "";

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 4000); // Slide every 4 seconds
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
        <div className="max-w-md p-6 bg-white rounded-2xl border border-gray-150 text-center shadow-xs">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Schedule Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn't retrieve the details for this schedule. It may have been canceled or removed.
          </p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Format Date for Display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Amenities Icon Mapping
  const amenityIcons: Record<string, any> = {
    "Wi-Fi": Wifi,
    "Wifi": Wifi,
    "Charging Point": Zap,
    "Blanket": Layers,
    "Water Bottle": Droplet,
    "Reading Light": Lightbulb,
    "A/C": Wind,
    "AC": Wind,
    "CCTV": Tv,
    "GPS Tracking": MapPin,
    "Emergency Exit": Shield,
    "Fire Extinguisher": Lock,
    "Snacks": Coffee,
    "Pillow": Layers,
  };

  const allPossibleAmenities = [
    "Wi-Fi", "Charging Point", "Blanket", "Water Bottle", "Reading Light",
    "AC", "CCTV", "GPS Tracking", "Emergency Exit", "Fire Extinguisher"
  ];

  const busAmenities = schedule.amenities || [];
  const hasAmenity = (name: string) => {
    return busAmenities.some((a: string) => a.toLowerCase().includes(name.toLowerCase()));
  };

  // Boarding and Dropping points computed dynamically from database stops
  const boardingPoints = [
    { name: `${schedule.from} (Start)`, time: schedule.dep },
    ...(schedule.stops || [])
      .filter((stop: any) => stop.stop_name.toLowerCase() !== schedule.to.toLowerCase())
      .map((stop: any) => ({
        name: stop.stop_name,
        time: formatTime12h(stop.departure_time || stop.arrival_time)
      }))
  ];

  const droppingPoints = [
    { name: `${schedule.to} (Destination)`, time: schedule.arr }
  ];

  // Images already processed unconditionally at the top level

  // Handles redirecting to booking search page pre-configured
  const handleBookNow = () => {
    const searchParams = {
      from: schedule.from,
      to: schedule.to,
      date: schedule.date,
      passengers: 1,
    };
    localStorage.setItem("search_params", JSON.stringify(searchParams));
    localStorage.setItem("selected_schedule_id", String(schedule.id));
    navigate("/booking");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Navbar header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">BusBook</span>
          </div>
          <nav className="hidden lg:flex items-center gap-1">
            {["Home", "Buses", "Routes", "Offers", "Track Booking", "Help"].map((link, i) => (
              <button
                key={link}
                onClick={() => {
                  if (i === 0) navigate("/");
                  if (i === 1) navigate("/buses");
                  if (i === 2) navigate("/routes");
                }}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  i === 0 ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                )}
              >
                {link}
              </button>
            ))}
          </nav>
          <Button onClick={() => navigate("/booking")} className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full shadow-lg shadow-blue-200">
            Book Now
          </Button>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        
        {/* Navigation / Header Actions Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Schedules
          </button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-xl text-xs font-bold border-gray-250 text-gray-600 hover:bg-gray-50"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Schedule link copied to clipboard!");
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button
              variant="outline"
              className={cn(
                "h-9 gap-2 rounded-xl text-xs font-bold border-gray-250",
                isSaved ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
              )}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Hero Section Container */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#0b2240] text-white p-6 sm:p-8 min-h-[300px] border border-slate-700 shadow-md">
          {/* Integrated Bus Background Image */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img
              src={getImageUrl(busImage, schedule.bus_id || schedule.bus_details?.id)}
              alt={schedule.name}
              className="absolute inset-0 w-full h-full object-cover object-right"
              onError={(e) => {
                // Try fallback to local front/public/bus-1.png
                e.currentTarget.src = "/bus-1.png";
              }}
            />
            {/* Smooth gradient fade to deep blue on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b2240] via-[#0b2240]/50 via-[18%] to-transparent" />
            {/* Dark overlay on mobile to keep text legible */}
            <div className="absolute inset-0 bg-[#0b2240]/25 lg:hidden" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 h-full">
            {/* Hero Left Column: Core Info */}
            <div className="flex-1 space-y-6 text-left w-full lg:max-w-2xl">
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-blue-600 text-white select-none">
                  {schedule.bus_details?.bus_category || "Premium"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{schedule.name}</h1>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold">{schedule.type} • Premium Coach</p>
              </div>

              {/* Timings / Locations timeline header */}
              <div className="flex items-center gap-4 text-white">
                <span className="text-xl sm:text-2xl font-black">{schedule.from}</span>
                <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <svg className="w-12 sm:w-16 h-4 text-blue-500" viewBox="0 0 60 16" fill="none">
                    <path d="M0,8 C15,0 15,16 30,8 C45,0 45,16 60,8" stroke="currentColor" strokeWidth="2.5" strokeDasharray="3 3" />
                    <polygon points="54,4 60,8 54,12" fill="currentColor" />
                  </svg>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
                <span className="text-xl sm:text-2xl font-black">{schedule.to}</span>
              </div>

              {/* Departure/Arrival info */}
              <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-4 max-w-xl">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Departure</p>
                  <p className="text-base sm:text-lg font-black mt-1">{schedule.dep}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-semibold">{formatDisplayDate(schedule.date)}</p>
                </div>
                <div className="text-center flex flex-col justify-center border-x border-slate-700/50 px-2">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Duration</p>
                  <p className="text-sm font-black mt-1">{schedule.duration}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-semibold">180 KM • {schedule.nonStop ? "Non Stop" : `${schedule.stops_count} Stops`}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Arrival</p>
                  <p className="text-base sm:text-lg font-black mt-1">{schedule.arr}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-semibold">{formatDisplayDate(schedule.date)}</p>
                </div>
              </div>

              {/* Quick status badges */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-800 border border-slate-700">
                  <span className={cn("w-2 h-2 rounded-full", schedule.nonStop ? "bg-emerald-500" : "bg-orange-500")} />
                  {schedule.nonStop ? "Non Stop" : `${schedule.stops_count} Stops`}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  {schedule.seats} Seats Left
                </span>
              </div>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block w-[30%] shrink-0" />
          </div>

          {/* Overlay Thumbnail interior details widget inside hero bottom-right */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/45 backdrop-blur-xs p-1.5 rounded-xl border border-white/10 select-none">
            {allImages.slice(0, 4).map((thumb: string, tIdx: number) => (
              <div 
                key={tIdx} 
                onClick={() => setActiveImageIndex(tIdx)}
                className={cn(
                  "w-12 h-9 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2",
                  activeImageIndex === tIdx ? "border-blue-500 scale-105 shadow-md" : "border-white/20 hover:border-white/50"
                )}
              >
                <img 
                  src={getImageUrl(thumb, schedule.bus_id || schedule.bus_details?.id)} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    e.currentTarget.src = "/bus-1.png";
                  }}
                />
              </div>
            ))}
            {allImages.length > 4 && (
              <div className="w-10 h-9 rounded-lg border border-white/20 bg-black/60 flex items-center justify-center shadow-md select-none">
                <span className="text-[11px] font-black text-white">+{allImages.length - 4}</span>
              </div>
            )}
          </div>
        </section>

        {/* 2-Column Responsive Page Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2-COLUMNS: Timeline, Amenities, Driver, Details, Points */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* 1. Journey Timeline Widget */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs text-left">
              <h3 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Journey Timeline
              </h3>
              
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">

                {/* Starting Boarding Point */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-blue-500 bg-white shadow-sm z-10" />
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-950 truncate">{schedule.from} Central</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Dep: {schedule.dep}</span>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                          Boarding Point
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Intermediate passing points (Stops dynamically fetched) */}
                {schedule.stops && schedule.stops.map((stop: any, sIdx: number) => (
                  <div key={sIdx} className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-950 truncate">{stop.stop_name}</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Arr: {formatTime12h(stop.arrival_time)}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Dep: {formatTime12h(stop.departure_time)}</span>
                          </div>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-150">
                            Intermediate Stop
                          </span>
                        </div>
                      </div>
                      {stop.fare !== undefined && stop.fare !== null && (
                        <div className="text-right ml-4">
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                            ₹{stop.fare}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Destination Dropping Point */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-red-500 bg-white shadow-sm z-10" />
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-red-200 hover:shadow-sm transition-all group">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-950 truncate">{schedule.to} Swargate</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                        <div className="flex items-center gap-1 bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span>Arr: {schedule.arr}</span>
                        </div>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold text-red-600 bg-red-50 border border-red-100">
                          Dropping Point
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Bus Amenities Widget */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs text-left">
              <h3 className="text-base font-black text-gray-900 mb-5">Bus Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {allPossibleAmenities.map((amenity) => {
                  const IconComponent = amenityIcons[amenity] || Wifi;
                  const isActive = hasAmenity(amenity);
                  return (
                    <div
                      key={amenity}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all",
                        isActive
                          ? "bg-blue-50/50 border-blue-150 text-blue-600 shadow-2xs"
                          : "bg-gray-50/50 border-gray-100 text-gray-400"
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-[10px] font-black tracking-wide">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Driver & Bus Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Details Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs text-left flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-black text-gray-900">Driver Details</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center relative">
                      {schedule.driver_image ? (
                        <img src={schedule.driver_image} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-300" />
                      )}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[7px] text-white">✓</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-black text-gray-900">{schedule.driver_name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{schedule.driver_experience}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                          Verified Driver
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                          License Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Rating score */}
                <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-gray-100 text-xs font-semibold text-gray-500">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-gray-900 font-black">{schedule.driver_rating}</span>
                  <span>(1,245 Trips)</span>
                </div>
              </div>

              {/* Bus Specifications Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs text-left flex flex-col justify-between">
                <h3 className="text-base font-black text-gray-900 mb-4.5">Bus Information</h3>
                <div className="space-y-3 divide-y divide-gray-100">
                  {[
                    { label: "Bus Number", val: schedule.bus_details?.bus_number },
                    { label: "Bus Type", val: schedule.bus_details?.bus_type },
                    { label: "Seating Capacity", val: `${schedule.bus_details?.total_seats || 45} Seats` },
                    { label: "Manufacturer", val: schedule.bus_details?.manufacturer || "Bharat Benz" },
                    { label: "Model", val: schedule.bus_details?.model || "Sleeper Coach" },
                    { label: "Fleet Owner", val: schedule.bus_details?.operator || "Bhinder Bus Service" },
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center justify-between text-xs py-2 first:pt-0 last:pb-0">
                      <span className="font-semibold text-gray-400">{row.label}</span>
                      <span className="font-black text-gray-950">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>

          {/* RIGHT 1-COLUMN: Booking Card widget */}
          <div className="space-y-6 flex flex-col text-left">
            
            {/* Ticket Booking Card Widget */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col gap-6">
              
              {/* Ticket Fare Display */}
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fare</p>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-3xl font-black text-blue-600">{schedule.price}</span>
                  <span className="text-xs text-gray-400 font-semibold">Inclusive of all taxes</span>
                </div>
              </div>

              {/* Status banner remaining seats */}
              <div className="flex items-center gap-3.5 p-3.5 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-emerald-700">{schedule.seats} Seats Left</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Hurry up! Seats are filling fast</p>
                </div>
              </div>

              {/* Detailed specs list of schedule */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Trip Details</h4>
                <div className="space-y-3.5 divide-y divide-gray-100">
                  {[
                    { label: "Distance", val: "180 KM" },
                    { label: "Duration", val: schedule.duration },
                    { label: "Stops", val: schedule.nonStop ? "Non Stop" : `${schedule.stops_count} Stops` },
                    { label: "Boarding Time", val: schedule.dep },
                    { label: "Dropping Time", val: schedule.arr },
                    { label: "Journey Date", val: formatDisplayDate(schedule.date) },
                    { label: "Bus Type", val: schedule.bus_details?.bus_category || "AC Sleeper" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs py-2.5 first:pt-0 last:pb-0">
                      <span className="font-semibold text-gray-400">{item.label}</span>
                      <span className="font-black text-gray-900">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Booking Button */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleBookNow}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl gap-2 flex items-center justify-center shadow-lg shadow-blue-100 transition-all hover:scale-102 active:scale-98"
                >
                  Book Now
                  <span className="text-sm font-black">→</span>
                </Button>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Secure & Safe Booking
                </div>
              </div>

            </div>

            {/* Why Choose Us Widget */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs flex flex-col gap-5">
              <h3 className="text-sm font-black text-gray-900">Why Choose Us?</h3>
              <div className="space-y-4">
                {[
                  { title: "Verified Operators", desc: "Trusted & verified bus partners", icon: CheckCircle, col: "text-blue-600", bg: "bg-blue-50" },
                  { title: "Live Tracking", desc: "Track your bus in real-time", icon: MapPin, col: "text-purple-600", bg: "bg-purple-50" },
                  { title: "Secure Booking", desc: "Safe & secure payment", icon: Shield, col: "text-pink-600", bg: "bg-pink-50" },
                  { title: "24/7 Support", desc: "We are here to help you", icon: Headphones, col: "text-cyan-600", bg: "bg-cyan-50" },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", item.bg)}>
                        <ItemIcon className={cn("w-4.5 h-4.5", item.col)} />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <p className="text-xs font-black text-gray-900">{item.title}</p>
                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Boarding & Dropping Points Table */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-150 shadow-xs text-left">
              <h3 className="text-sm font-black text-gray-900 mb-5">Boarding & Dropping Points</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                
                {/* Boarding Points Column */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-600 pb-2.5 border-b border-gray-100">
                    <span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-[10px]">🏢</span>
                    Boarding Points
                  </div>
                  <div className="space-y-3">
                    {boardingPoints.map((bp, bpIdx) => (
                      <div key={bpIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="font-black text-gray-800">{bp.name}</span>
                        </div>
                        <span className="font-bold text-gray-500">{bp.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dropping Points Column */}
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2 text-xs font-black text-red-500 pb-2.5 border-b border-gray-100">
                    <span className="w-5 h-5 rounded bg-red-50 flex items-center justify-center text-[10px]">🏠</span>
                    Dropping Points
                  </div>
                  <div className="space-y-3">
                    {droppingPoints.map((dp, dpIdx) => (
                      <div key={dpIdx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          <span className="font-black text-gray-800">{dp.name}</span>
                        </div>
                        <span className="font-bold text-gray-500">{dp.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Trust factors bottom footer features bar */}
      <footer className="mt-12 bg-white border-t border-gray-100 py-6 select-none">
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
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-transparent", stat.bg)}>
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
