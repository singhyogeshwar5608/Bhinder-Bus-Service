"use client";

import React from "react";
import {
  CalendarCheck,
  IndianRupee,
  Bus,
  Users,
  ArrowUpRight,
  Eye,
  MapPin,
  Calendar,
  ChevronDown,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── STAT CARDS DATA ───────────────────────────────────────────────────────

const statCards = [
  {
    title: "Total Bookings",
    amount: "1,245",
    subtitle: "↑ 12.5% this week",
    icon: CalendarCheck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Total Revenue",
    amount: "₹3,45,000",
    subtitle: "↑ 18.3% this week",
    icon: IndianRupee,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Active Buses",
    amount: "120",
    subtitle: "↑ 8.7% this week",
    icon: Bus,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Total Users",
    amount: "980",
    subtitle: "↑ 15.2% this week",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trendColor: "text-emerald-600",
  },
];

// ─── CHART MOCK DATA ───────────────────────────────────────────────────────

const bookingTrendData = [
  { day: "May 18", value: 320 },
  { day: "May 19", value: 410 },
  { day: "May 20", value: 350 },
  { day: "May 21", value: 480 },
  { day: "May 22", value: 390 },
  { day: "May 23", value: 450 },
  { day: "May 24", value: 420 },
];

const revenueData = [
  { day: "May 18", value: 65 },
  { day: "May 19", value: 85 },
  { day: "May 20", value: 72 },
  { day: "May 21", value: 95 },
  { day: "May 22", value: 78 },
  { day: "May 23", value: 88 },
  { day: "May 24", value: 92 },
];

const bookingStatusData = [
  { label: "Confirmed", count: 842, percentage: 67.6, color: "#10b981" },
  { label: "Pending", count: 198, percentage: 15.9, color: "#3b82f6" },
  { label: "Cancelled", count: 135, percentage: 10.8, color: "#f59e0b" },
  { label: "Refunded", count: 70, percentage: 5.6, color: "#ef4444" },
];

// ─── RECENT BOOKINGS DATA ──────────────────────────────────────────────────

const recentBookings = [
  {
    id: "BB2024052401",
    user: "Rohit Sharma",
    route: "Delhi → Jaipur",
    journeyDate: "24 May 2024",
    seats: "2A, 2B",
    amount: "₹1,200",
    status: "Confirmed",
  },
  {
    id: "BB2024052402",
    user: "Neha Verma",
    route: "Mumbai → Pune",
    journeyDate: "24 May 2024",
    seats: "5C",
    amount: "₹650",
    status: "Pending",
  },
  {
    id: "BB2024052403",
    user: "Amit Kumar",
    route: "Bangalore → Chennai",
    journeyDate: "25 May 2024",
    seats: "7A, 7B",
    amount: "₹1,500",
    status: "Confirmed",
  },
  {
    id: "BB2024052404",
    user: "Pooja Singh",
    route: "Hyderabad → Vijayawada",
    journeyDate: "25 May 2024",
    seats: "3L",
    amount: "₹800",
    status: "Cancelled",
  },
  {
    id: "BB2024052405",
    user: "Sandeep Yadav",
    route: "Ahmedabad → Surat",
    journeyDate: "26 May 2024",
    seats: "1A",
    amount: "₹350",
    status: "Confirmed",
  },
];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-orange-50 text-orange-700 border-orange-200",
};

// ─── TOP ROUTES DATA ───────────────────────────────────────────────────────

const topRoutes = [
  { from: "Delhi", to: "Jaipur", bookings: 320, color: "bg-emerald-500" },
  { from: "Mumbai", to: "Pune", bookings: 285, color: "bg-blue-500" },
  { from: "Bangalore", to: "Chennai", bookings: 210, color: "bg-purple-500" },
  { from: "Hyderabad", to: "Vijayawada", bookings: 165, color: "bg-orange-500" },
  { from: "Ahmedabad", to: "Surat", bookings: 145, color: "bg-teal-500" },
];

// ─── MINI CHART COMPONENT (SVG) ────────────────────────────────────────────

function MiniLineChart({ data, color = "#3b82f6" }: { data: { day: string; value: number }[]; color?: string }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const minVal = Math.min(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;
  const w = 280;
  const h = 120;
  const padX = 10;
  const padY = 10;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (w - padX * 2),
    y: padY + (1 - (d.value - minVal) / range) * (h - padY * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={padX}
          y1={padY + frac * (h - padY * 2)}
          x2={w - padX}
          y2={padY + frac * (h - padY * 2)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
      {/* Area fill */}
      <path d={areaPath} fill={color} fillOpacity="0.08" />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
      ))}
      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={padX + (i / (data.length - 1)) * (w - padX * 2)}
          y={h - 1}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          {d.day.replace("May ", "")}
        </text>
      ))}
    </svg>
  );
}

function MiniBarChart({ data, color = "#8b5cf6" }: { data: { day: string; value: number }[]; color?: string }) {
  const maxVal = Math.max(...data.map((d) => d.value));
  const w = 280;
  const h = 120;
  const padX = 10;
  const padY = 10;
  const barW = (w - padX * 2) / data.length * 0.5;
  const gap = (w - padX * 2) / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
        <line
          key={frac}
          x1={padX}
          y1={padY + frac * (h - padY * 2)}
          x2={w - padX}
          y2={padY + frac * (h - padY * 2)}
          stroke="#f1f5f9"
          strokeWidth="1"
        />
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = ((d.value / maxVal) * (h - padY * 2));
        const x = padX + i * gap + (gap - barW) / 2;
        const y = h - padY - barH;
        return (
          <rect key={i} x={x} y={y} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
        );
      })}
      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={padX + i * gap + gap / 2}
          y={h - 1}
          textAnchor="middle"
          className="text-[8px] fill-gray-400"
        >
          {d.day.replace("May ", "")}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: { label: string; count: number; percentage: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const cx = 70;
  const cy = 70;
  const r = 50;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * r;

  let accumulated = 0;
  const segments = data.map((d) => {
    const startAngle = (accumulated / total) * 360;
    accumulated += d.count;
    const endAngle = (accumulated / total) * 360;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const arcLength = (d.count / total) * circumference;

    return {
      ...d,
      arcLength,
      dashOffset: circumference - arcLength,
      rotation: startAngle,
    };
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="w-32 h-32 flex-shrink-0">
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {/* Segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={seg.dashOffset}
            transform={`rotate(${seg.rotation} ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-[14px] font-bold fill-gray-900">
          {total.toLocaleString()}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" className="text-[9px] fill-gray-400">
          Total
        </text>
      </svg>
      <div className="space-y-2 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-gray-600">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{d.count}</span>
              <span className="text-gray-400 text-xs">({d.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD PAGE ───────────────────────────────────────────────────

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div />
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>May 18 - May 24, 2024</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {card.amount}
                  </p>
                  <div className="flex items-center gap-1">
                    <span className={cn("text-xs font-medium", card.trendColor)}>
                      {card.subtitle}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0",
                    card.iconBg
                  )}
                >
                  <IconComponent
                    className={cn("w-5 h-5", card.iconColor)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - 3 charts in a row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Booking Trends - Line Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <h3 className="text-base font-semibold text-gray-900">Booking Trends</h3>
            </div>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
              This Week
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <MiniLineChart data={bookingTrendData} color="#3b82f6" />
        </div>

        {/* Revenue Analytics - Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <h3 className="text-base font-semibold text-gray-900">Revenue Analytics</h3>
            </div>
            <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 text-xs text-gray-600 hover:bg-gray-50">
              This Week
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <MiniBarChart data={revenueData} color="#8b5cf6" />
        </div>

        {/* Booking Status - Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-500" />
              <h3 className="text-base font-semibold text-gray-900">Booking Status</h3>
            </div>
          </div>
          <DonutChart data={bookingStatusData} />
        </div>
      </div>

      {/* Bottom Section: Recent Bookings + Top Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Bookings</h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Booking ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    User
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Route
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Journey Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Seats
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-5 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="py-3 px-5">
                      <span className="text-sm font-medium text-blue-600">{booking.id}</span>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <span className="text-sm text-gray-800 font-medium">{booking.user}</span>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{booking.route}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <span className="text-sm text-gray-500">{booking.journeyDate}</span>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <span className="text-sm text-gray-700 font-mono">{booking.seats}</span>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <span className="text-sm font-semibold text-gray-900">{booking.amount}</span>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                          statusStyles[booking.status]
                        )}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-5">
                      <div className="flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Top Routes</h3>
          </div>
          <div className="p-4 space-y-3">
            {topRoutes.map((route, index) => {
              const maxBookings = topRoutes[0].bookings;
              const barWidth = (route.bookings / maxBookings) * 100;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {route.from} → {route.to}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {route.bookings} Bookings
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", route.color)}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
