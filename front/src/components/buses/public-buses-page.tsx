"use client";

import React, { useState } from "react";
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
import { cn } from "@/lib/utils";

export function PublicBusesPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fromCityFilter, setFromCityFilter] = useState("");
  const [toCityFilter, setToCityFilter] = useState("");
  const [busTypeFilter, setBusTypeFilter] = useState("");

  const { data: buses, isLoading: loadingBuses } = usePublicBuses();
  const [viewingBus, setViewingBus] = useState<any>(null);

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
                      if (i === 1) navigate("/buses");
                      if (i === 2) navigate("/routes");
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
                      if (i === 1) navigate("/buses");
                      if (i === 2) navigate("/routes");
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
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 animate-fade-in">
            Our Premium Fleet
          </h1>
          <p className="text-base sm:text-xl text-blue-100 max-w-2xl mx-auto font-light leading-relaxed">
            Browse our world-class coaches and sleeper buses equipped with state-of-the-art amenities for a safe and comfortable travel experience.
          </p>
        </div>
      </section>

      {/* ═══ MAIN SEARCH & LISTING ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Filters Container */}
        <div className="max-w-4xl mx-auto mb-10 bg-white rounded-2xl border border-gray-100 shadow-md p-4 sm:p-5">
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

            {/* Bus Type Filter */}
            <div className="w-full space-y-1 text-left">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Bus Type</label>
              <select
                value={busTypeFilter}
                onChange={(e) => setBusTypeFilter(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">All Bus Types</option>
                {busTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(fromCityFilter || toCityFilter || busTypeFilter) && (
              <div className="shrink-0 w-full sm:w-auto mt-0 sm:mt-5">
                <Button
                  onClick={() => {
                    setFromCityFilter("");
                    setToCityFilter("");
                    setBusTypeFilter("");
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

              return (
                <div
                  key={bus.id}
                  onClick={() => setViewingBus(bus)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Bus Image Thumbnail */}
                    <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-150 bg-gray-50 shrink-0 shadow-xs">
                      {bus.images && bus.images.length > 0 ? (
                        <img
                          src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${bus.images[0]}`}
                          alt={bus.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                          <Bus className="w-6 h-6 text-blue-500" />
                        </div>
                      )}
                    </div>

                    {/* Brand/Operator Column */}
                    <div className="lg:w-[250px] shrink-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div>
                          <span className="text-sm font-bold text-gray-900 block leading-tight">{bus.name}</span>
                          <span className="text-[11px] text-gray-400 font-semibold">{bus.operator}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">{bus.number}</p>
                    </div>

                    {/* Specifications Section */}
                    <div className="lg:w-[180px] shrink-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight">{bus.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Vehicle Type</p>
                    </div>

                    <div className="lg:w-[150px] shrink-0">
                      <p className="text-sm font-bold text-gray-800 leading-tight">{bus.seats} Seats</p>
                      <p className="text-xs text-gray-400 mt-0.5">Seating Capacity</p>
                    </div>

                    {/* Amenities List */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-semibold mb-1">Key Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {bus.amenities.map((amenity: string) => (
                          <span
                            key={amenity}
                            className="text-[10px] text-gray-600 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded font-semibold"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Booking CTA Button */}
                    <div className="flex items-center gap-4 lg:ml-auto lg:shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md px-5 h-9 shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookNow(bus);
                          }}
                        >
                          Book Ride
                        </Button>
                        <span className="text-[10px] text-gray-400 font-semibold">Premium Travel</span>
                      </div>
                    </div>
                  </div>
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
                        src={`${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${img}`} 
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
