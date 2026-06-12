"use client";

import React, { useState, useEffect } from "react";
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
  Star,
  Menu,
  X,
  Download,
  Mail,
  Phone,
  Sparkles,
  Smartphone,
  Search,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Play,
  CheckCircle,
  Building2,
  Route,
  Clock,
  FileText,
  Settings,
  Settings2,
  Fuel,
  Wind,
  User,
  Info,
  Wifi,
  Zap,
  Droplet,
  Lightbulb,
  Moon,
  Layers,
  CalendarDays,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useNavStore } from "@/lib/nav-store";
import { cn, getImageUrl } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSearchCities, useTopBuses } from "@/hooks/use-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

/* ═══════════════════════════════════════════════
   BUSBOOK LANDING PAGE - Pixel Perfect
   ═══════════════════════════════════════════════ */

import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setShowLoginModal } = useNavStore();

  // Hero section sliding images
  const heroImages = [
    "/slide/bus-hero.png",
    "/slide/bus interior.png",
    "/slide/bus interior back.png",
    "/slide/bus driver seat.png"
  ];
  const mobileHeroImages = [
    "/mobile slider/image1.jpeg",
    "/mobile slider/image2.jpeg",
    "/mobile slider/image3.jpeg",
    "/mobile slider/image4.jpeg"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      const allImages = [...heroImages, ...mobileHeroImages];
      const promises = allImages.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      );
      await Promise.all(promises);
      setImagesLoaded(true);
    };
    preloadImages();
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagesLoaded]);

  useEffect(() => {
    if (localStorage.getItem("scroll_to_schedules") === "true") {
      localStorage.removeItem("scroll_to_schedules");
      setTimeout(() => {
        document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);
  
  const [searchParams, setSearchParams] = useState({
    from: "Delhi",
    to: "Jaipur",
    date: "",
    passengers: 1,
  });

  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const { data: citiesData, isLoading: loadingCities } = useSearchCities();
  const { data: topBuses, isLoading: loadingTopBuses } = useTopBuses();
  const [hasSearched, setHasSearched] = useState(false);
  const [viewingBusDetails, setViewingBusDetails] = useState<any>(null);
  const [viewingStoppages, setViewingStoppages] = useState<any>(null);
  const [visibleSchedulesCount, setVisibleSchedulesCount] = useState(5);
  const [visibleRoutesCount, setVisibleRoutesCount] = useState(5);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [topBusFromFilter, setTopBusFromFilter] = useState("");
  const [topBusToFilter, setTopBusToFilter] = useState("");
  const [topBusTypeFilter, setTopBusTypeFilter] = useState("");

  const cityTerminals: Record<string, string> = {
    "Delhi": "Kashmiri Gate",
    "Mumbai": "Borivali",
    "Bangalore": "Majestic",
    "Hyderabad": "MGBS",
    "Chennai": "Koyambedu",
    "Pune": "Swargate",
    "Jaipur": "Sindhi Camp",
    "Ahmedabad": "Geeta Mandir",
    "Surat": "Bus Stand",
    "Indore": "Sarwate",
    "Bhopal": "ISBT",
  };

  const getBusBadge = (type: string, category: string) => {
    const t = type.toLowerCase();
    const c = category?.toLowerCase() || "";
    if (t.includes("premium") || c.includes("premium")) {
      return { text: "PREMIUM", bg: "bg-indigo-600", textCol: "text-white" };
    }
    if (t.includes("non ac") || t.includes("non-ac") || c.includes("non ac") || c.includes("non-ac")) {
      return { text: "NON AC", bg: "bg-emerald-600", textCol: "text-white" };
    }
    if (t.includes("sleeper") || c.includes("sleeper")) {
      return { text: "AC SLEEPER", bg: "bg-orange-600", textCol: "text-white" };
    }
    return { text: (category || type).toUpperCase(), bg: "bg-sky-500", textCol: "text-white" };
  };

  const formatDuration = (dur: string | number | undefined | null) => {
    if (!dur) return "5h 30m";
    const str = String(dur).trim().toLowerCase();
    
    // If it's a pure number, e.g. "3" or "5"
    if (/^\d+$/.test(str)) {
      return `${str}h 00m`;
    }
    
    // If it matches something like "3h" or "3 h"
    if (/^\d+\s*h$/.test(str)) {
      const hours = str.replace(/[^0-9]/g, "");
      return `${hours}h 00m`;
    }
    
    // If it already matches e.g. "3h 30m" or "3h30m"
    const hourMatch = str.match(/(\d+)\s*h/);
    const minMatch = str.match(/(\d+)\s*m/);
    
    if (hourMatch) {
      const hours = hourMatch[1];
      const mins = minMatch ? minMatch[1] : "00";
      return `${hours}h ${mins.padStart(2, '0')}m`;
    }
    
    // Fallback
    return str;
  };

  const amenityIcons: Record<string, any> = {
    "Wi-Fi": Wifi,
    "Wifi": Wifi,
    "Charging Point": Zap,
    "Water Bottle": Droplet,
    "Blanket": Layers,
    "Pillow": Moon,
    "Reading Light": Lightbulb,
    "A/C": Wind,
    "AC": Wind,
  };

  const topBusFromCities = Array.from(new Set(topBuses?.map((b: any) => b.from) || [])) as string[];
  const topBusToCities = Array.from(new Set(topBuses?.map((b: any) => b.to) || [])) as string[];
  const topBusTypes = Array.from(new Set(topBuses?.map((b: any) => b.type) || [])) as string[];

  const fromCities: string[] = citiesData?.from_cities || ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad"];
  const toCities: string[] = citiesData?.to_cities || ["Jaipur", "Pune", "Chennai", "Vijayawada", "Surat"];

  const stopCities = Array.from(
    new Set(topBuses?.flatMap((bus: any) => bus.stops?.map((s: any) => s.stop_name) || []) || [])
  ) as string[];

  const allCities = Array.from(new Set([...fromCities, ...toCities, ...stopCities]));

  const filteredFromCities = allCities.filter((city: string) =>
    city.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );
  
  const filteredToCities = allCities.filter((city: string) =>
    city.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  const handleSwapCities = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchParams(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getDayOfWeek = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { weekday: "short" });
  };

  const handleSearch = () => {
    setHasSearched(true);
    setTimeout(() => {
      document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-lg border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
              <img src="/logo.png" alt="Logo" className="h-18 object-contain" />
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {["Home", "Buses", "Routes", "Track Booking"].map(
                (link, i) => {
                  const isActive = (i === 0 && window.location.pathname === "/") || 
                                   (i === 1 && window.location.pathname === "/buses") || 
                                   (i === 2 && window.location.pathname === "/routes");
                  return (
                    <button
                      key={link}
                      onClick={() => {
                        if (i === 0) navigate("/");
                        if (i === 1) navigate("/buses");
                        if (i === 2) navigate("/routes");
                        if (i === 3) navigate("/track");
                      }}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold transition-colors relative pb-3.5",
                        isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                      )}
                    >
                      <span>{link}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-full" />
                      )}
                    </button>
                  );
                }
              )}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                className="relative h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95 group overflow-hidden"
                onClick={() => document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out" />
              </Button>
            </div>

            {/* Mobile Menu Toggle & Book Now */}
            <div className="flex lg:hidden items-center gap-2.5">
              <Button
                className="relative h-9 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs group overflow-hidden"
                onClick={() => document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" })}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Book Now
              </Button>
              <button
                className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
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
                      (i === 0 && window.location.pathname === "/") || (i === 1 && window.location.pathname === "/buses") || (i === 2 && window.location.pathname === "/routes")
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
                  onClick={() => { document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); }}
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pb-36 lg:pb-36 min-h-[500px] lg:min-h-[680px] flex flex-col justify-center items-start lg:items-center select-none text-left lg:text-center">
        {/* Background Image Carousel (Crossfade) - Desktop only */}
        <div className="absolute inset-x-0 top-16 bottom-0 z-0 overflow-hidden hidden lg:block">
          {heroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Slide ${index + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
              style={{ objectFit: "fill" }}
            />
          ))}
        </div>
        {/* Background Image Carousel (Crossfade) - Mobile only */}
        <div className="absolute inset-x-0 top-16 bottom-0 z-0 overflow-hidden block lg:hidden">
          {mobileHeroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Mobile Slide ${index + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
              style={{ objectFit: "cover" }}
            />
          ))}
        </div>
        {/* Responsive Background Overlay: Dark on mobile, white overlay on desktop */}
        <div className="absolute inset-x-0 top-16 bottom-0 bg-black/40 lg:bg-white/10 lg:backdrop-blur-[0.5px] z-0"></div>

        <div className="absolute inset-x-0 top-16 bottom-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        </div>
      </section>

      {/* ═══ SEARCH & STATS SECTION ═══ */}
      <section id="search-section" className="py-8 lg:py-12 bg-slate-50 border-b border-slate-100 w-full relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 lg:gap-8 w-full">
          {/* Search Form Card (Overlaps Hero Section on Mobile) */}
          <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 lg:p-8 relative w-full border border-slate-100/85 -mt-28 lg:mt-0">
            {/* Top Capsule Tab (Desktop) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex">
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-200 border border-blue-500 uppercase tracking-wider">
                <Bus className="w-4 h-4" />
                Find Your Perfect Bus
              </div>
            </div>

            {/* Inline Header (Mobile) */}
            <div className="flex lg:hidden items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-250">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <div className="text-left leading-tight">
                <h2 className="text-sm font-extrabold text-slate-900">Find Your Perfect Bus</h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Search buses, compare and book tickets</p>
              </div>
            </div>

            {/* Dotted Line Path Decoration with Sliding Bus (Desktop) */}
            <div className="absolute top-[38px] left-[25%] right-[25%] h-[1px] border-t-2 border-dashed border-slate-100 pointer-events-none select-none hidden lg:block" />
            <div className="absolute top-9 left-1/2 -translate-x-1/2 w-[50%] hidden lg:flex items-center justify-between pointer-events-none select-none z-10">
              <MapPin className="w-4 h-4 text-blue-400 opacity-60" />
              <div className="flex-1 border-t-2 border-dashed border-blue-200 mx-2 relative">
                <div className="absolute -top-3.5 left-1/3 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                  <Bus className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <MapPin className="w-4 h-4 text-blue-400 opacity-60" />
            </div>

            {/* Responsive Input Fields Container */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-2.5 lg:gap-4 relative pt-1 lg:pt-3">
              {/* Wrapper for From, To and Swap button to ensure robust vertical centering on mobile */}
              <div className="relative flex flex-col gap-2.5 lg:contents">
                {/* From Popover */}
                <Popover open={fromOpen} onOpenChange={setFromOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between p-2.5 lg:p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer w-full select-none gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                          <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider">FROM</p>
                          <p className="text-sm lg:text-base font-extrabold text-slate-900 truncate leading-tight mt-0.5">{searchParams.from}</p>
                          <p className="text-[9px] lg:text-[10px] text-slate-400 font-semibold mt-0.5">Departure City</p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white border border-slate-150 shadow-xl rounded-xl z-50">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Type or search departure city..."
                        value={fromSearchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFromSearchQuery(val);
                          // We don't update searchParams immediately to allow selection from list
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (fromSearchQuery) {
                              setSearchParams(prev => ({ ...prev, from: fromSearchQuery }));
                            }
                            setFromOpen(false);
                          }
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {fromSearchQuery && !fromCities.some(c => c.toLowerCase() === fromSearchQuery.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchParams(prev => ({ ...prev, from: fromSearchQuery }));
                              setFromOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 mb-1"
                          >
                            Use "{fromSearchQuery}"
                          </button>
                        )}
                        {loadingCities ? (
                          <p className="text-xs text-gray-400 p-2">Loading cities...</p>
                        ) : filteredFromCities.length === 0 && !fromSearchQuery ? (
                          <p className="text-xs text-gray-400 p-2">No cities found</p>
                        ) : (
                          filteredFromCities.map((city: string) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setSearchParams(prev => ({ ...prev, from: city }));
                                setFromSearchQuery("");
                                setFromOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              {city}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Swap Button (Centered vertically on mobile between From and To cards) */}
                <button
                  type="button"
                  onClick={handleSwapCities}
                  className="absolute left-1/2 top-1/2 lg:left-[25%] lg:top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Swap Cities"
                >
                  <ArrowLeftRight className="w-4 h-4 text-blue-600 rotate-90 lg:rotate-0" />
                </button>

                {/* To Popover */}
                <Popover open={toOpen} onOpenChange={setToOpen}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center justify-between p-2.5 lg:p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer w-full select-none gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                          <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider">TO</p>
                          <p className="text-sm lg:text-base font-extrabold text-slate-900 truncate leading-tight mt-0.5">{searchParams.to}</p>
                          <p className="text-[9px] lg:text-[10px] text-slate-400 font-semibold mt-0.5">Destination City</p>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3 bg-white border border-slate-150 shadow-xl rounded-xl z-50">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Type or search destination city..."
                        value={toSearchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setToSearchQuery(val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (toSearchQuery) {
                              setSearchParams(prev => ({ ...prev, to: toSearchQuery }));
                            }
                            setToOpen(false);
                          }
                        }}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {toSearchQuery && !toCities.some(c => c.toLowerCase() === toSearchQuery.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchParams(prev => ({ ...prev, to: toSearchQuery }));
                              setToOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100 mb-1"
                          >
                            Use "{toSearchQuery}"
                          </button>
                        )}
                        {loadingCities ? (
                          <p className="text-xs text-gray-400 p-2">Loading cities...</p>
                        ) : filteredToCities.length === 0 && !toSearchQuery ? (
                          <p className="text-xs text-gray-400 p-2">No cities found</p>
                        ) : (
                          filteredToCities.map((city: string) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => {
                                setSearchParams(prev => ({ ...prev, to: city }));
                                setToSearchQuery("");
                                setToOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            >
                              {city}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Search Button and Filter slider row */}
            <div className="mt-4 lg:mt-6 flex items-center gap-3.5">
              <Button
                className="flex-1 h-12 text-sm font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-100 transition-all hover:scale-101 active:scale-98"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4 text-white" />
                Search Buses
              </Button>
            </div>
          </div>

          {/* Floating Stats Bar (Responsive row with vertical dividers) */}
          <div className="max-w-4xl mx-auto bg-white border border-slate-150 shadow-xl py-4 px-2 lg:px-6 mt-2 rounded-2xl flex flex-row justify-between items-center w-full select-none">
            {[
              { val: "10,000+", label: "Happy Customers", icon: Users, col: "text-blue-600", bg: "bg-blue-50" },
              { val: "50+", label: "Routes on Road", icon: Route, col: "text-purple-600", bg: "bg-purple-50" },
              { val: "100+", label: "Buses Connected", icon: Bus, col: "text-emerald-600", bg: "bg-emerald-50" },
              { val: "4.8", label: "Customer Rating", icon: Star, col: "text-amber-500", bg: "bg-amber-50" }
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-3 flex-1 min-w-[70px] justify-center border-r last:border-r-0 border-slate-100">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", stat.bg)}>
                    <StatIcon className={cn("w-4.5 h-4.5", stat.col)} />
                  </div>
                  <div className="text-center lg:text-left leading-none">
                    <p className="text-[11px] lg:text-sm font-black text-slate-800">{stat.val}</p>
                    <p className="text-[8.5px] lg:text-[10px] text-slate-400 font-bold mt-1 lg:mt-1.5">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE BHINDER BUS SERVICE ═══ */}
      <section className="relative overflow-hidden rounded-[40px] bg-[#F8FAFF] pt-[35px] pb-0 sm:py-24 border-b border-gray-100">
        {/* Background SVG Decoration (Inlined to allow image assets to load) */}
        <svg viewBox="0 0 1920 800" fill="none" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx={0} dy={8} stdDeviation={6} floodColor="#1E293B" floodOpacity={0.08} />
            </filter>

            <linearGradient id="roadLeftGradient" x1={0} y1={1} x2={1} y2={0}>
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </linearGradient>
            <linearGradient id="roadLeftGlow" x1={0} y1={1} x2={1} y2={0}>
              <stop offset="0%" stopColor="#C7D2FE" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#E0E7FF" stopOpacity={0.4} />
            </linearGradient>

            <linearGradient id="roadRightGradient" x1={1} y1={1} x2={0} y2={0}>
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#67E8F9" />
              <stop offset="100%" stopColor="#A5F3FC" />
            </linearGradient>
            <linearGradient id="roadRightGlow" x1={1} y1={1} x2={0} y2={0}>
              <stop offset="0%" stopColor="#A5F3FC" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity={0.4} />
            </linearGradient>

            <radialGradient id="glowBlue" cx="20%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="glowTeal" cx="80%" cy="30%" r="45%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
            </radialGradient>

            <g id="pin">
              <ellipse cx={0} cy={0} rx={10} ry={3.5} fill="currentColor" opacity={0.25} />
              <circle cx={0} cy={-22} r={14} fill="currentColor" opacity={0.12} />
              <path d="M0 0 C-9 -9 -14 -18 -14 -27 A14 14 0 1 1 14 -27 C14 -18 9 -9 0 0 Z" fill="currentColor" />
              <circle cx={0} cy="-27" r={4.5} fill="#FFFFFF" />
            </g>
          </defs>

          <rect width="1920" height="800" fill="url(#glowBlue)" />
          <rect width="1920" height="800" fill="url(#glowTeal)" />

          <g fill="#4F46E5" opacity={0.04} transform="translate(0, 240)">
            <path d="M-100,360 L120,180 L290,260 L460,120 L620,290 L750,220 L900,360 Z" />
            <path d="M-50,360 L200,200 L380,280 L580,150 L800,360 Z" opacity={0.6} />
          </g>

          <g fill="#06B6D4" opacity={0.04} transform="translate(1300, 360)">
            <rect x={0} y={70} width={35} height={130} />
            <rect x={40} y={20} width={45} height={180} />
            <polygon points="40,20 62.5,-10 85,20" />
            <rect x={95} y={90} width={30} height={110} />
            <rect x={135} y={40} width={40} height={160} />
            <rect x={185} y={10} width={50} height={190} />
            <polygon points="185,10 210,-20 235,10" />
            <rect x={245} y={80} width={30} height={120} />
          </g>

          <g fill="#4F46E5" opacity={0.2}>
            <circle cx={80} cy={100} r={2} /><circle cx={96} cy={100} r={2} /><circle cx={112} cy={100} r={2} /><circle cx={128} cy={100} r={2} /><circle cx={144} cy={100} r={2} />
            <circle cx={80} cy={116} r={2} /><circle cx={96} cy={116} r={2} /><circle cx={112} cy={116} r={2} /><circle cx={128} cy={116} r={2} /><circle cx={144} cy={116} r={2} />
            <circle cx={80} cy={132} r={2} /><circle cx={96} cy={132} r={2} /><circle cx={112} cy={132} r={2} /><circle cx={128} cy={132} r={2} /><circle cx={144} cy={132} r={2} />
            <circle cx={80} cy={148} r={2} /><circle cx={96} cy={148} r={2} /><circle cx={112} cy={148} r={2} /><circle cx={128} cy={148} r={2} /><circle cx={144} cy={148} r={2} />
            <circle cx={80} cy={164} r={2} /><circle cx={96} cy={164} r={2} /><circle cx={112} cy={164} r={2} /><circle cx={128} cy={164} r={2} /><circle cx={144} cy={164} r={2} />
          </g>
          <g fill="#06B6D4" opacity={0.2}>
            <circle cx={1776} cy={100} r={2} /><circle cx={1792} cy={100} r={2} /><circle cx={1808} cy={100} r={2} /><circle cx={1824} cy={100} r={2} /><circle cx={1840} cy={100} r={2} />
            <circle cx={1776} cy={116} r={2} /><circle cx={1792} cy={116} r={2} /><circle cx={1808} cy={116} r={2} /><circle cx={1824} cy={116} r={2} /><circle cx={1840} cy={116} r={2} />
            <circle cx={1776} cy={132} r={2} /><circle cx={1792} cy={132} r={2} /><circle cx={1808} cy={132} r={2} /><circle cx={1824} cy={132} r={2} /><circle cx={1840} cy={132} r={2} />
            <circle cx={1776} cy={148} r={2} /><circle cx={1792} cy={148} r={2} /><circle cx={1808} cy={148} r={2} /><circle cx={1824} cy={148} r={2} /><circle cx={1840} cy={148} r={2} />
            <circle cx={1776} cy={164} r={2} /><circle cx={1792} cy={164} r={2} /><circle cx={1808} cy={164} r={2} /><circle cx={1824} cy={164} r={2} /><circle cx={1840} cy={164} r={2} />
          </g>

          <g>
            <path d="M -150 850 C 200 750, -50 450, 180 200" fill="none" stroke="url(#roadLeftGlow)" strokeWidth={108} strokeLinecap="round" opacity={0.3} />
            <path d="M -150 850 C 200 750, -50 450, 180 200" fill="none" stroke="url(#roadLeftGradient)" strokeWidth={100} strokeLinecap="round" opacity={0.2} />
            <path d="M -150 850 C 200 750, -50 450, 180 200" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeDasharray="14 18" opacity={0.8} strokeLinecap="round" />
          </g>

          <g>
            <path d="M 2070 850 C 1720 750, 1970 450, 1740 200" fill="none" stroke="url(#roadRightGlow)" strokeWidth={108} strokeLinecap="round" opacity={0.3} />
            <path d="M 2070 850 C 1720 750, 1970 450, 1740 200" fill="none" stroke="url(#roadRightGradient)" strokeWidth={100} strokeLinecap="round" opacity={0.2} />
            <path d="M 2070 850 C 1720 750, 1970 450, 1740 200" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeDasharray="14 18" opacity={0.8} strokeLinecap="round" />
          </g>

          <use href="#pin" x={180} y={200} fill="#4F46E5" />
          <use href="#pin" x={140} y={430} fill="#6366F1" />
          <use href="#pin" x={40} y={650} fill="#8B5CF6" />
          
          <use href="#pin" x={1740} y={200} fill="#0891B2" />
          <use href="#pin" x={1780} y={430} fill="#06B6D4" />
          <use href="#pin" x={1880} y={650} fill="#2DD4BF" />

          <g transform="translate(560, 260)" filter="url(#shadow)" className="text-blue-600">
            <circle cx={0} cy={0} r={28} fill="white" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#2563EB" strokeWidth={1} opacity={0.2} />
            <g transform="translate(-1, -1) scale(0.9)">
              <path d="M-8 -8 H8 A2 2 0 0 1 10 -6 V4 A2 2 0 0 1 8 6 H-8 A2 2 0 0 1 -10 4 V-6 A2 2 0 0 1 -8 -8 Z" stroke="#2563EB" strokeWidth={2} fill="none" strokeLinejoin="round" />
              <path d="M-10 0 H10 M-6 6 L-6 9 M6 6 L6 9" stroke="#2563EB" strokeWidth={2} strokeLinecap="round" />
              <circle cx={-4} cy={3} r={1.5} fill="#2563EB" />
              <circle cx={4} cy={3} r={1.5} fill="#2563EB" />
            </g>
          </g>

          <g transform="translate(1130, 240)" filter="url(#shadow)" className="text-purple-600">
            <circle cx={0} cy={0} r={28} fill="white" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#7C3AED" strokeWidth={1} opacity={0.2} />
            <g transform="rotate(-25) scale(0.95)">
              <rect x={-12} y={-7} width={24} height={14} rx={1.5} stroke="#7C3AED" strokeWidth={2} fill="none" />
              <path d="M-12 -2 A 2 2 0 0 1 -12 2 M12 -2 A 2 2 0 0 0 12 2" stroke="#7C3AED" stroke-width="2" fill="none" />
              <path d="M0 -3 V3" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="2 2" />
            </g>
          </g>

          <g transform="translate(1480, 440)" filter="url(#shadow)" className="text-cyan-600">
            <circle cx={0} cy={0} r={28} fill="white" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#0891B2" strokeWidth={1} opacity={0.2} />
            <g transform="scale(0.9)">
              <path d="M-9 2 A9 9 0 0 1 9 2" stroke="#0891B2" stroke-width="2" fill="none" strokeLinecap="round" />
              <rect x={-11} y={-1} width={3} height={7} rx={1} stroke="#0891B2" stroke-width="2" fill="none" />
              <rect x={8} y={-1} width={3} height={7} rx={1} stroke="#0891B2" stroke-width="2" fill="none" />
            </g>
          </g>

          <g transform="translate(680, 560)" filter="url(#shadow)" className="text-purple-500">
            <circle cx={0} cy={0} r={28} fill="white" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#8B5CF6" strokeWidth={1} opacity={0.2} />
            <g transform="scale(0.9)">
              <rect x={-10} y={-6} width={20} height={14} rx={2} stroke="#8B5CF6" stroke-width="2" fill="none" />
              <path d="M-4 -6 V-9 H4 V-6" stroke="#8B5CF6" stroke-width="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M-10 -1 H10" stroke="#8B5CF6" stroke-width="1.5" />
            </g>
          </g>

          <g transform="translate(1150, 560)" filter="url(#shadow)" className="text-cyan-500">
            <circle cx={0} cy={0} r={28} fill="white" />
            <circle cx={0} cy={0} r={28} fill="none" stroke="#06B6D4" strokeWidth={1} opacity={0.2} />
            <g transform="scale(0.9)">
              <path d="M-5 -8 H5 V2 H-5 Z" stroke="#06B6D4" stroke-width="2" fill="none" strokeLinejoin="round" />
              <path d="M-8 -1 H-5 M5 -1 H8" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" />
              <path d="M-4 2 V6 M4 2 V6" stroke="#06B6D4" stroke-width="2" stroke-linecap="round" />
            </g>
          </g>

          <path
           d="M450 90 C700 30 1100 30 1450 110"
           stroke="#93C5FD"
           strokeWidth={3}
           strokeDasharray="10 12"
           fill="none"
           opacity={0.6}
          />

          <text x={1450} y={110} fontSize={26} opacity={0.5}>
            ✈
          </text>

          <g fill="#2563EB">
            <circle cx={250} cy={350} r={10}/>
            <circle cx={350} cy={180} r={10}/>
          </g>

          <g fill="#06B6D4">
            <circle cx={1700} cy={340} r={10}/>
            <circle cx={1600} cy={180} r={10}/>
          </g>
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Badge & Header */}
          <div className="flex flex-col items-center justify-center mb-10 max-w-xl mx-auto text-center px-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 select-none shadow-xs uppercase tracking-wider mb-3.5">
              <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
              Trusted By Thousands Of Happy Travelers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight relative pb-3.5 inline-block">
              Why Choose <span className="text-blue-600 relative inline-block">Bhinder Bus Service
                <svg className="absolute left-0 -bottom-2 w-full h-2 text-blue-500/30" viewBox="0 0 100 10" preserveAspectRatio="none" fill="currentColor">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-400 mt-2">
              We provide the best travel experience with comfort, safety and reliability.
            </p>
          </div>

          {/* 6 Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-5">
            {[
              {
                icon: Shield,
                title: "Safe & Secure Travel",
                desc: "Verified drivers and regularly maintained buses for a safe journey.",
                iconCol: "text-blue-600",
                bgCol: "bg-blue-200/70 border-blue-200/50"
              },
              {
                icon: MapPin,
                title: "Live Bus Tracking",
                desc: "Track your bus in real-time and get accurate updates on arrival time.",
                iconCol: "text-purple-600",
                bgCol: "bg-purple-200/70 border-purple-200/50"
              },
              {
                icon: Clock,
                title: "On-Time Departures",
                desc: "Reliable schedules with punctual departures and on-time arrivals.",
                iconCol: "text-orange-500",
                bgCol: "bg-orange-200/70 border-orange-200/50"
              },
              {
                icon: (props: any) => (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
                    <path d="M7 4h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7" />
                    <path d="M7 18H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                    <path d="M16 11h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" />
                    <path d="M6 18v3M14 18v3" />
                  </svg>
                ),
                title: "Comfortable Seating",
                desc: "Spacious sleeper, semi-sleeper and luxury AC buses for a comfortable journey.",
                iconCol: "text-emerald-600",
                bgCol: "bg-emerald-200/70 border-emerald-200/50"
              },
              {
                icon: (props: any) => (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    <path d="M13 5v14M9 5v14" />
                  </svg>
                ),
                title: "Instant Booking",
                desc: "Search routes, compare and book your tickets in just a few clicks.",
                iconCol: "text-pink-600",
                bgCol: "bg-pink-200/70 border-pink-200/50"
              },
              {
                icon: Headphones,
                title: "24x7 Customer Support",
                desc: "Our support team is available round the clock to assist you whenever you need help.",
                iconCol: "text-sky-600",
                bgCol: "bg-sky-200/70 border-sky-200/70"
              }
            ].map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-lg hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
                >
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border", card.bgCol)}>
                    <IconComp className={cn("w-9 h-9", card.iconCol)} />
                  </div>
                  <h4 className="text-[13px] font-bold text-gray-900 mt-4 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="max-w-6xl mx-auto mt-12 bg-white rounded-2xl border border-gray-150 shadow-xs p-4 md:p-5.5 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {[
              {
                icon: Route,
                value: "15+",
                label: "Routes",
                sub: "Across North India",
                color: "text-blue-600",
                bg: "bg-blue-50/70 border-blue-100/50"
              },
              {
                icon: Bus,
                value: "50+",
                label: "Daily Trips",
                sub: "On Multiple Routes",
                color: "text-purple-600",
                bg: "bg-purple-50/70 border-purple-100/50"
              },
              {
                icon: Users,
                value: "10,000+",
                label: "Happy Travelers",
                sub: "Trust Us For Safe Journey",
                color: "text-orange-500",
                bg: "bg-orange-50/70 border-orange-100/50"
              },
              {
                icon: CheckCircle,
                value: "99%",
                label: "On-Time Performance",
                sub: "Punctual & Reliable Service",
                color: "text-emerald-600",
                bg: "bg-emerald-50/70 border-emerald-100/50"
              }
            ].map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-3.5 justify-start md:justify-center px-2">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border", stat.bg)}>
                    <IconComp className={cn("w-8 h-8", stat.color)} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={cn("text-lg font-black leading-none",stat.color)}>{`${stat.value}`}</span>
                    <span className="text-[9.5px] font-bold text-gray-800 uppercase tracking-wider mt-1 leading-none">{stat.label}</span>
                    <span className="text-[8.5px] text-gray-400 font-semibold mt-0.5 leading-none">{stat.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ POPULAR ROUTES ═══ */}
      

      {/* ═══ AVAILABLE SCHEDULES ═══ */}
      <section id="schedules-section" className="bg-[#f8fafc] pt-[35px] pb-14 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Available Schedules</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 font-medium">
                  Choose from the best bus schedules for your journey
                </p>
              </div>
              <button
                type="button"
                className="lg:hidden p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0 shadow-sm"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              </button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-bold mr-1">Filter by:</span>
              
              {/* From City Select */}
              <select
                value={topBusFromFilter}
                onChange={(e) => setTopBusFromFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold shadow-xs"
              >
                <option value="">All From Cities</option>
                {topBusFromCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* To City Select */}
              <select
                value={topBusToFilter}
                onChange={(e) => setTopBusToFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold shadow-xs"
              >
                <option value="">All To Cities</option>
                {topBusToCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              {/* Bus Type Select */}
              <select
                value={topBusTypeFilter}
                onChange={(e) => setTopBusTypeFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold shadow-xs"
              >
                <option value="">All Bus Types</option>
                {topBusTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Reset Button */}
              {(topBusFromFilter || topBusToFilter || topBusTypeFilter) && (
                <button
                  onClick={() => {
                    setTopBusFromFilter("");
                    setTopBusToFilter("");
                    setTopBusTypeFilter("");
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold px-2.5 py-1.5 bg-blue-50 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className="lg:hidden bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Filters</span>
                {(topBusFromFilter || topBusToFilter || topBusTypeFilter) && (
                  <button
                    onClick={() => {
                      setTopBusFromFilter("");
                      setTopBusToFilter("");
                      setTopBusTypeFilter("");
                    }}
                    className="text-xs text-blue-600 font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">From City</label>
                  <select
                    value={topBusFromFilter}
                    onChange={(e) => setTopBusFromFilter(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600 bg-white font-semibold"
                  >
                    <option value="">All From Cities</option>
                    {topBusFromCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">To City</label>
                  <select
                    value={topBusToFilter}
                    onChange={(e) => setTopBusToFilter(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600 bg-white font-semibold"
                  >
                    <option value="">All To Cities</option>
                    {topBusToCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Bus Type</label>
                  <select
                    value={topBusTypeFilter}
                    onChange={(e) => setTopBusTypeFilter(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2 text-gray-600 bg-white font-semibold"
                  >
                    <option value="">All Bus Types</option>
                    {topBusTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bus Listings */}
          <div className="space-y-4">
            {loadingTopBuses ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 h-[100px] animate-pulse flex items-center gap-4"
                >
                  <div className="w-24 h-16 bg-gray-150 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                     <div className="h-4 bg-gray-150 rounded w-1/3" />
                     <div className="h-3 bg-gray-150 rounded w-1/2" />
                  </div>
                  <div className="w-28 h-8 bg-gray-150 rounded-lg shrink-0 hidden md:block" />
                </div>
              ))
            ) : (() => {
              const currentBuses = hasSearched
                ? topBuses?.filter((bus: any) => {
                    const busStopNames = bus.stops?.map((s: any) => s.stop_name) || [];
                    return (bus.from === searchParams.from || busStopNames.includes(searchParams.from)) && bus.to === searchParams.to;
                  })
                : topBuses;
              if (!currentBuses || currentBuses.length === 0) {
                return (
                  <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500">
                    {hasSearched ? `No buses found for ${searchParams.from} to ${searchParams.to}` : "No active schedules found."}
                  </div>
                );
              }

              const filteredTopBuses = currentBuses?.filter((bus: any) => {
                const matchesFrom = topBusFromFilter ? bus.from === topBusFromFilter : true;
                const matchesTo = topBusToFilter ? bus.to === topBusToFilter : true;
                const matchesType = topBusTypeFilter ? bus.type === topBusTypeFilter : true;
                return matchesFrom && matchesTo && matchesType;
              });

              if (filteredTopBuses.length === 0) {
                return (
                  <div className="bg-white p-8 text-center rounded-xl border border-gray-200 text-gray-500">
                    No matching schedules found for the selected filters.
                  </div>
                );
              }

              const visibleBuses = filteredTopBuses.slice(0, visibleSchedulesCount);
              
              const getTerminal = (cityName: string) => {
                if (!cityName) return "Bus Stand";
                return cityTerminals[cityName] || cityTerminals[cityName.trim()] || "Bus Stand";
              };

              return visibleBuses.map((bus: any) => {
                  const badgeInfo = getBusBadge(bus.type, bus.bus_details?.bus_category || "");
                  
                  return (
                    <div
                      key={bus.id}
                      className="bg-white rounded-xl border border-gray-150 shadow-xs hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                    >
                      {/* DESKTOP CARD LAYOUT */}
                      <div className="hidden lg:flex items-center justify-between p-5 gap-4">
                        {/* Operator Info, Image, Amenities */}
                        <div className="flex gap-4 items-start w-[380px] shrink-0 text-left">
                          {/* Image with Badge overlay */}
                        <div className="w-32 h-[80px] rounded-lg overflow-hidden relative shrink-0 border border-gray-100 bg-gray-50 shadow-xs">
                          <span className={cn("absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider select-none", badgeInfo.bg, badgeInfo.textCol)}>
                            {badgeInfo.text}
                          </span>
                          <img
                            src={getImageUrl(bus.images, bus.id)}
                            alt={bus.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                          />
                        </div>

                          {/* Operator details & amenities wrap row */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-base font-extrabold text-gray-900 leading-tight truncate">{bus.name}</h4>
                              <motion.div 
                                animate={{ 
                                  scale: [1, 1.05, 1],
                                  boxShadow: ["0px 0px 0px rgba(59, 130, 246, 0)", "0px 0px 10px rgba(59, 130, 246, 0.3)", "0px 0px 0px rgba(59, 130, 246, 0)"]
                                }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100 shrink-0"
                              >
                                <Calendar className="w-3.5 h-3.5 text-blue-100" />
                                <span className="text-[11px] font-black uppercase tracking-tight">{formatDisplayDate(bus.date)}</span>
                              </motion.div>
                            </div>
                            <span className="text-xs text-gray-400 font-semibold mb-1.5 block">{bus.type}</span>
                            
                            {/* Amenities flex wrap */}
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 mt-1.5">
                              {bus.amenities?.map((am: string, i: number) => {
                                const IconComp = amenityIcons[am] || Wind;
                                return (
                                  <div key={i} className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                                    <IconComp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    <span className="whitespace-nowrap">{am}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Departure Info */}
                        <div className="w-[140px] shrink-0 text-left">
                          <p className="text-[12px] font-black text-gray-900 leading-tight">{bus.dep}</p>
                          <p className="text-base font-extrabold text-gray-800 mt-1 truncate">{bus.depLoc}</p>
                          <p className="text-[11px] text-gray-400 font-semibold truncate mt-0.5">{getTerminal(bus.depLoc)}</p>
                        </div>

                        {/* Dotted Timeline connector */}
                        <div className="flex-1 flex flex-col items-center justify-center px-2 min-w-[120px]">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                            {formatDuration(bus.duration)} {bus.bus_details?.route?.distance ? `• ${bus.bus_details.route.distance} KM` : ''}
                          </span>
                          <div className="w-full flex items-center gap-1 relative my-0.5">
                            <div className="h-px border-t border-dashed border-gray-300 flex-1" />
                            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                              <Bus className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                            <div className="h-px border-t border-dashed border-gray-300 flex-1" />
                          </div>
                          
                          {bus.nonStop ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingStoppages({ stops: bus.stops || [], from: bus.from, to: bus.to });
                              }}
                              className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 mt-0.5 select-none cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                            >
                              Non Stop
                            </span>
                          ) : (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingStoppages({ stops: bus.stops || [], from: bus.from, to: bus.to });
                              }}
                              className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 mt-0.5 select-none cursor-pointer hover:bg-orange-100 hover:border-orange-300 transition-colors"
                            >
                              {bus.stops_count} Stop{bus.stops_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Arrival Info */}
                        <div className="w-[140px] shrink-0 text-left">
                          <p className="text-[12px] font-black text-gray-900 leading-tight">{bus.arr}</p>
                          <p className="text-base font-extrabold text-gray-800 mt-1 truncate">{bus.arrLoc}</p>
                          <p className="text-[11px] text-gray-400 font-semibold truncate mt-0.5">{getTerminal(bus.arrLoc)}</p>
                        </div>

                        {/* Seats Left & Driver Details */}
                        <div className="w-[140px] shrink-0 flex flex-col justify-between h-[65px] text-left">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-green-50 text-green-700 border border-green-200 w-max select-none">
                            <svg className="w-3.5 h-3.5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 18H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
                              <path d="M14 2H10a2 2 0 0 0-2 2v3h8V4a2 2 0 0 0-2-2z" />
                              <path d="M6 18v3" />
                              <path d="M18 18v3" />
                            </svg>
                            {bus.seats} Seats Left
                          </span>
                          
                          <div className="flex items-center gap-2 mt-1 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col text-[10px]">
                              <span className="text-gray-400 font-bold leading-none mb-0.5 select-none">Driver</span>
                              <span className="font-extrabold text-gray-800 truncate leading-tight">{bus.driver_name || 'Rajesh Kumar'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Book Now */}
                        <div className="flex flex-col items-center justify-center gap-1.5 w-[120px] shrink-0 text-right ml-4">
                          <span className="text-xl font-extrabold text-gray-900">{bus.price}</span>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg h-9 flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newParams = {
                                from: bus.from,
                                to: bus.to,
                                date: bus.date,
                                passengers: searchParams.passengers,
                              };
                              localStorage.setItem("search_params", JSON.stringify(newParams));
                              localStorage.setItem("selected_schedule_id", String(bus.id));
                              navigate("/booking");
                            }}
                          >
                            Book Now
                            <svg className="w-3 h-3 stroke-[3] ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Button>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/schedule/${bus.id}`);
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors mt-0.5 select-none"
                          >
                            View Details &gt;
                          </span>
                        </div>
                      </div>

                      {/* MOBILE CARD LAYOUT (Pixel Perfect to Mobile Mockup) */}
                      <div className="lg:hidden flex flex-col p-3 gap-[3px]">
                        {/* Top row: Badge + Operator Name + Type */}
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider select-none shrink-0", badgeInfo.bg, badgeInfo.textCol)}>
                              {badgeInfo.text}
                            </span>
                            <div className="min-w-0 text-left">
                              <h4 className="text-sm font-extrabold text-gray-955 leading-tight">{bus.name}</h4>
                              <p className="text-[10px] text-gray-400 font-semibold mt-0.5 select-none">{bus.type}</p>
                            </div>
                          </div>
                          {/* Journey Date Badge - Mobile */}
                           <motion.div 
                             animate={{ 
                               backgroundColor: ["#eff6ff", "#dbeafe", "#eff6ff"],
                               scale: [1, 1.02, 1]
                             }}
                             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                             className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shadow-sm shrink-0"
                           >
                             <Calendar className="w-3 h-3 text-blue-500" />
                             <span className="text-[10px] font-black uppercase tracking-tight">{formatDisplayDate(bus.date)}</span>
                           </motion.div>
                        </div>

                        {/* Mobile Amenities/Facilities Row */}
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-left">
                          {bus.amenities?.map((am: string, i: number) => {
                            const IconComp = amenityIcons[am] || Wind;
                            return (
                              <div key={i} className="flex items-center gap-1 text-[9px] text-gray-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/50">
                                <IconComp className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="whitespace-nowrap">{am}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Middle row: Timeline Connector */}
                        <div className="grid grid-cols-3 gap-1.5 items-center py-1 border-t border-gray-50">
                          {/* Departure */}
                          <div className="flex flex-col text-left min-w-0">
                            <p className="text-[11px] font-bold text-gray-700 leading-none">{bus.dep}</p>
                            <p className="text-[15px] text-gray-900 font-extrabold mt-0.5 truncate">{bus.depLoc}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5 truncate">{getTerminal(bus.depLoc)}</p>
                          </div>

                          {/* Connection */}
                          <div className="flex flex-col items-center justify-center px-1">
                            <span className="text-[8px] font-bold text-gray-400 select-none">{formatDuration(bus.duration)}</span>
                            <div className="w-full flex items-center gap-0.5 relative my-0.5">
                              <div className="h-px border-t border-dashed border-gray-300 flex-1" />
                              <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 z-10">
                                <Bus className="w-2.5 h-2.5 text-blue-500" />
                              </div>
                              <div className="h-px border-t border-dashed border-gray-300 flex-1" />
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="flex flex-col text-right min-w-0">
                            <p className="text-[11px] font-bold text-gray-700 leading-none">{bus.arr}</p>
                            <p className="text-[15px] text-gray-900 font-extrabold mt-0.5 truncate">{bus.arrLoc}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5 truncate">{getTerminal(bus.arrLoc)}</p>
                          </div>
                        </div>

                        {/* Seats Left & Driver Details Row */}
                        <div className="flex items-center justify-between py-1 border-t border-b border-gray-50">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-50 text-green-700 border border-green-200 select-none">
                            <svg className="w-2.5 h-2.5 text-green-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 18H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2z" />
                              <path d="M14 2H10a2 2 0 0 0-2 2v3h8V4a2 2 0 0 0-2-2z" />
                              <path d="M6 18v3" />
                              <path d="M18 18v3" />
                            </svg>
                            {bus.seats} Seats Left
                          </span>
                          
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                              <User className="w-2.5 h-2.5" />
                            </div>
                            <div className="flex flex-col text-[8.5px] text-left">
                              <span className="text-gray-400 font-bold leading-none select-none">Driver</span>
                              <span className="font-extrabold text-gray-800 truncate max-w-[90px] leading-tight mt-0.5">{bus.driver_name || 'Rajesh Kumar'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Stop Badge & Price */}
                        <div className="flex justify-between items-center gap-2">
                          {bus.nonStop ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingStoppages({ stops: bus.stops || [], from: bus.from, to: bus.to });
                              }}
                              className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 select-none cursor-pointer hover:bg-green-100 hover:border-green-300 transition-colors"
                            >
                              Non Stop
                            </span>
                          ) : (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingStoppages({ stops: bus.stops || [], from: bus.from, to: bus.to });
                              }}
                              className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 select-none flex items-center gap-0.5 cursor-pointer hover:bg-orange-100 hover:border-orange-300 transition-colors"
                            >
                              <svg className="w-3 h-3 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {bus.stops_count} Stop{bus.stops_count > 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-base font-black text-gray-955">{bus.price}</span>
                        </div>

                        {/* Action CTA Button */}
                        <div className="flex flex-col gap-1 mt-0.5">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg h-8 flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newParams = {
                                from: bus.from,
                                to: bus.to,
                                date: bus.date,
                                passengers: searchParams.passengers,
                              };
                              localStorage.setItem("search_params", JSON.stringify(newParams));
                              localStorage.setItem("selected_schedule_id", String(bus.id));
                              navigate("/booking");
                            }}
                          >
                            Book Now
                          </Button>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/schedule/${bus.id}`);
                            }}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors mt-0.5 select-none text-center"
                          >
                            View Details &gt;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
          </div>

          {/* Show More Schedules CTA Button */}
          {(() => {
            const currentBuses = hasSearched
              ? topBuses?.filter((bus: any) => {
                  const busStopNames = bus.stops?.map((s: any) => s.stop_name) || [];
                  return (bus.from === searchParams.from || busStopNames.includes(searchParams.from)) && bus.to === searchParams.to;
                })
              : topBuses;
            const filteredTopBuses = currentBuses?.filter((bus: any) => {
              const matchesFrom = topBusFromFilter ? bus.from === topBusFromFilter : true;
              const matchesTo = topBusToFilter ? bus.to === topBusToFilter : true;
              const matchesType = topBusTypeFilter ? bus.type === topBusTypeFilter : true;
              return matchesFrom && matchesTo && matchesType;
            }) || [];
            
            if (filteredTopBuses.length > visibleSchedulesCount) {
              return (
                <div className="mt-8 text-center">
                  <button
                    className="border border-gray-250 bg-white hover:bg-gray-50 text-gray-500 rounded-full px-7 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 mx-auto transition-colors shadow-xs"
                    onClick={() => setVisibleSchedulesCount(prev => prev + 5)}
                  >
                    ↓ Show more
                  </button>
                </div>
              );
            }
            
            return null;
          })()}
        </div>
      </section>

      {/* ═══ TRUST / GUARANTEE BADGES ═══ */}
      <section className="bg-gray-50 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Shield, bg: "bg-blue-100", color: "text-blue-600", title: "Best Price Guarantee", desc: "We ensure best prices on every booking" },
              { icon: Lock, bg: "bg-green-100", color: "text-green-600", title: "Secure & Safe Booking", desc: "Your payments are safe and secure with us" },
              { icon: RotateCcw, bg: "bg-red-100", color: "text-red-500", title: "Easy Cancellation", desc: "Get full refund on cancellation as per policy" },
              { icon: Headphones, bg: "bg-blue-100", color: "text-blue-600", title: "24/7 Customer Support", desc: "We are here to help you anytime anywhere" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className="bg-white rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition-all duration-200"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      badge.bg
                    )}
                  >
                    <Icon className={cn("w-5 h-5", badge.color)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">{badge.title}</p>
                    <p className="text-[11px] text-gray-500 leading-snug">{badge.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ BHINDER FEATURES BANNER SECTION ═══ */}
      <section className="bg-[#F8FAFF] pt-10 sm:pt-16 pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-5 sm:p-8 lg:p-12 relative w-full">
            
            {/* Left Column - Image Container with floating badge */}
            <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[480px] rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img
                src="/landing/hero-bus.png"
                alt="Bhinder Premium Bus"
                className="w-full h-full object-cover object-center"
              />
              {/* Floating Safe & Secure Card */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl shadow-lg border border-slate-100/50 flex items-center gap-3 max-w-[220px] sm:max-w-[250px]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900">Safe & Secure</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your safety is our top priority</p>
                </div>
              </div>
            </div>

            {/* Right Column - Text & Features */}
            <div className="flex flex-col items-start gap-4 sm:gap-6 text-left">
              {/* Top Tag Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                <Bus className="w-3.5 h-3.5 text-blue-600" />
                Bhinder Bus Service
              </div>

              {/* Heading */}
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Travel Easy, Travel Better with <span className="text-blue-600">Bhinder</span>
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed">
                We make every journey comfortable, safe, and memorable. Book your bus tickets with ease and enjoy premium service across multiple routes.
              </p>

              {/* Grid of 4 Feature Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full mt-1.5">
                {/* Feature 1: Comfortable Journey */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    {/* Bus Seating SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M7 4h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7" />
                      <path d="M7 18H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
                      <path d="M16 11h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" />
                      <path d="M6 18v3M14 18v3" />
                    </svg>
                  </div>
                  <div className="text-left leading-tight">
                    <h4 className="text-[13px] font-extrabold text-slate-900">Comfortable Journey</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">
                      Premium buses with spacious seating and modern amenities.
                    </p>
                  </div>
                </div>

                {/* Feature 2: Safe & Reliable */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left leading-tight">
                    <h4 className="text-[13px] font-extrabold text-slate-900">Safe & Reliable</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">
                      Trained drivers and well-maintained buses for your safety.
                    </p>
                  </div>
                </div>

                {/* Feature 3: Easy Booking */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    {/* Ticket SVG */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v14M9 5v14" />
                    </svg>
                  </div>
                  <div className="text-left leading-tight">
                    <h4 className="text-[13px] font-extrabold text-slate-900">Easy Booking</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">
                      Book tickets in just a few clicks through our simple process.
                    </p>
                  </div>
                </div>

                {/* Feature 4: 24/7 Support */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="text-left leading-tight">
                    <h4 className="text-[13px] font-extrabold text-slate-900">24/7 Customer Support</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-normal">
                      We're here to help you anytime, anywhere on your journey.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Mini-Stats Bar */}
              <div className="w-full mt-4 bg-blue-50/40 rounded-2xl border border-blue-100/50 p-3 flex flex-row items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                {[
                  { val: "10,000+", label: "Happy Customers", icon: Users, col: "text-blue-600" },
                  { val: "50+", label: "Buses on Road", icon: Bus, col: "text-blue-600" },
                  { val: "100+", label: "Routes Covered", icon: Route, col: "text-blue-600" },
                  { val: "4.8", label: "Customer Rating", icon: Star, col: "text-amber-500" }
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="flex items-center gap-2.5 flex-1 min-w-[110px] justify-center sm:justify-start">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-blue-100 shadow-xs shrink-0">
                        <StatIcon className={cn("w-4 h-4", stat.col)} />
                      </div>
                      <div className="text-left leading-none">
                        <p className="text-xs sm:text-sm font-black text-slate-800">{stat.val}</p>
                        <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold mt-1">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="bg-gray-50 pt-[30px] pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rahul Sharma", rating: 4.5, quote: "Very good service! Bus was on time and booking process was so easy. Will definitely use again.", initials: "RS", color: "bg-blue-100 text-blue-600" },
              { name: "Priya Kumari", rating: 4.8, quote: "Comfortable bus and smooth journey. Highly recommended! The seat selection feature is great.", initials: "PK", color: "bg-emerald-100 text-emerald-600" },
              { name: "Amit Verma", rating: 4.6, quote: "Best prices and customer support is very helpful. Got quick refund on cancellation too.", initials: "AV", color: "bg-purple-100 text-purple-600" },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm",
                      t.color
                    )}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < Math.floor(t.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-200"
                          )}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">{t.rating}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TRUSTED PARTNERS ═══ */}
      <section className="bg-white pt-[30px] pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F4F8FF] rounded-[32px] p-6 sm:p-8 border border-blue-50/40 flex flex-col items-center">
            
            {/* Styled Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-black uppercase tracking-widest text-slate-800">
                <span className="text-blue-600 text-base">•••</span>
                Our Trusted Partners
                <span className="text-blue-600 text-base">•••</span>
              </div>
            </div>

            {/* Partners Grid */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 w-full">
              {[
                {
                  id: "paytm",
                  logo: (
                    <svg viewBox="0 0 100 32" className="h-6 w-auto">
                      <text x="0" y="24" fill="#00b9f5" fontFamily="sans-serif" fontWeight="900" fontSize="24" fontStyle="italic">pay</text>
                      <text x="44" y="24" fill="#002e6e" fontFamily="sans-serif" fontWeight="900" fontSize="24" fontStyle="italic">tm</text>
                    </svg>
                  )
                },
                {
                  id: "phonepe",
                  logo: (
                    <svg viewBox="0 0 120 32" className="h-6.5 w-auto">
                      <rect x="2" y="4" width="24" height="24" rx="6" fill="#5f259f" />
                      <path d="M14 8h-3v10h3v-3.5h2.5c1.5 0 2.5-1 2.5-2.5V11c0-1.5-1-3-2.5-3Zm-0.5 4h1c0.5 0 0.8.3.8.8v1.4c0 .5-.3.8-.8.8h-1Z" fill="#ffffff" />
                      <text x="34" y="22" fill="#5f259f" fontFamily="sans-serif" fontWeight="900" fontSize="16">PhonePe</text>
                    </svg>
                  )
                },
                {
                  id: "gpay",
                  logo: (
                    <svg viewBox="0 0 130 32" className="h-6.5 w-auto">
                      <g transform="translate(2, 4)">
                        <path d="M12 9.5v3h4.6c-.2 1.2-.9 2.2-2 3l2.6 2c1.5-1.4 2.4-3.5 2.4-6 0-.6-.05-1.2-.15-1.8H12Z" fill="#4285F4" />
                        <path d="M12 20c2.2 0 4-1 5.3-2.6l-2.6-2c-.7.5-1.6.8-2.7.8-2 0-3.8-1.4-4.4-3.3l-2.7 2C6.2 17.5 8.9 20 12 20Z" fill="#34A853" />
                        <path d="M7.6 12.9a5 5 0 0 1 0-3l-2.7-2c-.6 1.2-.9 2.5-.9 3.9s.3 2.7.9 3.9l2.7-2.8Z" fill="#FBBC05" />
                        <path d="M12 4c1.2 0 2.3.4 3.1 1.2l2.3-2.3C16 1.8 14.2 1 12 1 8.9 1 6.2 3.5 4.9 6.2l2.7 2C8.2 5.4 10 4 12 4Z" fill="#EA4335" />
                      </g>
                      <text x="34" y="22" fill="#5f6368" fontFamily="sans-serif" fontWeight="bold" fontSize="15">Google Pay</text>
                    </svg>
                  )
                },
                {
                  id: "upi",
                  logo: (
                    <svg viewBox="0 0 100 32" className="h-6 w-auto">
                      <text x="2" y="22" fill="#0f80bb" fontFamily="sans-serif" fontWeight="900" fontSize="20" fontStyle="italic">UPI</text>
                      <text x="2" y="30" fill="#f26f21" fontFamily="sans-serif" fontWeight="bold" fontSize="6" letterSpacing="0.2">UNIFIED PAYMENTS INTERFACE</text>
                      <path d="M72 6 L86 16 L72 26 L78 16 Z" fill="#f26f21" />
                      <path d="M80 6 L94 16 L80 26 L86 16 Z" fill="#0f80bb" />
                    </svg>
                  )
                },
                {
                  id: "razorpay",
                  logo: (
                    <svg viewBox="0 0 120 32" className="h-6 w-auto">
                      <path d="M12 4 L24 16 L12 28 L4 16 Z" fill="#0b72e7" opacity="0.1" />
                      <path d="M4 16 L16 8 L12 22 Z" fill="#0b72e7" />
                      <path d="M12 22 L20 16 L16 8 Z" fill="#052c65" />
                      <text x="32" y="22" fill="#0a2540" fontFamily="sans-serif" fontWeight="900" fontSize="16">Razorpay</text>
                    </svg>
                  )
                },
                {
                  id: "visa",
                  logo: (
                    <svg viewBox="0 0 80 32" className="h-6 w-auto">
                      <text x="4" y="24" fill="#1a1f71" fontFamily="sans-serif" fontWeight="900" fontSize="24" fontStyle="italic" letterSpacing="-1">VISA</text>
                      <polygon points="4,11 12,11 10,14 6,14" fill="#f7b600" />
                    </svg>
                  )
                },
                {
                  id: "mastercard",
                  logo: (
                    <svg viewBox="0 0 80 32" className="h-6.5 w-auto">
                      <circle cx="20" cy="16" r="11" fill="#eb001b" opacity="0.95" />
                      <circle cx="33" cy="16" r="11" fill="#ff5f00" opacity="0.9" />
                      <text x="48" y="20" fill="#222222" fontFamily="sans-serif" fontWeight="bold" fontSize="9">mastercard</text>
                    </svg>
                  )
                }
              ].map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-center px-4 py-2 bg-white rounded-2xl border border-slate-100/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-300 w-[125px] sm:w-[145px] h-[54px] shrink-0"
                >
                  {partner.logo}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-slate-900 text-gray-300">
        {/* Top Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1 - Logo & About */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Logo" className="h-10 object-contain" />
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Your journey, our priority! Book safe, travel happy!
              </p>
              <div className="flex items-center gap-3">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2 - Company */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-2.5">
                {["About Us", "Careers", "Press", "Blog"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 - Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {["Buses", "Routes", "Offers", "Track Booking"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate(link === "Track Booking" ? "/track" : "/")} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 - Help */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-4">Help</h3>
              <ul className="space-y-2.5">
                {["How to Book", "Cancellation Policy", "FAQ", "Contact Support"].map((link) => (
                  <li key={link}>
                    <button onClick={() => navigate("/")} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-10 pt-8 border-t border-slate-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Bhinderbusservice@gmail.com
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +91 8092000025
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  132/15 , Ind.Area , Near SBI Bank , Patiala Road , Cheeka
                </span>
              </div>
              
              <div className="flex items-center gap-4 border-l border-slate-700 pl-6 lg:border-l lg:pl-8">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  Admin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-gray-500">
                © 2024 BusBook. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {["Terms & Conditions", "Privacy Policy", "Refund Policy", "Sitemap"].map(
                  (link) => (
                    <button key={link} onClick={() => navigate("/")} className="hover:text-white transition-colors">
                      {link}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </footer>
      <PublicBusDetailsDialog
        bus={viewingBusDetails}
        open={!!viewingBusDetails}
        onOpenChange={(open) => !open && setViewingBusDetails(null)}
      />
      <ScheduleStoppagesDialog
        viewingStoppages={viewingStoppages}
        open={!!viewingStoppages}
        onOpenChange={(open) => !open && setViewingStoppages(null)}
      />
    </div>
  );
}

function PublicBusDetailsDialog({ bus, open, onOpenChange }: { bus: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!bus) return null;

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
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b bg-white sticky top-0 z-10">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600" />
            {bus.bus_name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Full details and specifications of the vehicle
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="space-y-6 sm:space-y-8">
            {/* Images Grid */}
            {bus.images && bus.images.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Vehicle Photos
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {bus.images.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                      <img 
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/image/${img}`} 
                        alt="Bus" 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
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

/* ═══════════════════════════════════════════════
   SCHEDULE STOPPAGES POPUP (Only Stoppages Timeline)
   ═══════════════════════════════════════════════ */
function ScheduleStoppagesDialog({ viewingStoppages, open, onOpenChange }: { viewingStoppages: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!viewingStoppages) return null;

  const { stops, from, to } = viewingStoppages;

  const formatTime12h = (timeStr: string) => {
    if (!timeStr) return "--:--";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    try {
      const parts = timeStr.split(":");
      if (parts.length >= 2) {
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
      }
    } catch (e) {}
    return timeStr;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] sm:w-full max-h-[85vh] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-gray-100 text-left">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
            <Route className="w-5 h-5 text-emerald-600" />
            Route Stoppages ({stops?.length || 0})
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            Intermediate stops for {from} to {to}
          </p>
        </DialogHeader>

        <ScrollArea className="p-5 max-h-[calc(85vh-90px)] text-gray-700">
          <div className="relative pl-6 space-y-5 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
            {stops && stops.length > 0 ? (
              stops.map((stop: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                    <div className="space-y-1.5 min-w-0 flex-1 text-left">
                      <p className="text-sm font-bold text-gray-955 truncate">{stop.stop_name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Arr: {formatTime12h(stop.arrival_time)}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>Dep: {formatTime12h(stop.departure_time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                        ₹{stop.fare}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400 italic">
                No intermediate stops defined for this journey.
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-row justify-end">
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
