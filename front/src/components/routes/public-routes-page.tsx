"use client";

import React, { useState } from "react";
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeftRight,
  Shield,
  Lock,
  RotateCcw,
  Headphones,
  Search,
  Sparkles,
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X,
  Navigation,
  Info,
  Clock,
  IndianRupee,
  Timer,
  LayoutGrid,
  CheckCircle2,
  Route,
  Mail,
  Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePopularRoutes, useSearchBuses } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export function PublicRoutesPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fromCityFilter, setFromCityFilter] = useState("");
  const [toCityFilter, setToCityFilter] = useState("");

  const { data: popularRoutes, isLoading: loadingRoutes } = usePopularRoutes();
  const [viewingRoute, setViewingRoute] = useState<any>(null);
  const [expandedRouteIds, setExpandedRouteIds] = useState<number[]>([]);

  const toggleRouteExpand = (e: React.MouseEvent, routeId: number) => {
    e.stopPropagation();
    setExpandedRouteIds(prev => 
      prev.includes(routeId) ? prev.filter(id => id !== routeId) : [...prev, routeId]
    );
  };

  React.useEffect(() => {
    const savedRouteId = localStorage.getItem("selected_route_id");
    if (savedRouteId && popularRoutes) {
      const matched = popularRoutes.find((r: any) => String(r.id) === savedRouteId);
      if (matched) {
        setViewingRoute(matched);
      }
      localStorage.removeItem("selected_route_id");
    }
  }, [popularRoutes]);

  // Extract unique origin and destination cities
  const fromCities = Array.from(new Set(popularRoutes?.map((r: any) => r.from) || [])) as string[];
  const toCities = Array.from(new Set(popularRoutes?.map((r: any) => r.to) || [])) as string[];

  // Filter routes based on From City and To City selections
  const filteredRoutes = popularRoutes?.filter((route: any) => {
    const matchesFrom = fromCityFilter ? route.from === fromCityFilter : true;
    const matchesTo = toCityFilter ? route.to === toCityFilter : true;
    return matchesFrom && matchesTo;
  });

  const handleRouteClick = (route: any) => {
    const searchParams = {
      from: route.from,
      to: route.to,
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
                      i === 2
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
                      i === 2
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
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-24 bg-slate-950 text-white overflow-hidden select-none">
        {/* Dynamic Glowing Background Blobs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
        
        {/* Fine grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Dynamic Abstract Map/Route SVG Background (Stretches across screen) */}
        <div className="absolute inset-0 z-0 opacity-25 lg:opacity-35 pointer-events-none">
          <svg viewBox="0 0 1440 320" fill="none" className="w-full h-full object-cover object-bottom">
            <defs>
              <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Wavy network routes */}
            <path d="M 100 80 C 300 240, 500 40, 800 180 T 1400 100" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="5 15" opacity="0.6" />
            <path d="M -50 200 C 250 100, 600 300, 950 150 T 1500 250" stroke="url(#routeGrad)" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
            {/* Left Column: Title & Text Info */}
            <div className="lg:col-span-7 text-left space-y-3 sm:space-y-5">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                Smart Navigation
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white animate-fade-in">
                Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">Routes</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-350 max-w-xl font-medium leading-relaxed">
                Connecting you across major cities with speed, comfort, and premium quality service. Select a route to book your ride instantly.
              </p>

              {/* Little trust indicators inside hero */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>50+ Connected Terminals</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Direct Express Routes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>Live Location Feeds</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Interactive Route Map Design */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="relative w-full h-[180px] sm:h-[220px] flex items-center justify-center">
                {/* Glowing aura around illustration */}
                <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full bg-blue-600/20 blur-[60px] pointer-events-none" />

                {/* Stylish Map Route network SVG */}
                <svg viewBox="0 0 400 200" fill="none" className="w-full h-full drop-shadow-2xl">
                  <defs>
                    <linearGradient id="mapConnection" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="glowPulse" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Ground Shadow Grid */}
                  <path d="M 50 160 L 350 160" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

                  {/* Main Winding Route Connecting 3 cities */}
                  <path d="M 80 140 Q 150 40, 220 120 T 320 80" stroke="url(#mapConnection)" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <path d="M 80 140 Q 150 40, 220 120 T 320 80" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 8" strokeLinecap="round" fill="none" opacity="0.75" />

                  {/* Waving radar waves from destination pin */}
                  <circle cx="220" cy="120" r="22" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                  <circle cx="320" cy="80" r="16" stroke="#6366f1" strokeWidth="1" opacity="0.4" />

                  {/* City Pin 1 (Start) */}
                  <g transform="translate(80, 140)">
                    <circle cx="0" cy="0" r="12" fill="#1e1b4b" />
                    <circle cx="0" cy="0" r="8" fill="#3b82f6" />
                    <circle cx="0" cy="0" r="4" fill="#ffffff" />
                    <text x="14" y="4" fill="#60a5fa" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Delhi</text>
                  </g>

                  {/* City Pin 2 (Stopover) */}
                  <g transform="translate(220, 120)">
                    <circle cx="0" cy="0" r="14" fill="#1e1b4b" />
                    <circle cx="0" cy="0" r="9" fill="#818cf8" />
                    <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
                    <text x="-25" y="-14" fill="#a5b4fc" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Kaithal</text>
                  </g>

                  {/* City Pin 3 (Destination) */}
                  <g transform="translate(320, 80)">
                    <circle cx="0" cy="0" r="16" fill="#1e1b4b" />
                    <circle cx="0" cy="0" r="10" fill="#38bdf8" />
                    <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
                    <text x="18" y="4" fill="#7dd3fc" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Cheeka</text>
                  </g>

                  {/* Stylized tiny coach bus shape moving along route (represented as capsule) */}
                  <g transform="translate(145, 85) rotate(-28)">
                    <rect x="-10" y="-5" width="20" height="10" rx="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="-5" cy="5" r="2.5" fill="#0f172a" />
                    <circle cx="5" cy="5" r="2.5" fill="#0f172a" />
                    {/* Headlight beam */}
                    <polygon points="10,-2 25,-8 25,8 10,2" fill="url(#glowPulse)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN ROUTE SEARCH & GRID ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        {/* Filters Container */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-10 bg-white rounded-2xl border border-gray-100 shadow-md p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* From City Filter */}
            <div className="w-full space-y-1 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">From City</label>
              <select
                value={fromCityFilter}
                onChange={(e) => setFromCityFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Origin Cities</option>
                {fromCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Icon decoration */}
            <div className="shrink-0 hidden sm:flex w-10 h-10 rounded-full bg-blue-50 items-center justify-center mt-5">
              <ArrowLeftRight className="w-4 h-4 text-blue-500" />
            </div>

            {/* To City Filter */}
            <div className="w-full space-y-1 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">To City</label>
              <select
                value={toCityFilter}
                onChange={(e) => setToCityFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Destination Cities</option>
                {toCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(fromCityFilter || toCityFilter) && (
              <div className="shrink-0 w-full sm:w-auto mt-0 sm:mt-5">
                <Button
                  onClick={() => {
                    setFromCityFilter("");
                    setToCityFilter("");
                  }}
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl gap-2 font-semibold text-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Routes Listing */}
        {loadingRoutes ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 h-[100px] animate-pulse" />
            ))}
          </div>
        ) : filteredRoutes?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No routes found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              We couldn't find any active routes connecting {fromCityFilter || "origin"} to {toCityFilter || "destination"}. Please try another combination.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredRoutes?.map((route: any) => {
              const firstLetter = route.from.charAt(0);
              const colors = ["bg-orange-500", "bg-green-600", "bg-blue-700", "bg-purple-600", "bg-teal-600"];
              const colorClass = colors[route.id % colors.length] || "bg-blue-600";
              const isExpanded = expandedRouteIds.includes(route.id);

              return (
                <div
                  key={route.id}
                  onClick={(e) => toggleRouteExpand(e, route.id)}
                  className={cn(
                    "bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer",
                    isExpanded && "border-blue-300 ring-1 ring-blue-50/50 shadow-md"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-4">
                    {/* Route Brand Column */}
                    <div className="lg:w-[220px] shrink-0">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0", colorClass)}>
                          {firstLetter}
                        </div>
                        <span className="text-xs sm:text-sm font-bold"><span className="text-blue-600">{route.from}</span> <span className="text-black font-semibold text-[10px] sm:text-xs mx-0.5">to</span> <span className="text-emerald-600">{route.to}</span></span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-black font-medium mt-0.5">
                        {route.distance ? (
                          <>
                            <span className="font-extrabold text-indigo-600">{route.distance}</span> KM Distance
                          </>
                        ) : (
                          "Direct Connect"
                        )}
                      </p>
                      
                      {/* Amenities badges */}
                      <div className="flex items-center gap-1 mt-1.5 sm:mt-2 flex-wrap">
                        {["AC Sleeper", "Charging Points"].map((a) => (
                          <span
                            key={a}
                            className="text-[9px] sm:text-[10px] text-black bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200 font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:contents gap-4">
                      {/* Departure Block */}
                      <div className="lg:w-[160px] shrink-0 text-left">
                        <p className="text-xs sm:text-sm font-extrabold text-blue-600">{route.from}</p>
                        <p className="text-[10px] sm:text-xs text-black font-medium">Origin</p>
                      </div>

                      {/* Timeline Line with Custom SVG Road Route */}
                      <div className="flex flex-col items-center justify-center lg:w-[150px] shrink-0 select-none py-1 lg:py-0">
                        <span className="text-[9px] sm:text-[10px] text-violet-600 font-extrabold mb-0.5">{route.time}</span>
                        <svg viewBox="0 0 160 40" fill="none" className="w-24 sm:w-full h-6 sm:h-10 drop-shadow-xs">
                          {/* Winding road structure */}
                          <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" fill="none" />
                          <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                          <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" fill="none" opacity="0.8" />
                          
                          {/* Start pin dot with pulse ring */}
                          <circle cx="10" cy="25" r="4" fill="#2563eb" opacity="0.4">
                            <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="10" cy="25" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                          
                          {/* Destination pin dot with pulse ring */}
                          <circle cx="150" cy="25" r="4" fill="#10b981" opacity="0.4">
                            <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="150" cy="25" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                          
                          {/* Tiny stylized coach bus following the S-curve at the center */}
                          <g transform="translate(80, 25) rotate(11)">
                            {/* Bus Body */}
                            <rect x="-8" y="-4.5" width="16" height="9" rx="2" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                            {/* Windshield */}
                            <rect x="3" y="-3.5" width="4" height="7" rx="0.5" fill="#93c5fd" />
                            {/* Wheels */}
                            <circle cx="-4" cy="4.5" r="1.5" fill="#0f172a" />
                            <circle cx="4" cy="4.5" r="1.5" fill="#0f172a" />
                          </g>
                        </svg>
                      </div>

                      {/* Arrival Block */}
                      <div className="lg:w-[160px] shrink-0 text-right">
                        <p className="text-xs sm:text-sm font-extrabold text-emerald-600">{route.to}</p>
                        <p className="text-[10px] sm:text-xs text-black font-medium">Destination</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:contents mt-1 lg:mt-0">
                      {/* Status / Stops Badge */}
                      <div className="lg:w-[72px] shrink-0">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                          Active
                        </span>
                      </div>

                      {/* Fare price & CTA block */}
                      <div className="flex items-center gap-3 lg:gap-4 lg:ml-auto lg:shrink-0">
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-black text-blue-600">{route.price}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <Button
                            className={cn(
                              "text-[10px] sm:text-xs font-semibold rounded-md px-3 sm:px-4 h-7 sm:h-8 transition-all",
                              isExpanded 
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200" 
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            )}
                            onClick={(e) => toggleRouteExpand(e, route.id)}
                          >
                            {isExpanded ? "Hide" : "Details"}
                          </Button>
                          <span className="text-[9px] sm:text-[10px] text-black font-medium">
                            <span className="font-extrabold text-indigo-600">{route.buses}</span> Daily
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-5 pt-5 border-t border-gray-150 space-y-6 cursor-default text-left select-none animate-in fade-in slide-in-from-top-3 duration-200"
                    >
                      {/* Grid for General Info, Stops and Available Buses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* Column 1 - General Information */}
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-blue-600 rounded-full shrink-0" />
                            General Information
                          </h4>
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                            {[
                              { label: "From City", value: route.from_city || route.from, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50/50" },
                              { label: "Arrival Time", value: route.from_city_arrival_time || "N/A", icon: Clock, color: "text-blue-500", bg: "bg-blue-50/30" },
                              { label: "To City", value: route.to_city || route.to, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                              { label: "Total Distance", value: route.distance ? `${route.distance} km` : "N/A", icon: Route, color: "text-indigo-600", bg: "bg-indigo-50/50" },
                              { label: "Total Duration", value: route.time || "N/A", icon: Timer, color: "text-rose-600", bg: "bg-rose-50/50" },
                              { label: "Road Type", value: route.road_type || "N/A", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50/50" },
                              { label: "Status", value: route.status?.toUpperCase() || "ACTIVE", icon: CheckCircle2, color: route.status === 'active' ? "text-emerald-600" : "text-blue-600", bg: route.status === 'active' ? "bg-emerald-50/50" : "bg-blue-50/50" },
                            ].map((item, idx) => {
                              const ItemIcon = item.icon;
                              return (
                                <div key={idx} className={cn("flex items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2 rounded-lg border border-gray-150 bg-slate-50/30 shadow-2xs", item.bg)}>
                                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded bg-white flex items-center justify-center border border-gray-100 shrink-0">
                                    <ItemIcon className={cn("w-2.5 h-2.5 sm:w-3.5 sm:h-3.5", item.color)} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="block text-[7px] sm:text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-0.5 sm:mb-1">{item.label}</span>
                                    <span className="block text-[10px] sm:text-xs font-semibold text-gray-700 truncate">{item.value}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 2 - Intermediate Stops & Boarding points */}
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-emerald-600 rounded-full shrink-0" />
                            Boarding Points & Fares
                          </h4>
                          <div className="relative pl-4 sm:pl-5 space-y-2 sm:space-y-4 before:absolute before:left-[7px] sm:before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100 max-h-[200px] sm:max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                            {route.stops && route.stops.length > 0 ? (
                              route.stops.map((stop: any, idx: number) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[16px] sm:-left-[20px] top-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                                  <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-250 transition-all group">
                                    <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                      <div className="flex items-center gap-1 sm:gap-1.5">
                                        <span className="text-[11px] sm:text-xs font-bold text-gray-900 truncate">
                                          {stop.stop_name}
                                        </span>
                                        <span className="text-[6px] sm:text-[7px] font-black text-blue-600 bg-blue-50 px-0.5 sm:px-1 rounded uppercase tracking-wider border border-blue-100/50 shrink-0">
                                          Boarding
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[8px] sm:text-[9px] text-gray-500">
                                        <span>Arr: {stop.arrival_time || "--:--"}</span>
                                        <span>•</span>
                                        <span>Dep: {stop.departure_time || "--:--"}</span>
                                      </div>
                                    </div>
                                    <div className="text-right ml-2 sm:ml-3 flex flex-col items-end">
                                      <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-100">
                                        ₹{stop.fare}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-6 sm:py-8 text-center text-[11px] sm:text-xs text-slate-400 italic">
                                No intermediate stops defined for this route.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Column 3 - Today's Available Buses */}
                        <div className="space-y-3 sm:space-y-4 md:col-span-2 lg:col-span-1">
                          <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-indigo-600 rounded-full shrink-0" />
                            Available Buses Today
                          </h4>
                          <RouteSchedulesList fromCity={route.from} toCity={route.to} />
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

      {/* ═══ TRUST BADGES ═══ */}
      <section className="bg-white py-12 border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, bg: "bg-blue-50", color: "text-blue-600", title: "Secure & Verified", desc: "Best-in-class security protocols" },
              { icon: Lock, bg: "bg-green-50", color: "text-green-600", title: "Encrypted Transactions", desc: "Protected payment channels" },
              { icon: RotateCcw, bg: "bg-red-50", color: "text-red-500", title: "Instant Refund Policy", desc: "Flexible easy cancellations" },
              { icon: Headphones, bg: "bg-purple-50", color: "text-purple-600", title: "24/7 Priority Support", desc: "Always available helper line" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="flex items-center gap-3.5"
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                      badge.bg
                    )}
                  >
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
                {[
                  { icon: Facebook, url: "https://www.facebook.com/share/1BwxTLz5LS/?mibextid=wwXIfr", color: "bg-[#1877F2] hover:shadow-blue-500/30" },
                  { icon: Twitter, url: "https://x.com/bhinder_bus?s=11", color: "bg-black hover:shadow-gray-500/30" },
                  { icon: Instagram, url: "https://www.instagram.com/bhinder.bus.service?igsh=Nzhhb3NxMHE5cm10&utm_source=qr", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:shadow-pink-500/30" },
                  { icon: Youtube, url: "https://youtube.com/@bhinder_bus_service?si=kd831ChekfW3c2qc", color: "bg-[#FF0000] hover:shadow-red-500/30" },
                ].map(({ icon: Icon, url, color }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 rounded-full ${color} flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}
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
                    <button
                      onClick={() => {
                        if (link === "Terms & Conditions") navigate("/terms");
                        else if (link === "Privacy Policy") navigate("/privacy");
                        else navigate("/");
                      }}
                      className="hover:text-white transition-colors"
                    >
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

          {/* Map */}
          <div className="mt-12 pt-6 border-t border-slate-800">
            <div className="w-full h-[200px] sm:h-[250px] rounded-xl overflow-hidden border border-slate-700">
              <iframe
                src="https://maps.google.com/maps?q=132/15+Ind.Area+Near+SBI+Bank+Patiala+Road+Cheeka&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bhinder Bus Service Location"
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs text-gray-400">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                Bhinderbusservice@gmail.com
              </span>
              <span className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-1 shrink-0 text-blue-400" />
                <div className="grid grid-cols-2 gap-x-5 gap-y-0.5">
                  <a href="tel:+918092000025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 8092000025</a>
                  <a href="tel:+919991600025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 9991600025</a>
                  <a href="tel:+919996021425" className="text-sm text-gray-400 hover:text-white transition-colors">+91 9996021425</a>
                  <a href="tel:+918481000025" className="text-sm text-gray-400 hover:text-white transition-colors">+91 8481000025</a>
                </div>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Payment Certified</span>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-4 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© 2026 BusBook. All rights reserved. Made for premium journeys.</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>132/15, Ind.Area, Near SBI Bank, Patiala Road, Cheeka</span>
            </div>
          </div>
        </div>
      </footer>

      <RouteViewDialog
        route={viewingRoute}
        open={!!viewingRoute}
        onOpenChange={(open) => !open && setViewingRoute(null)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROUTE SCHEDULES LIST & TIME HELPER
   ═══════════════════════════════════════════════ */
const formatTimeString = (timeStr: string) => {
  if (!timeStr) return "--:--";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
};

function RouteSchedulesList({ fromCity, toCity }: { fromCity: string; toCity: string }) {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: schedules, isLoading } = useSearchBuses({
    from_city: fromCity,
    to_city: toCity,
    journey_date: todayStr,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-50 border border-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50/30 border border-dashed border-gray-200 rounded-xl">
        No active buses scheduled for today.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
      {schedules.map((sch: any) => {
        const depTime = formatTimeString(sch.departure_time);
        const arrTime = formatTimeString(sch.arrival_time);

        const handleBookClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          const searchParams = {
            from: fromCity,
            to: toCity,
            date: todayStr,
            passengers: 1,
          };
          localStorage.setItem("search_params", JSON.stringify(searchParams));
          navigate("/booking");
        };

        return (
          <div 
            key={sch.id} 
            onClick={handleBookClick}
            className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50/50 border border-gray-100 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {sch.bus?.bus_name || "Express Bus"}
                </span>
                <span className="text-[7px] sm:text-[7.5px] font-black text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100/50 uppercase tracking-wider shrink-0">
                  {sch.bus?.bus_type || "A/C Sleeper"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px] sm:text-[9px] text-gray-500 mt-0.5 sm:mt-1">
                <span className="font-semibold text-gray-700">{depTime} ➔ {arrTime}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">{sch.available_seats} left</span>
              </div>
            </div>
            <div className="text-right ml-2 sm:ml-3 flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-bold text-gray-955">
                ₹{Math.round(sch.fare)}
              </span>
              <Button
                className="h-6 sm:h-7 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 text-white text-[9px] sm:text-[10px] font-bold rounded-lg shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0"
                onClick={handleBookClick}
              >
                Book
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROUTE VIEW DIALOG (matching admin style)
   ═══════════════════════════════════════════════ */
function RouteViewDialog({ route, open, onOpenChange }: { route: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!route) return null;

  const mainDetails = [
    { label: "From City", value: route.from_city, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Arrival Time", value: route.from_city_arrival_time || "N/A", icon: Clock, color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: "To City", value: route.to_city, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Distance", value: route.distance ? `${route.distance} km` : "N/A", icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Duration", value: route.time || "N/A", icon: Timer, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Road Type", value: route.road_type || "N/A", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Status", value: route.status?.toUpperCase(), icon: CheckCircle2, color: route.status === 'active' ? "text-emerald-600" : "text-red-600", bg: route.status === 'active' ? "bg-emerald-50" : "bg-red-50" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] max-w-[92%] sm:w-full sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2 text-gray-900">
            <Route className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            Route Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-4 md:p-6 max-h-[calc(90vh-80px)] text-gray-700">
          <div className="space-y-6 md:space-y-8">
            {/* Header Section */}
            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100">
              <div className="flex flex-row items-center justify-between gap-2 md:gap-6">
                {/* Starting Point */}
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[8px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5 md:mb-1">Starting Point</p>
                  <h3 className="text-sm sm:text-base md:text-2xl font-black text-gray-955 truncate">{route.from_city}</h3>
                  <div className="flex items-center gap-1 mt-0.5 md:mt-1 text-gray-500">
                    <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium truncate">{route.from_city_arrival_time || "Time not set"}</span>
                  </div>
                </div>

                {/* Custom Winding Road SVG Connector */}
                <div className="flex flex-col items-center justify-center w-24 sm:w-32 md:w-40 shrink-0 select-none px-1 md:px-4">
                  <svg viewBox="0 0 160 40" fill="none" className="w-full h-10 drop-shadow-xs">
                    {/* Winding road structure */}
                    <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" fill="none" />
                    <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
                    <path d="M 10 25 C 50 5, 110 45, 150 25" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 4" strokeLinecap="round" fill="none" opacity="0.8" />
                    
                    {/* Start pin dot with pulse ring */}
                    <circle cx="10" cy="25" r="4" fill="#2563eb" opacity="0.4">
                      <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="10" cy="25" r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    
                    {/* Destination pin dot with pulse ring */}
                    <circle cx="150" cy="25" r="4" fill="#10b981" opacity="0.4">
                      <animate attributeName="r" values="4;9;4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="150" cy="25" r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                    
                    {/* Tiny stylized coach bus following the S-curve at the center */}
                    <g transform="translate(80, 25) rotate(11)">
                      {/* Bus Body */}
                      <rect x="-8" y="-4.5" width="16" height="9" rx="2" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
                      {/* Windshield */}
                      <rect x="3" y="-3.5" width="4" height="7" rx="0.5" fill="#93c5fd" />
                      {/* Wheels */}
                      <circle cx="-4" cy="4.5" r="1.5" fill="#0f172a" />
                      <circle cx="4" cy="4.5" r="1.5" fill="#0f172a" />
                    </g>
                  </svg>
                  <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase mt-2 text-center truncate max-w-full">
                    {route.distance ? `${route.distance} KM` : ""} {route.time ? `• ${route.time}` : ""}
                  </span>
                </div>

                {/* Destination */}
                <div className="text-right min-w-0 flex-1">
                  <p className="text-[8px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 md:mb-1">Destination</p>
                  <h3 className="text-sm sm:text-base md:text-2xl font-black text-gray-955 truncate">{route.to_city}</h3>
                  <div className="flex items-center justify-end gap-1 mt-0.5 md:mt-1 text-gray-500">
                    <IndianRupee className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm font-bold text-blue-600">{route.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Info Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  General Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {mainDetails.map((item, idx) => (
                    <div key={idx} className={cn("p-3 rounded-xl border border-gray-100 transition-colors", item.bg)}>
                      <item.icon className={cn("w-4 h-4 mb-2", item.color)} />
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-950 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                  Boarding Points & Fares (to {route.to_city})
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                  {route.stops && route.stops.length > 0 ? (
                    route.stops.map((stop: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                {stop.stop_name}
                              </span>
                              <span className="text-[8px] sm:text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-100/50 shrink-0">
                                Boarding Only
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Arr: {stop.arrival_time || "--:--"}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Dep: {stop.departure_time || "--:--"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4 flex flex-col items-end gap-1">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                              ₹{stop.fare}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400">to {route.to_city}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-400 italic">
                      No intermediate stops defined for this route.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
