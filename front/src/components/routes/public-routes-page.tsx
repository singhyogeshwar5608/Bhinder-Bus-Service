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
  Route
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
import { usePopularRoutes } from "@/hooks/use-search";
import { cn } from "@/lib/utils";

export function PublicRoutesPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fromCityFilter, setFromCityFilter] = useState("");
  const [toCityFilter, setToCityFilter] = useState("");

  const { data: popularRoutes, isLoading: loadingRoutes } = usePopularRoutes();
  const [viewingRoute, setViewingRoute] = useState<any>(null);

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
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">BusBook</span>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {["Home", "Buses", "Routes", "Offers", "Track Booking", "Help"].map(
                (link, i) => (
                  <button
                    key={link}
                    onClick={() => {
                      if (i === 0) navigate("/");
                      if (i === 2) navigate("/routes");
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
                onClick={() => navigate("/booking")}
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
              {["Home", "Buses", "Routes", "Offers", "Track Booking", "Help"].map(
                (link, i) => (
                  <a
                    key={link}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (i === 0) navigate("/");
                      if (i === 2) navigate("/routes");
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
                  onClick={() => { navigate("/booking"); setMobileMenuOpen(false); }}
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
      <section className="relative pt-24 pb-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
            Explore Our Routes
          </h1>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            Connecting you across major cities with speed, comfort, and premium quality service. Select a route to book your ride instantly.
          </p>
        </div>
      </section>

      {/* ═══ MAIN ROUTE SEARCH & GRID ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Filters Container */}
        <div className="max-w-3xl mx-auto mb-10 bg-white rounded-2xl border border-gray-100 shadow-md p-4 sm:p-5">
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

              return (
                <div
                  key={route.id}
                  onClick={() => setViewingRoute(route)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Route Brand Column */}
                    <div className="lg:w-[220px] shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", colorClass)}>
                          {firstLetter}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{route.from} to {route.to}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{route.distance ? `${route.distance} KM Distance` : "Direct Connect"}</p>
                      
                      {/* Amenities badges */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {["AC Sleeper", "Charging Points", "Water Bottle"].map((a) => (
                          <span
                            key={a}
                            className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Departure Block */}
                    <div className="lg:w-[160px] shrink-0">
                      <p className="text-sm font-bold text-gray-900">{route.from}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Origin City</p>
                    </div>

                    {/* Timeline Line */}
                    <div className="flex items-center gap-2 lg:w-[140px] shrink-0">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-6 sm:w-10 h-px bg-gray-300" />
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 font-medium">{route.time}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 -my-0.5" />
                        </div>
                        <div className="w-6 sm:w-10 h-px bg-gray-300" />
                      </div>
                    </div>

                    {/* Arrival Block */}
                    <div className="lg:w-[160px] shrink-0">
                      <p className="text-sm font-bold text-gray-900">{route.to}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Destination City</p>
                    </div>

                    {/* Status / Stops Badge */}
                    <div className="lg:w-[72px] shrink-0">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                        Active
                      </span>
                    </div>

                    {/* Fare price & CTA block */}
                    <div className="flex items-center gap-4 lg:ml-auto lg:shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{route.price}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md px-4 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteClick(route);
                          }}
                        >
                          Book Now
                        </Button>
                        <span className="text-[10px] text-gray-400 font-medium">{route.buses} Daily Buses</span>
                      </div>
                    </div>
                  </div>
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
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BusBook</span>
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

      <RouteViewDialog
        route={viewingRoute}
        open={!!viewingRoute}
        onOpenChange={(open) => !open && setViewingRoute(null)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROUTE VIEW DIALOG (matching admin style)
   ══════════════════�  const mainDetails = [
    { label: "From City", value: route.from_city, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Arrival Time", value: route.from_city_arrival_time || "N/A", icon: Clock, color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: "To City", value: route.to_city, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Distance", value: route.distance ? `${route.distance} km` : "N/A", icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Duration", value: route.time || "N/A", icon: Timer, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Total Fare", value: `₹${route.total_fare || '650'}`, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Road Type", value: route.road_type || "N/A", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Status", value: route.status?.toUpperCase(), icon: CheckCircle2, color: route.status === 'active' ? "text-emerald-600" : "text-red-600", bg: route.status === 'active' ? "bg-emerald-50" : "bg-red-50" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] md:w-full max-w-3xl max-h-[90vh] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Route className="w-5 h-5 text-blue-600" />
            Route Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-4 sm:p-6 max-h-[calc(90vh-80px)] text-gray-700">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center justify-between gap-2 sm:gap-6">
                <div className="text-left min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">Starting Point</p>
                  <h3 className="text-base sm:text-2xl font-black text-gray-950 leading-tight truncate">{route.from_city}</h3>
                  <div className="flex items-center gap-1 mt-0.5 text-gray-500">
                    <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] sm:text-sm font-medium truncate">{route.from_city_arrival_time || "Time not set"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-0.5 flex-1 px-1 sm:px-4 min-w-[65px] sm:min-w-none">
                  <div className="w-full h-px bg-dashed border-t border-dashed border-gray-300 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500" />
                    </div>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase mt-3 sm:mt-4 text-center leading-none">
                    {route.distance ? `${route.distance} KM` : ""} {route.time ? `• ${route.time}` : ""}
                  </span>
                </div>

                <div className="text-right min-w-0 flex-1">
                  <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Destination</p>
                  <h3 className="text-base sm:text-2xl font-black text-gray-955 leading-tight truncate">{route.to_city}</h3>
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-gray-500">
                    <IndianRupee className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-gray-400 shrink-0" />
                    <span className="text-[10px] sm:text-sm font-bold text-blue-600 truncate">{route.price}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Quick Info Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  General Information
                </h4>
                <div className="grid grid-cols-2 gap-3">text-sm font-semibold text-gray-900 flex items-center gap-2">
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
