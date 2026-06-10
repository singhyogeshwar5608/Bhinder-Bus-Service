"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bus,
  Calendar,
  MapPin,
  Clock,
  User,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  CreditCard,
  Tag,
  Route,
  Navigation,
  Users,
  Phone,
  Mail,
  Armchair,
  Eye,
  X,
  Fuel,
  Cpu,
  Shield,
  Gauge,
  Cog,
  Wrench,
  CalendarDays,
  Ruler,
  Map,
  Timer,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { bookingService } from "@/services/booking.service";
import { cn, getImageUrl } from "@/lib/utils";

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "long",
  });
};

const formatTime12h = (timeStr: string) => {
  if (!timeStr || timeStr === "—") return "--:--";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

function RouteDetailsContent({ route, stops, depTime, arrTime, booking }: any) {
  return (
    <div className="space-y-4">
      {/* Route Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="w-3.5 h-3.5 text-orange-600" />
            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Distance</span>
          </div>
          <p className="text-sm font-black text-slate-800">{route?.distance ? `${route.distance} KM` : "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-sm font-black text-slate-800">{route?.duration || booking?.duration || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Base Fare</span>
          </div>
          <p className="text-sm font-black text-slate-800">₹{route?.total_fare || booking?.fare || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <Map className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Road Type</span>
          </div>
          <p className="text-sm font-black text-slate-800 capitalize">{route?.road_type || "—"}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        <div className="relative">
          <div className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500" />
          <p className="text-sm font-black text-slate-800">{route?.from_city || booking?.from}</p>
          <p className="text-[11px] font-bold text-slate-400">{depTime} · Start</p>
        </div>
        {stops.map((stop: any, i: number) => (
          <div key={i} className="relative">
            <div className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full border-2 border-blue-400 bg-white" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">{stop.stop_name}</p>
                <p className="text-[11px] font-bold text-slate-400">
                  {formatTime12h(stop.arrival_time)} · {formatTime12h(stop.departure_time)}
                </p>
              </div>
              {stop.fare && (
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0 ml-2">
                  ₹{Number(stop.fare).toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>
        ))}
        <div className="relative">
          <div className="absolute -left-[17px] top-1.5 w-3 h-3 rounded-full border-2 border-red-400 bg-red-400" />
          <p className="text-sm font-black text-slate-800">{route?.to_city || booking?.to}</p>
          <p className="text-[11px] font-bold text-slate-400">{arrTime} · End</p>
        </div>
      </div>
    </div>
  );
}

function BusDetailsContent({ bus, schedule }: any) {
  const busImage = bus ? getImageUrl(bus.images, bus.id) : null;

  return (
    <div className="space-y-4">
      {busImage && (
        <div className="relative w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img src={busImage} alt={bus.bus_name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Operator</p>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.operator || bus?.bus_name || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bus Type</p>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.bus_type || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reg. Number</p>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.bus_number || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Seats</p>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.total_seats || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Fuel className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fuel</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.fuel_type || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Cog className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Transmission</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.transmission_type || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Emission</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.emission_norms || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Wrench className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Body Type</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.body_type || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mfg Year</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.manufacturing_year || "—"}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Gauge className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
          </div>
          <p className="text-sm font-black text-slate-800 truncate">{bus?.bus_category || "Standard"}</p>
        </div>
      </div>

      {bus?.amenities && Array.isArray(bus.amenities) && bus.amenities.length > 0 && (
        <div className="pt-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
          <div className="flex flex-wrap gap-1.5">
            {bus.amenities.map((am: string, i: number) => (
              <span key={i} className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {am}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TrackingPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showBusModal, setShowBusModal] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = bookingId.trim().toUpperCase();
    if (!id || id.length < 3) {
      setError("Please enter a valid booking number");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const response = await bookingService.getByNumber(id);
      const data = response?.data || response;
      if (data && data.booking_number) {
        setBooking(data);
      } else {
        setBooking(null);
        setError("Booking not found. Please check the number and try again.");
      }
    } catch (err: any) {
      setBooking(null);
      const msg = err?.response?.data?.message || err?.message || "Booking not found. Please check the number and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const sched = booking?.schedule;
  const route = sched?.route;
  const bus = sched?.bus;
  const stops = route?.stops || [];
  const depTime = formatTime12h(sched?.departure_time);
  const arrTime = formatTime12h(sched?.arrival_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold hidden sm:inline">Back to Home</span>
            </button>
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              <span className="text-slate-800 font-extrabold text-lg tracking-tight">
                Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">My Booking</span>
              </span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-5xl mx-auto">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider mb-4"
            >
              <Search className="w-3.5 h-3.5" />
              Track Your Booking
            </motion.div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-3">
              Track Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600">
                Booking
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-md mx-auto">
              Enter your booking number to view your bus booking details and current status.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            <form onSubmit={handleTrack}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Tag className="w-5 h-5 text-blue-500" />
                  </div>
                  <Input
                    type="text"
                    value={bookingId}
                    onChange={(e) => { setBookingId(e.target.value); setError(""); }}
                    placeholder="Enter your booking number (e.g. BUS-XXXX1234)"
                    className="w-full h-14 pl-12 pr-4 text-base sm:text-lg font-bold rounded-2xl bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 uppercase tracking-wider shadow-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black rounded-2xl shadow-lg shadow-blue-200 text-base gap-2 flex-shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  <span className="hidden sm:inline">{loading ? "Searching..." : "Track Booking"}</span>
                </Button>
              </div>
            </form>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold mt-2 pl-1"
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* Empty State Decorative Content */}
          {!searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-12 sm:mt-16"
            >
              {/* Animated Bus SVG */}
              <div className="relative flex justify-center mb-10">
                <motion.div
                  initial={{ x: -80, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2, ease: "easeInOut" }}
                  className="relative"
                >
                  <svg className="w-32 h-20 sm:w-40 sm:h-24 text-blue-600/20" viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="10" y="15" width="120" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                    <rect x="20" y="20" width="100" height="12" rx="4" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="20" y="36" width="100" height="14" rx="4" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="60" y1="20" x2="60" y2="55" stroke="currentColor" strokeWidth="1" />
                    <line x1="80" y1="20" x2="80" y2="55" stroke="currentColor" strokeWidth="1" />
                    <circle cx="35" cy="62" r="8" stroke="currentColor" strokeWidth="2" fill="white" />
                    <circle cx="105" cy="62" r="8" stroke="currentColor" strokeWidth="2" fill="white" />
                    <rect x="130" y="20" width="18" height="30" rx="4" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="50" y1="15" x2="50" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="70" y1="15" x2="70" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="90" y1="15" x2="90" y2="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M140 20 Q148 25 140 30" stroke="currentColor" strokeWidth="1" fill="none" />
                    <path d="M10 25 Q2 30 10 35" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </motion.div>
                <motion.div
                  animate={{ rotate: [0, 15, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-1 -left-3 sm:-bottom-2 sm:-left-4"
                >
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </motion.div>
              </div>

              {/* How to Track Steps */}
              <div className="max-w-2xl mx-auto">
                <h3 className="text-center text-sm font-black text-slate-400 uppercase tracking-widest mb-6">How to Track Your Booking</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      step: "01",
                      icon: Ticket,
                      title: "Enter Booking Number",
                      desc: "Type your unique booking number starting with BUS-",
                      color: "from-blue-500 to-blue-600",
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                    },
                    {
                      step: "02",
                      icon: Search,
                      title: "Search & Verify",
                      desc: "Click Track Booking to fetch your details instantly",
                      color: "from-emerald-500 to-emerald-600",
                      bg: "bg-emerald-50",
                      text: "text-emerald-600",
                    },
                    {
                      step: "03",
                      icon: Bus,
                      title: "View Full Details",
                      desc: "See route, bus info, passengers & payment summary",
                      color: "from-purple-500 to-purple-600",
                      bg: "bg-purple-50",
                      text: "text-purple-600",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="relative text-center p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white text-[10px] font-black shadow-lg">
                        {item.step}
                      </div>
                      <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mx-auto mb-3`}>
                        <item.icon className={`w-6 h-6 ${item.text}`} />
                      </div>
                      <h4 className="text-sm font-black text-slate-800 mb-1">{item.title}</h4>
                      <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative Features Row */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-slate-300">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Clock, label: "Real-time" },
                    { icon: MapPin, label: "Accurate" },
                    { icon: Users, label: "Reliable" },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + i * 0.1, type: "spring", stiffness: 200 }}
                      className="flex items-center gap-1.5"
                    >
                      <f.icon className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[11px] font-bold text-slate-400">{f.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Decorative Wave */}
              <div className="mt-10 text-center">
                <svg className="w-full max-w-md mx-auto h-6 text-slate-200" viewBox="0 0 400 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 12 Q50 0 100 12 T200 12 T300 12 T400 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                  <circle cx="100" cy="12" r="3" fill="currentColor" />
                  <circle cx="200" cy="12" r="3" fill="currentColor" />
                  <circle cx="300" cy="12" r="3" fill="currentColor" />
                </svg>
                <p className="text-[10px] font-bold text-slate-300 mt-2">Enter your booking number above to get started</p>
              </div>
            </motion.div>
          )}

          {/* Results */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <Bus className="w-12 h-12 text-blue-500" />
                  </motion.div>
                  <p className="text-slate-500 font-semibold text-sm mt-4">Searching your booking...</p>
                </motion.div>
              ) : searched && !booking ? null
               : searched && booking ? (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  
                  {/* Booking Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">Booking Number</p>
                            <p className="text-lg font-black text-white tracking-wider">{booking.booking_number}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border",
                          booking.booking_status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                            : booking.booking_status === "cancelled"
                            ? "bg-red-500/20 text-red-200 border-red-400/30"
                            : "bg-yellow-500/20 text-yellow-200 border-yellow-400/30"
                        )}>
                          {booking.booking_status === "confirmed"
                            ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Confirmed</span>
                            : booking.booking_status === "cancelled"
                            ? <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>
                            : booking.booking_status}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</p>
                          <p className="text-lg font-black text-slate-800 truncate">{route?.from_city || booking.from}</p>
                          <p className="text-xs font-bold text-blue-600 mt-0.5">{depTime}</p>
                        </div>

                        {/* Animated Road SVG */}
                        <div className="flex-1 max-w-[200px] sm:max-w-[260px]">
                          <svg viewBox="0 0 240 80" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#334155" />
                              </linearGradient>
                              <pattern id="dashAnim" x="0" y="0" width="20" height="4" patternUnits="userSpaceOnUse">
                                <rect x="0" y="0" width="10" height="4" fill="#fbbf24">
                                  <animate attributeName="x" from="0" to="-20" dur="0.6s" repeatCount="indefinite" />
                                </rect>
                              </pattern>
                            </defs>

                            {/* Road body */}
                            <rect x="0" y="32" width="240" height="16" rx="2" fill="url(#roadGrad)" />
                            <rect x="0" y="43" width="240" height="2" fill="url(#dashAnim)" />

                            {/* Road edges */}
                            <line x1="0" y1="32" x2="240" y2="32" stroke="#475569" strokeWidth="1" />
                            <line x1="0" y1="48" x2="240" y2="48" stroke="#475569" strokeWidth="1" />

                            {/* Bus stop 1 (left) with waiting passengers */}
                            <g>
                              <rect x="25" y="20" width="6" height="12" rx="1" fill="#0ea5e9" />
                              <rect x="24" y="19" width="8" height="2" rx="0.5" fill="#0284c7" />
                              <motion.g
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                              >
                                <circle cx="23" cy="26" r="2.5" fill="#f97316" />
                                <rect x="21.5" y="28" width="3" height="4" rx="0.5" fill="#f97316" />
                              </motion.g>
                              <motion.g
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                              >
                                <circle cx="31" cy="25" r="2.5" fill="#8b5cf6" />
                                <rect x="29.5" y="27" width="3" height="5" rx="0.5" fill="#8b5cf6" />
                              </motion.g>
                            </g>

                            {/* Bus stop 2 (right) with waiting passenger */}
                            <g>
                              <rect x="195" y="20" width="6" height="12" rx="1" fill="#0ea5e9" />
                              <rect x="194" y="19" width="8" height="2" rx="0.5" fill="#0284c7" />
                              <motion.g
                                animate={{ y: [0, -2, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                              >
                                <circle cx="198" cy="25" r="2.5" fill="#10b981" />
                                <rect x="196.5" y="27" width="3" height="5" rx="0.5" fill="#10b981" />
                              </motion.g>
                            </g>

                            {/* Moving Bus */}
                            <motion.g
                              animate={{ x: [0, 240] }}
                              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            >
                              <rect x="-32" y="18" width="24" height="14" rx="3" fill="#3b82f6" />
                              <rect x="-30" y="20" width="8" height="5" rx="1" fill="#93c5fd" opacity="0.5" />
                              <rect x="-19" y="20" width="8" height="5" rx="1" fill="#93c5fd" opacity="0.5" />
                              <rect x="-29" y="27" width="18" height="3" rx="0.5" fill="#1e40af" />
                              <circle cx="-27" cy="34" r="3" fill="#1e293b" />
                              <circle cx="-27" cy="34" r="1.5" fill="#64748b" />
                              <circle cx="-12" cy="34" r="3" fill="#1e293b" />
                              <circle cx="-12" cy="34" r="1.5" fill="#64748b" />
                              <circle cx="-27" cy="34" r="3" fill="#1e293b" />
                              <rect x="-7" y="22" width="2" height="8" rx="0.5" fill="#fbbf24" />
                            </motion.g>

                            {/* Duration badge */}
                            <rect x="88" y="6" width="64" height="16" rx="8" fill="#1e293b" />
                            <text x="120" y="17" textAnchor="middle" fill="#fbbf24" fontSize="8" fontWeight="bold" fontFamily="system-ui">
                              {route?.duration || sched?.duration || "—"}
                            </text>
                          </svg>
                        </div>

                        <div className="flex-1 text-right min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To</p>
                          <p className="text-lg font-black text-slate-800 truncate">{route?.to_city || booking.to}</p>
                          <p className="text-xs font-bold text-emerald-600 mt-0.5">{arrTime}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Booking Summary (Top) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800">Booking Summary</h3>
                        <p className="text-[10px] font-bold text-slate-400">Payment & passenger details</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Summary Cards Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Journey Date</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">{formatDisplayDate(sched?.journey_date || booking.date)}</p>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0 shadow-sm">
                            <Armchair className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Seats</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">{(Array.isArray(booking.seat_numbers) ? booking.seat_numbers : []).join(", ") || "—"}</p>
                          </div>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-500 flex items-center justify-center shrink-0 shadow-sm">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Tickets</p>
                            <p className="text-xs font-black text-slate-800 mt-0.5">{booking.passenger_count || (booking.passengers ? booking.passengers.length : 0)}</p>
                          </div>
                        </motion.div>
                      </div>

                      {/* Total Amount & Booked By Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <motion.div
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.25 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                              <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Total Paid</p>
                              <p className="text-xs font-black text-slate-800 mt-0.5">Amount</p>
                            </div>
                          </div>
                          <span className="text-2xl font-black text-emerald-600 drop-shadow-sm">₹{Number(booking.total_amount).toLocaleString("en-IN")}</span>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm"
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Booked by</p>
                            <p className="text-sm font-black text-slate-800 truncate">{booking.customer_name}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-bold"><Phone className="w-3 h-3" /> {booking.customer_phone}</span>
                              {booking.customer_email && (
                                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-bold"><Mail className="w-3 h-3" /> {booking.customer_email}</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Passengers Section - Highlighted */}
                      {booking.passengers && booking.passengers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 }}
                          className="rounded-xl bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50 border-2 border-amber-200/80 shadow-md overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm font-black text-white">Passengers</span>
                              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">{booking.passengers.length}</span>
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              className="w-2 h-2 rounded-full bg-white/80"
                            />
                          </div>
                          <div className="p-3 space-y-2">
                            {booking.passengers.map((p: any, pi: number) => (
                              <motion.div
                                key={pi}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + pi * 0.08 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-amber-100 shadow-sm"
                              >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm">
                                  {p.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-black text-slate-800 truncate">{p.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{p.age} yrs</span>
                                    <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{p.gender}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">Seat</p>
                                  <motion.p
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + pi * 0.08, type: "spring", stiffness: 300 }}
                                    className="text-sm font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-lg shadow-sm"
                                  >
                                    {p.seat_number}
                                  </motion.p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Desktop: Route + Bus side by side */}
                  <div className="hidden lg:grid grid-cols-2 gap-5">
                    {/* Route Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Route className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800">Route Details</h3>
                          <p className="text-[10px] font-bold text-slate-400">Journey route & timeline</p>
                        </div>
                      </div>
                      <div className="p-5 max-h-[400px] overflow-y-auto">
                        <RouteDetailsContent route={route} stops={stops} depTime={depTime} arrTime={arrTime} booking={booking} />
                      </div>
                    </motion.div>

                    {/* Bus Details */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Bus className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-800">Bus Details</h3>
                          <p className="text-[10px] font-bold text-slate-400">Bus & operator info</p>
                        </div>
                      </div>
                      <div className="p-5 max-h-[400px] overflow-y-auto">
                        <BusDetailsContent bus={bus} schedule={sched} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Mobile: Animated Buttons */}
                  <div className="flex lg:hidden flex-col gap-3">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => setShowRouteModal(true)}
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-200 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <Route className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black">Show Route Details</p>
                          <p className="text-[10px] text-orange-100 font-semibold mt-0.5">View journey route, stops & timeline</p>
                        </div>
                        <Eye className="w-5 h-5 text-orange-200 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      onClick={() => setShowBusModal(true)}
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 active:scale-[0.98]"
                    >
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBMNDAgMjAgMjAgNDAgMCAyMFoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-50" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <Bus className="w-6 h-6" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-black">Show Bus Details</p>
                          <p className="text-[10px] text-purple-100 font-semibold mt-0.5">View bus info, amenities & specs</p>
                        </div>
                        <Eye className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Route Details Modal (Mobile) */}
      <Dialog open={showRouteModal} onOpenChange={setShowRouteModal}>
        <DialogContent className="max-w-[95%] sm:max-w-[500px] rounded-2xl bg-white p-0 overflow-hidden max-h-[85vh]">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Route className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-base font-black text-white flex-1">Route Details</DialogTitle>
            <button onClick={() => setShowRouteModal(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(85vh-72px)]">
            <RouteDetailsContent route={route} stops={stops} depTime={depTime} arrTime={arrTime} booking={booking} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Bus Details Modal (Mobile) */}
      <Dialog open={showBusModal} onOpenChange={setShowBusModal}>
        <DialogContent className="max-w-[95%] sm:max-w-[500px] rounded-2xl bg-white p-0 overflow-hidden max-h-[85vh]">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-base font-black text-white flex-1">Bus Details</DialogTitle>
            <button onClick={() => setShowBusModal(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(85vh-72px)]">
            <BusDetailsContent bus={bus} schedule={sched} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}