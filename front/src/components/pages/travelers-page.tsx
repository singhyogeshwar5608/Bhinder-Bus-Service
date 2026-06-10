"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Ticket,
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTravelers } from "@/hooks/use-booking";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

const avatarColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-teal-50 text-teal-600",
  "bg-orange-50 text-orange-600",
  "bg-cyan-50 text-cyan-600",
  "bg-pink-50 text-pink-600",
  "bg-violet-50 text-violet-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function TravelersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewTicket, setViewTicket] = useState<any>(null);
  const { data: travelersResponse, isLoading, isError } = useTravelers(page, search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  const stats = travelersResponse?.stats;
  const travelers = travelersResponse?.data || [];
  const meta = travelersResponse?.meta;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[
          {
            title: "Total Travelers",
            amount: stats ? formatNumber(stats.total_travelers) : "—",
            subtitle: "All travelers in system",
            icon: Users,
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
          },
          {
            title: "Active Travelers",
            amount: stats ? formatNumber(stats.active_travelers) : "—",
            subtitle: stats ? `${((stats.active_travelers / stats.total_travelers) * 100).toFixed(1)}% of total travelers` : "—",
            icon: UserCheck,
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
          },
          {
            title: "Inactive Travelers",
            amount: stats ? formatNumber(stats.inactive_travelers) : "—",
            subtitle: stats ? `${((stats.inactive_travelers / stats.total_travelers) * 100).toFixed(1)}% of total travelers` : "—",
            icon: UserX,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600",
          },
          {
            title: "Total Bookings",
            amount: stats ? formatNumber(stats.total_bookings) : "—",
            subtitle: "By all travelers",
            icon: Ticket,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
          },
        ].map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{card.amount}</p>
                <p className="text-xs text-gray-400">{card.subtitle}</p>
              </div>
              <div className={cn("w-11 h-11 rounded-full flex items-center justify-center", card.iconBg)}>
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Row */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or booking ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 h-10 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {setSearchInput(""); setSearch(""); setPage(1);}} className="h-10 border-gray-200">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Travelers Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading travelers...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading travelers.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Traveler Name</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Booked By</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Mobile</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Email</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Booking ID</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                        No travelers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    travelers.map((traveler: any, idx: number) => {
                      const booking = traveler.booking || {};
                      return (
                        <TableRow key={traveler.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                  {(traveler.name || "?").charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-bold text-blue-700">{traveler.name}</span>
                                <p className="text-xs text-gray-400">Age: {traveler.age || "—"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm font-medium text-purple-700">{booking.customer_name || "—"}</span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm font-mono text-cyan-700">{booking.customer_phone || "—"}</span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm text-amber-700">{booking.customer_email || "—"}</span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm font-mono text-blue-600">{booking.booking_number || "—"}</span>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600"
                              onClick={() => setViewTicket(traveler)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{meta.from || 0}</span> to <span className="font-medium text-gray-900">{meta.to || 0}</span> of <span className="font-medium text-gray-900">{meta.total || 0}</span> travelers
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket View Popup */}
      <Dialog open={!!viewTicket} onOpenChange={(o) => !o && setViewTicket(null)}>
        <DialogContent className="max-w-[95%] sm:max-w-[520px] max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-0 border-none shadow-2xl">
          {viewTicket && (() => {
            const t = viewTicket;
            const b = t.booking || {};
            const s = b.schedule || {};
            const route = s.route || {};
            const bus = s.bus || {};
            const seats = Array.isArray(b.seat_numbers) ? b.seat_numbers.join(", ") : b.seat_numbers || t.seat_number || "—";
            return (
              <div className="bg-white">
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-center gap-2.5 mb-2">
                      <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none"><rect width="40" height="40" rx="10" fill="white" opacity="0.2" /><path d="M12 14h16v12H12z" fill="white" opacity="0.9" /><rect x="14" y="16" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" /><rect x="21" y="16" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" /><rect x="14" y="20" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" /><rect x="21" y="20" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" /><circle cx="14" cy="26" r="2" fill="white" opacity="0.8" /><circle cx="26" cy="26" r="2" fill="white" opacity="0.8" /><rect x="28" y="16" width="3" height="8" rx="1" fill="white" opacity="0.6" /></svg>
                      <div className="text-left">
                        <p className="text-base font-black text-white tracking-tight leading-none">Bhinder Bus Service</p>
                        <p className="text-[9px] font-bold text-blue-200 tracking-wider mt-0.5">TRAVEL WITH COMFORT</p>
                      </div>
                    </div>
                    <div className="w-12 h-0.5 bg-white/30 rounded-full mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-blue-200 mt-1.5">Booking #{b.booking_number || "—"}</p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200">
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">From</p>
                      <p className="text-sm font-black text-slate-800 truncate">{s.from || route.from_city || "—"}</p>
                    </div>
                    <div className="text-center shrink-0 text-[9px] font-bold text-slate-400">{s.duration || "—"}</div>
                    <div className="text-right flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">To</p>
                      <p className="text-sm font-black text-slate-800 truncate">{s.to || route.to_city || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Passenger</p>
                      <p className="text-xs font-black text-slate-800">{t.name}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seat</p>
                      <p className="text-xs font-black text-blue-600">{t.seat_number || "—"}</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Booked By</p>
                        <p className="text-xs font-black text-slate-800 truncate">{b.customer_name || "—"}</p>
                        <p className="text-[10px] text-slate-500">{b.customer_phone} | {b.customer_email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Journey Date</p>
                      <p className="text-xs font-black text-slate-800">{s.journey_date || s.date || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
