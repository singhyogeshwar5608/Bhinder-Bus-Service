"use client";

import React, { useState, useEffect } from "react";
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Search,
  Sparkles,
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  Info,
  Shield,
  Lock,
  RotateCcw,
  Headphones,
  FileText,
  Settings,
  Settings2,
  Cpu,
  Fuel,
  Activity,
  Wind,
  User,
  ShieldCheck,
  Wifi,
  Clock,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePublicBuses } from "@/hooks/use-search";
import { cn, getImageUrl } from "@/lib/utils";

export function PublicBusesPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fromCityFilter, setFromCityFilter] = useState("");
  const [toCityFilter, setToCityFilter] = useState("");
  const [busTypeFilter, setBusTypeFilter] = useState("");

  const { data: buses, isLoading: loadingBuses } = usePublicBuses();
  const [viewingBus, setViewingBus] = useState<any>(null);
  const [expandedBusIds, setExpandedBusIds] = useState<number[]>([]);
  const [activeBusImage, setActiveBusImage] = useState<{ busId: number; img: string } | null>(null);

  const toggleBusExpand = (e: React.MouseEvent, busId: number, images?: any) => {
    e.stopPropagation();
    const willExpand = !expandedBusIds.includes(busId);
    setExpandedBusIds(prev =>
      willExpand ? [...prev, busId] : prev.filter(id => id !== busId)
    );
    if (willExpand) {
      const imgArr = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images || '[]') : []);
      if (imgArr.length > 0) {
        setActiveBusImage({ busId, img: imgArr[0] });
      }
    }
  };

  // Extract unique origin, destination cities, and types served by any bus
  const fromCities = Array.from(new Set(buses?.flatMap((b: any) => b.from_cities || []) || [])) as string[];
  const toCities = Array.from(new Set(buses?.flatMap((b: any) => b.to_cities || []) || [])) as string[];
  const busTypes = Array.from(new Set(buses?.map((b: any) => b.type) || [])) as string[];

  // Filter buses based on selected filters
  const filteredBuses = buses?.filter((bus: any) => {
    const matchesFrom = fromCityFilter ? bus.from_cities?.includes(fromCityFilter) : true;
    const matchesTo = toCityFilter ? bus.to_cities?.includes(toCityFilter) : true;
    const matchesType = busTypeFilter ? bus.type === busTypeFilter : true;
    return matchesFrom && matchesTo && matchesType;
  });

  const handleBookNow = (bus: any) => {
    // Save defaults to localStorage for search params
    const searchParams = {
      from: "Delhi",
      to: "Jaipur",
      date: new Date().toISOString().split("T")[0],
      passengers: 1,
    };
    localStorage.setItem("search_params", JSON.stringify(searchParams));
    navigate("/booking");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.png" alt="Logo" className="h-18 object-contain" />
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {["Home", "Buses", "Routes", "Track Booking"].map(
                (link, i) => (
                  <button
                    key={link}
                    onClick={() => {
                      if (i === 0) navigate("/");
                      if (i === 1) navigate("/buses");
                      if (i === 2) navigate("/routes");
                      if (i === 3) navigate("/track");
                    }}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      i === 1
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    {link}
                  </button>
                )
              )}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                className="relative h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
                onClick={() => {
                  localStorage.setItem("scroll_to_schedules", "true");
                  navigate("/");
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {["Home", "Buses", "Routes", "Track Booking"].map(
                (link, i) => (
                  <a
                    key={link}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (i === 0) navigate("/");
                      if (i === 1) navigate("/buses");
                      if (i === 2) navigate("/routes");
                      if (i === 3) navigate("/track");
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "block px-3 py-2.5 text-sm font-medium rounded-lg",
                      i === 1
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    )}
                  >
                    {link}
                  </a>
                )
              )}
              <div className="pt-3">
                <Button
                  className="relative h-11 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  onClick={() => {
                    localStorage.setItem("scroll_to_schedules", "true");
                    navigate("/");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO BANNER ═══ */}
      <section className="relative pt-20 pb-12 bg-slate-950 text-white overflow-hidden select-none">
        {/* Dynamic Glowing Background Blobs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
        
        {/* Fine grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Dynamic Road & Speedlines SVG Background (Stretches across screen) */}
        <div className="absolute inset-0 z-0 opacity-25 lg:opacity-40 pointer-events-none">
          <svg viewBox="0 0 1440 320" fill="none" className="w-full h-full object-cover object-bottom">
            <defs>
              <linearGradient id="roadGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* The Road shape */}
            <path d="M 0 320 Q 360 220 720 250 T 1440 280 L 1440 320 L 0 320 Z" fill="url(#roadGrad)" />
            {/* Highway Centerline */}
            <path d="M 0 320 Q 360 220 720 250 T 1440 280" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="15 25" opacity="0.6" />
            {/* Speed trails */}
            <path d="M -50 240 Q 320 180 700 190 T 1490 220" stroke="url(#glowGrad)" strokeWidth="3" opacity="0.7" />
            <path d="M -100 200 Q 300 150 710 160 T 1540 200" stroke="url(#glowGrad)" strokeWidth="1.5" strokeDasharray="10 30" opacity="0.4" />
            <path d="M 50 280 Q 400 240 730 230 T 1390 260" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title & Text Info */}
            <div className="lg:col-span-7 text-left space-y-5">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                World-Class Journeys
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white animate-fade-in">
                Our Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Fleet</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-350 max-w-xl font-medium leading-relaxed">
                Browse our world-class coaches and sleeper buses equipped with state-of-the-art amenities. Experience comfort, safety, and punctuality on every ride.
              </p>

              {/* Little trust indicators inside hero */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Wi-Fi Enabled</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Full A/C sleeper</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>GPS Tracking</span>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Coach Bus Illustration (Shown on all viewports) */}
            <div className="col-span-1 lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative w-full h-[180px] sm:h-[220px] flex items-center justify-center">
                {/* Glowing aura around illustration */}
                <div className="absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] rounded-full bg-blue-600/20 blur-[40px] sm:blur-[60px] pointer-events-none" />

                {/* Stylish Premium Coach SVG Illustration */}
                <svg viewBox="0 0 400 200" fill="none" className="w-full max-w-[320px] sm:max-w-none h-full drop-shadow-2xl filter drop-shadow-[0_10px_15px_rgba(59,130,246,0.3)]">
                  <defs>
                    <linearGradient id="busBodyGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="50%" stopColor="#1d4ed8" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient id="windshieldGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lightBeamGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Ground Shadow */}
                  <ellipse cx="200" cy="180" rx="160" ry="10" fill="#000000" opacity="0.45" />

                  {/* Rear Wheel Shadow & Light Glow */}
                  <circle cx="90" cy="165" r="28" fill="#1e293b" opacity="0.3" />
                  <circle cx="310" cy="165" r="28" fill="#1e293b" opacity="0.3" />

                  {/* Bus Body Base */}
                  <path d="M 40 80 C 40 55, 60 40, 80 40 L 330 40 C 350 40, 365 52, 365 72 L 365 155 C 365 162, 358 168, 350 168 L 335 168 C 335 152, 320 138, 305 138 C 290 138, 275 152, 275 168 L 130 168 C 130 152, 115 138, 100 138 C 85 138, 70 152, 70 168 L 50 168 C 45 168, 40 163, 40 155 Z" fill="url(#busBodyGrad)" />

                  {/* Side Accent Chrome/Silver Stripe */}
                  <path d="M 60 115 Q 180 120, 320 100 C 345 96, 360 88, 362 82" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  <path d="M 70 122 Q 180 126, 310 112" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

                  {/* Windshield (Front) */}
                  <path d="M 325 45 L 350 45 C 358 45, 363 52, 363 62 L 361 90 L 325 90 Z" fill="url(#windshieldGrad)" />
                  <path d="M 328 48 L 348 48 C 353 48, 356 52, 356 58 L 354 82 L 328 82 Z" fill="#ffffff" opacity="0.15" />

                  {/* Side Windows Grid */}
                  <path d="M 85 48 H 135 V 90 H 85 Z" fill="#0f172a" />
                  <path d="M 142 48 H 192 V 90 H 142 Z" fill="#0f172a" />
                  <path d="M 199 48 H 249 V 90 H 199 Z" fill="#0f172a" />
                  <path d="M 256 48 H 318 V 90 H 256 Z" fill="#0f172a" />

                  {/* Gloss / Reflection Overlay on Windows */}
                  <path d="M 85 48 L 115 48 L 85 90 Z" fill="url(#glassGrad)" />
                  <path d="M 142 48 L 172 48 L 142 90 Z" fill="url(#glassGrad)" />
                  <path d="M 199 48 L 229 48 L 199 90 Z" fill="url(#glassGrad)" />
                  <path d="M 256 48 L 290 48 L 256 90 Z" fill="url(#glassGrad)" />

                  {/* Wheels (Detailed with chrome rims) */}
                  {/* Wheel 1 (Front-Rightish) */}
                  <circle cx="100" cy="165" r="24" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
                  <circle cx="100" cy="165" r="13" fill="#94a3b8" />
                  <circle cx="100" cy="165" r="6" fill="#f1f5f9" />
                  {/* Wheel 2 (Rear) */}
                  <circle cx="305" cy="165" r="24" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
                  <circle cx="305" cy="165" r="13" fill="#94a3b8" />
                  <circle cx="305" cy="165" r="6" fill="#f1f5f9" />

                  {/* Headlights (Front side) & Glowing Light Beams */}
                  <path d="M 363 125 H 365 V 132 H 363 Z" fill="#fef08a" />
                  {/* Light Beam */}
                  <polygon points="365,123 450,90 450,170 365,134" fill="url(#lightBeamGrad)" />

                  {/* Tail Lights (Rear side) */}
                  <path d="M 40 120 H 42 V 135 H 40 Z" fill="#ef4444" />

                  {/* Roof air conditioner / design accents */}
                  <path d="M 130 40 L 260 40 L 250 34 L 140 34 Z" fill="#1e3a8a" />
                  <path d="M 275 40 L 305 40 L 300 36 L 280 36 Z" fill="#3b82f6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN SEARCH & LISTING ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Filters Container */}
        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-2xl border border-gray-100 shadow-md p-3 sm:p-5">
          <div className="grid grid-cols-2 lg:flex lg:flex-row items-end gap-3 lg:gap-4">
            
            {/* From City Filter */}
            <div className="col-span-1 lg:flex-1 space-y-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">From City</label>
              <select
                value={fromCityFilter}
                onChange={(e) => setFromCityFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Origin</option>
                {fromCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* To City Filter */}
            <div className="col-span-1 lg:flex-1 space-y-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">To City</label>
              <select
                value={toCityFilter}
                onChange={(e) => setToCityFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Destination</option>
                {toCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Bus Type Filter */}
            <div className="col-span-2 lg:flex-1 space-y-1 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bus Type</label>
              <select
                value={busTypeFilter}
                onChange={(e) => setBusTypeFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Bus Types</option>
                {busTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(fromCityFilter || toCityFilter || busTypeFilter) && (
              <div className="col-span-2 lg:shrink-0 lg:w-auto">
                <Button
                  onClick={() => {
                    setFromCityFilter("");
                    setToCityFilter("");
                    setBusTypeFilter("");
                  }}
                  variant="outline"
                  className="w-full lg:w-auto h-10 px-4 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl gap-2 font-semibold text-xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Buses Listing */}
        {loadingBuses ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 h-[100px] animate-pulse flex items-center gap-4" >
                <div className="w-24 h-16 bg-gray-150 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-150 rounded w-1/3" />
                  <div className="h-3 bg-gray-150 rounded w-1/2" />
                </div>
                <div className="w-28 h-8 bg-gray-150 rounded-lg shrink-0 hidden md:block" />
              </div>
            ))}
          </div>
        ) : filteredBuses?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No buses found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any buses matching the selected route or category filters. Please try resetting your choices.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBuses?.map((bus: any) => {
              const firstLetter = bus.operator.charAt(0);
              const isExpanded = expandedBusIds.includes(bus.id);

              return (
                <div
                  key={bus.id}
                  onClick={(e) => toggleBusExpand(e, bus.id, bus.images)}
                  className={cn(
                    "bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer",
                    isExpanded && "border-blue-300 ring-1 ring-blue-50/50 shadow-md"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                    {/* Top Row for Mobile (Image + Operator Info) */}
                    <div className="flex items-center gap-3 lg:contents">
                      {/* Bus Image Thumbnail */}
                      <div className="w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-gray-150 bg-gray-50 shrink-0 shadow-xs">
                        <img
                          src={getImageUrl(bus.images, bus.id)}
                          alt={bus.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                        />
                      </div>

                      {/* Brand/Operator Column */}
                      <div className="flex-1 lg:w-[200px] shrink-0 text-left">
                        <div className="flex flex-col mb-0.5">
                          <span className="text-xs sm:text-sm font-black text-blue-600 block leading-tight">{bus.name}</span>
                          <span className="text-[10px] text-violet-600 font-bold">{bus.operator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Activity className="w-2.5 h-2.5 text-gray-400" />
                            <p className="text-[10px] text-black font-semibold uppercase">{bus.number}</p>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Safe</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                            <Wifi className="w-2.5 h-2.5" />
                            <span>Wi-Fi</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Punctual</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />
                            <span>Best Price</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Section for Mobile (Type + Seats) */}
                    <div className="grid grid-cols-2 lg:flex lg:flex-row gap-3 lg:gap-6 border-y lg:border-none border-gray-50 py-2 lg:py-0">
                      {/* Specifications Section */}
                      <div className="lg:w-[150px] shrink-0 text-left flex items-start gap-2">
                        <div className="p-1.5 rounded bg-emerald-50 text-emerald-600">
                          <Fuel className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-emerald-600 leading-tight">{bus.type}</p>
                          <p className="text-[10px] text-black font-semibold mt-0.5">Vehicle Type</p>
                        </div>
                      </div>

                      <div className="lg:w-[130px] shrink-0 text-left flex items-start gap-2">
                        <div className="p-1.5 rounded bg-indigo-50 text-indigo-600">
                          <Users className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-indigo-600 leading-tight">{bus.seats} Seats</p>
                          <p className="text-[10px] text-black font-semibold mt-0.5">Capacity</p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities List */}
                    <div className="flex-1 min-w-0 text-left hidden sm:block">
                      <div className="flex flex-wrap gap-1">
                        {bus.amenities.slice(0, 4).map((amenity: string) => (
                          <span
                            key={amenity}
                            className="text-[9px] text-black bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded font-semibold"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Details CTA Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 lg:ml-auto lg:shrink-0 pt-1 lg:pt-0">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <Settings2 className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] text-black font-semibold">Premium</span>
                      </div>
                      <Button
                        className={cn(
                          "text-[11px] font-bold rounded-lg px-4 h-8 shadow-sm transition-all w-32 lg:w-auto",
                          isExpanded 
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200" 
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        onClick={(e) => toggleBusExpand(e, bus.id, bus.images)}
                      >
                        {isExpanded ? "Hide" : "View Details"}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-4 pt-4 border-t border-gray-150 space-y-4 cursor-default text-left select-none animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                      {/* 3-Column Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Column 1 - Primary Image & Thumbnails */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-600 rounded-full" />
                            Vehicle Photos
                          </h4>
                          <div className="w-full max-h-[300px] rounded-xl overflow-hidden border border-gray-150 bg-gray-100 shadow-2xs flex items-center justify-center">
                            <img 
                              src={getImageUrl(activeBusImage?.busId === bus.id ? activeBusImage?.img : bus.images, bus.id)} 
                              alt={bus.name} 
                              className="w-full h-full object-cover max-h-[300px]" 
                              onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                            />
                          </div>
                          {/* Additional Thumbnails */}
                          {(() => {
                            const imgs = Array.isArray(bus.images) ? bus.images : (typeof bus.images === 'string' ? JSON.parse(bus.images || '[]') : []);
                            return imgs.length > 1 ? (
                              <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                                {imgs.map((img: string, idx: number) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setActiveBusImage({ busId: bus.id, img }); }}
                                    className={cn(
                                      "w-10 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-200",
                                      (activeBusImage?.busId === bus.id && activeBusImage?.img === img)
                                        ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100 hover:border-gray-400 opacity-70 hover:opacity-100"
                                    )}
                                  >
                                    <img 
                                      src={getImageUrl(img, bus.id)} 
                                      alt="Thumbnail" 
                                      className="w-full h-full object-cover" 
                                      onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>

                        {/* Column 2 - Technical Specifications */}
                        <div className="lg:col-span-1">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <div className="w-1 h-3 bg-blue-600 rounded-full" />
                            Vehicle Specs
                          </h4>
                          <div className="grid grid-cols-3 lg:grid-cols-2 gap-1.5 sm:gap-2">
                            {[
                              { label: "Operator", value: bus.operator || "N/A", icon: User, color: "text-indigo-600", bg: "bg-indigo-50/40" },
                              { label: "Layout", value: bus.layout_type || "N/A", icon: Settings2, color: "text-rose-600", bg: "bg-rose-50/40" },
                              { label: "Reg No.", value: bus.bus_number || bus.number, icon: FileText, color: "text-blue-600", bg: "bg-blue-50/50" },
                              { label: "Type", value: bus.bus_type || bus.type, icon: Bus, color: "text-purple-600", bg: "bg-purple-50/50" },
                              { label: "Seats", value: `${bus.total_seats || bus.seats}`, icon: Users, color: "text-amber-600", bg: "bg-amber-50/50" },
                              { label: "Fuel", value: bus.fuel_type || "N/A", icon: Fuel, color: "text-orange-650", bg: "bg-orange-50/50" },
                            ].map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={idx} className={cn("flex flex-col min-[400px]:flex-row items-center min-[400px]:items-start gap-1 min-[400px]:gap-2 p-1.5 rounded-lg border border-gray-100 bg-slate-50/30", item.bg)}>
                                  <div className="w-5 h-5 min-[400px]:w-6 min-[400px]:h-6 rounded bg-white flex items-center justify-center border border-gray-100 shrink-0">
                                    <ItemIcon className={cn("w-2.5 h-2.5 min-[400px]:w-3 min-[400px]:h-3", item.color)} />
                                  </div>
                                  <div className="min-w-0 flex-1 text-center min-[400px]:text-left">
                                    <span className="block text-[7px] min-[400px]:text-[8px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-0.5">{item.label}</span>
                                    <span className="block text-[9px] min-[400px]:text-[11px] font-bold text-gray-700 truncate">{item.value}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 3 - Compliance & Amenities */}
                        <div className="space-y-3 lg:col-span-1">
                          {/* Documents */}
                          <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <div className="w-1 h-3 bg-blue-600 rounded-full" />
                              Compliance
                            </h4>
                            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 sm:gap-2">
                              {[
                                { label: "Insurance", number: bus.insurance_number, valid: bus.insurance_valid_till },
                                { label: "Fitness", number: bus.fitness_certificate_number, valid: bus.fitness_valid_till },
                                { label: "PUC", number: bus.puc_number, valid: bus.puc_valid_till },
                              ].map((item, idx) => (
                                <div key={idx} className="p-1.5 min-[400px]:p-2 rounded-lg border border-gray-100 bg-slate-50/20 flex flex-col justify-between shadow-2xs">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[8px] min-[400px]:text-[9px] font-bold text-gray-800 leading-tight">{item.label}</span>
                                    <span className={cn(
                                      "hidden min-[400px]:block text-[7px] min-[400px]:text-[8px] font-black uppercase",
                                      item.valid && new Date(item.valid) < new Date() ? "text-red-500" : "text-emerald-600"
                                    )}>
                                      {item.valid ? "Active" : "N/A"}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-col min-[400px]:flex-row min-[400px]:items-center justify-between text-[7px] min-[400px]:text-[8px] text-gray-400">
                                    <span className="truncate max-w-full min-[400px]:max-w-[60px]">{item.number || "N/A"}</span>
                                    <span className="font-bold hidden min-[400px]:block">{item.valid ? new Date(item.valid).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }) : ""}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Amenities */}
                          <div>
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                              <div className="w-1 h-3 bg-blue-600 rounded-full" />
                              Comfort
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {bus.amenities && bus.amenities.length > 0 ? (
                                bus.amenities.map((am: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-600 border border-blue-100/50 text-[9px] px-1.5 py-0">
                                    {am}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-400 font-medium">No amenities</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ═══ TRUST GUARANTEES ═══ */}
      <section className="bg-white py-12 border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, bg: "bg-blue-50", color: "text-blue-600", title: "100% Secure Tickets", desc: "Verifiable safety certification" },
              { icon: Lock, bg: "bg-green-50", color: "text-green-600", title: "PCI DSS Transactions", desc: "Secure encrypted channels" },
              { icon: RotateCcw, bg: "bg-red-50", color: "text-red-500", title: "Instant Refund Guarantee", desc: "No questions asked policy" },
              { icon: Headphones, bg: "bg-purple-50", color: "text-purple-600", title: "Fleet Hotline Support", desc: "Direct operator connection" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.title} className="flex items-center gap-3.5">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs", badge.bg)}>
                    <Icon className={cn("w-5.5 h-5.5", badge.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-tight">{badge.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-slate-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
              </div>
              <p className="text-sm text-gray-400 mb-4 font-light">
                Connecting India's cities with comfortable, safe, and modern travels. Your safety is our absolute priority.
              </p>
              <div className="flex items-center gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Company</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["About Us", "Careers", "Press", "Blog"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate("/")} className="hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Help & Support</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {["FAQs", "Contact Us", "Terms & Conditions", "Privacy Policy", "Refund Policy"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate("/")} className="hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider text-xs">Install App</h3>
              <p className="text-sm text-gray-400 mb-4 font-light">
                Get special discounts and live updates on our mobile application.
              </p>
              <div className="space-y-2.5">
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs gap-2 py-5 justify-start px-4">
                  <Smartphone className="w-4 h-4" />
                  <span>Download for Android</span>
                </Button>
                <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs gap-2 py-5 justify-start px-4">
                  <Smartphone className="w-4 h-4" />
                  <span>Download for iOS</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 BusBook. All rights reserved. Made for premium journeys.</p>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Payment Certified</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Bus Details Popup Modal */}
      <PublicBusViewDialog
        bus={viewingBus}
        open={!!viewingBus}
        onOpenChange={(open) => !open && setViewingBus(null)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PUBLIC BUS VIEW DIALOG (Technical Specs Modal)
   ═══════════════════════════════════════════════ */
function PublicBusViewDialog({ bus, open, onOpenChange }: { bus: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!bus) return null;

  const allImages = Array.isArray(bus.images) ? bus.images : (typeof bus.images === 'string' ? JSON.parse(bus.images || '[]') : []);
  const [activeImage, setActiveImage] = useState(allImages[0] || null);

  useEffect(() => {
    setActiveImage(allImages[0] || null);
  }, [bus?.id]);

  const details = [
    { label: "Bus Number", value: bus.bus_number, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bus Type", value: bus.bus_type, icon: Bus, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Category", value: bus.bus_category || "N/A", icon: Settings, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Capacity", value: `${bus.total_seats} Seats`, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Manufacturer", value: bus.manufacturer || "N/A", icon: Settings2, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Model", value: bus.model || "N/A", icon: Info, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Fuel Type", value: bus.fuel_type || "N/A", icon: Fuel, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Emission", value: bus.emission_norms || "N/A", icon: Wind, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Transmission", value: bus.transmission_type || "N/A", icon: Settings, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Operator", value: bus.operator || "N/A", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Engine No", value: bus.engine_number || "N/A", icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Chassis No", value: bus.chassis_number || "N/A", icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  const compliance = [
    { label: "Insurance", value: bus.insurance_number, valid: bus.insurance_valid_till },
    { label: "Fitness", value: bus.fitness_certificate_number, valid: bus.fitness_valid_till },
    { label: "PUC", value: bus.puc_number, valid: bus.puc_valid_till },
  ];

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl bg-white text-gray-700">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-900">
            <Bus className="w-5 h-5 text-blue-600" />
            {bus.bus_name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-400">
            Full details and specifications of the vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="space-y-6 sm:space-y-8">
            {/* Images Gallery */}
            {allImages.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Vehicle Photos
                </h4>
                <div className="w-full max-h-[400px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 mb-3 flex items-center justify-center">
                  <img
                    src={getImageUrl(activeImage, bus.id)}
                    alt="Bus"
                    className="w-full h-full object-cover max-h-[400px]"
                    onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-200",
                        activeImage === img ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={getImageUrl(img, bus.id)}
                        alt="Bus"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
                  {details.map((item, idx) => (
                    <div key={idx} className={cn("flex items-center gap-3 p-2 sm:p-2.5 rounded-lg border border-transparent transition-colors", item.bg, "border-gray-100/50")}>
                      <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-white border border-gray-100 flex items-center justify-center", item.color)}>
                        <item.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">{item.label}</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance & Documents */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    Compliance & Documents
                  </h4>
                  <div className="space-y-3">
                    {compliance.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[11px] sm:text-xs font-bold text-gray-900">{item.label}</p>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold uppercase py-0 px-1.5 h-4 sm:h-5">
                            {item.value ? "Verified" : "Missing"}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-400">Number:</span>
                            <span className="font-mono font-medium text-gray-600">{item.value || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs">
                            <span className="text-gray-400">Valid Till:</span>
                            <span className={cn(
                              "font-medium",
                              item.valid && new Date(item.valid) < new Date() ? "text-red-500" : "text-emerald-600"
                            )}>
                              {item.valid ? format(new Date(item.valid), "dd MMM, yyyy") : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    Amenities
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {bus.amenities?.map((am: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] sm:text-xs">
                        {am}
                      </Badge>
                    )) || <span className="text-xs sm:text-sm text-gray-400">No amenities listed</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t bg-gray-50/50 flex flex-row justify-end">
          <Button variant="outline" size="sm" className="h-8 sm:h-10" onClick={() => onOpenChange(false)}>Close Details</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
