"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  MapPin,
  Calendar as CalendarIcon,
  CreditCard,
  Smartphone,
  Wallet,
  Landmark,
  Banknote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useBookings } from "@/hooks/use-booking";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/services/api";

const avatarColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-teal-50 text-teal-600",
  "bg-orange-50 text-orange-600",
  "bg-cyan-50 text-cyan-600",
];

function getPaymentIcon(method: string) {
  const m = method?.toLowerCase() || "";
  if (m === "upi") return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
  if (m === "card") return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
  if (m === "wallet") return <Wallet className="w-3.5 h-3.5 text-orange-500" />;
  if (m === "netbanking" || m === "net_banking") return <Landmark className="w-3.5 h-3.5 text-blue-500" />;
  return <Banknote className="w-3.5 h-3.5 text-emerald-500" />;
}

function getInitials(name: string): string {
  if (!name) return "--";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(d: string) {
  if (!d) return "--";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return d; }
}

function formatTime(d: string) {
  if (!d) return "";
  try { return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

type StatusKey = "confirmed" | "pending" | "cancelled" | "refunded";
const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

export function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useBookings({
    page: currentPage,
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    date_from: filterDate || undefined,
    date_to: filterDate || undefined,
  });

  const stats = data?.stats ?? { total: 0, confirmed: 0, pending: 0, cancelled: 0, refunded: 0 };

  const bookings: any[] = data?.data ?? [];
  const pagination = data?.meta ?? data ?? {};
  const total = pagination.total ?? 0;
  const lastPage = pagination.last_page ?? 1;
  const from = pagination.from ?? 0;
  const to = pagination.to ?? 0;

  const statCards = [
    { title: "Total Bookings", amount: stats.total.toLocaleString(), subtitle: "All time", icon: CalendarCheck, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { title: "Confirmed", amount: stats.confirmed.toLocaleString(), subtitle: `${stats.total > 0 ? Math.round(stats.confirmed / stats.total * 100) : 0}% of total`, icon: CheckCircle2, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    { title: "Pending", amount: stats.pending.toLocaleString(), subtitle: `${stats.total > 0 ? Math.round(stats.pending / stats.total * 100) : 0}% of total`, icon: Clock, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    { title: "Cancelled", amount: stats.cancelled.toLocaleString(), subtitle: `${stats.total > 0 ? Math.round(stats.cancelled / stats.total * 100) : 0}% of total`, icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
    { title: "Refunded", amount: stats.refunded.toLocaleString(), subtitle: `${stats.total > 0 ? Math.round(stats.refunded / stats.total * 100) : 0}% of total`, icon: RotateCcw, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  ];

  const getPaginationRange = () => {
    const pages: (number | string)[] = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < lastPage - 2) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  };

  // PDF Export
  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const res = await api.get("/admin/bookings", {
        params: { per_page: 5000, search: debouncedSearch || undefined, status: statusFilter !== "all" ? statusFilter : undefined },
      });
      const all: any[] = res.data?.data ?? [];
      if (!all.length) { setExporting(false); return; }

      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const cols = ["Booking ID", "Customer", "Phone", "Route", "Journey", "Seats", "Amount", "Status", "Booked On"];
      const colW = [28, 28, 26, 34, 26, 18, 22, 22, 28];
      const rowH = 6;
      let y = 10;

      const drawHeader = () => {
        pdf.setFillColor(37, 99, 235);
        pdf.rect(0, y, pageW, rowH + 2, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        let hx = 4;
        cols.forEach((c, i) => {
          pdf.text(c, hx + 1, y + 5);
          hx += colW[i];
        });
        y += rowH + 3;
      };

      drawHeader();

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(30, 41, 59);

      all.forEach((b, idx) => {
        if (y > pageH - 15) {
          pdf.addPage();
          y = 10;
          drawHeader();
        }
        const s = b.schedule || {};
        const route = `${s.from || ""}→${s.to || ""}`;
        const jDate = s.journey_date || s.date || "--";
        const seats = Array.isArray(b.seat_numbers) ? b.seat_numbers.join(",") : b.seat_numbers || "--";
        const amt = "₹" + Number(b.total_amount || 0).toLocaleString("en-IN");
        const status = (b.booking_status || "pending").charAt(0).toUpperCase() + (b.booking_status || "pending").slice(1);
        const booked = b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN") : "--";

        if (idx % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(0, y - 1, pageW, rowH + 1, "F");
        }

        const vals = [b.booking_number, b.customer_name || "", b.customer_phone || "", route, jDate, seats, amt, status, booked];
        let vx = 4;
        vals.forEach((v, i) => {
          const display = typeof v === "string" ? v : String(v ?? "");
          pdf.text(display.length > 18 ? display.slice(0, 16) + ".." : display, vx + 1, y + 4);
          vx += colW[i];
        });
        y += rowH + 1;
      });

      pdf.save(`bookings-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }, [debouncedSearch, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-1.5" /> {exporting ? "Exporting..." : "Export PDF"}
          </Button>
          <Button size="sm" className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { window.open("/", "_blank"); }}>
            <Plus className="w-4 h-4 mr-1.5" /> New Booking
          </Button>
        </div>
      </div>

      {/* Stat Cards — ALL bookings data from server */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {isLoading ? "..." : card.amount}
                  </p>
                  <span className="text-xs font-medium text-gray-400">{card.subtitle}</span>
                </div>
                <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0", card.iconBg)}>
                  <IconComponent className={cn("w-5 h-5", card.iconColor)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Name, Phone, Email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
          className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          title="Filter by booking date"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Booking ID</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">User</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Route</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Journey Date</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Seats</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Amount</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Payment</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">Booked On</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-gray-50">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <TableCell key={j} className="py-3 px-4"><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-400">Failed to load bookings</TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-400">No bookings found</TableCell>
                </TableRow>
              ) : (
                bookings.map((booking: any, index: number) => {
                  const sched = booking.schedule || {};
                  const route = sched.route || {};
                  const bus = sched.bus || {};
                  const seats = Array.isArray(booking.seat_numbers) ? booking.seat_numbers.join(", ") : booking.seat_numbers || "--";
                  const statusKey = (booking.booking_status || "pending") as StatusKey;

                  return (
                    <TableRow key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer">
                      <TableCell className="py-3 px-4">
                        <span className="text-sm font-medium text-blue-600">{booking.booking_number}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn("text-xs font-semibold", avatarColors[index % avatarColors.length])}>
                              {getInitials(booking.customer_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-blue-700">{booking.customer_name}</p>
                            <p className="text-xs text-cyan-600 font-mono">{booking.customer_phone}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-purple-400" />
                            <span className="text-sm font-semibold text-purple-700">{sched.from || route.from_city || "--"} <span className="text-purple-400">→</span> {sched.to || route.to_city || "--"}</span>
                          </div>
                          <p className="text-xs text-gray-400 ml-4">{bus.bus_type || sched.type || "--"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-amber-700">{sched.journey_date ? formatDate(sched.journey_date) : sched.date || "--"}</p>
                          <p className="text-xs text-gray-400">{sched.dep || "--"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="text-sm font-semibold text-rose-600 font-mono">{seats}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <span className="text-sm font-bold text-emerald-600">₹{Number(booking.total_amount || 0).toLocaleString("en-IN")}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {getPaymentIcon(booking.payment?.gateway || (booking.payment_status === "paid" ? "upi" : ""))}
                          <span className="text-sm font-medium text-slate-600">{booking.payment?.gateway || (booking.payment_status === "paid" ? "UPI" : "—")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full border", statusStyles[statusKey] || "bg-gray-50 text-gray-600 border-gray-200")}>
                          {statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-indigo-600">{formatDate(booking.created_at)}</p>
                          <p className="text-xs text-gray-400">{formatTime(booking.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 gap-3">
          <p className="text-sm text-gray-500">
            {isLoading ? "Loading..." : `Showing ${from} to ${to} of ${total} bookings`}
          </p>
          {lastPage > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {getPaginationRange().map((page, idx) =>
                typeof page === "string" ? (
                  <span key={`ellipsis-${idx}`} className="h-8 w-8 flex items-center justify-center text-sm text-gray-400">...</span>
                ) : (
                  <Button key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={cn("h-8 w-8 text-sm", currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                    onClick={() => setCurrentPage(page)}>
                    {page}
                  </Button>
                )
              )}
              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200"
                onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
                disabled={currentPage === lastPage}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
