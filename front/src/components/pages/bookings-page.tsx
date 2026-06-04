"use client";

import React, { useState } from "react";
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
  SlidersHorizontal,
  Plus,
  MapPin,
  Calendar,
  ChevronDown,
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

// ─── STAT CARDS DATA ───────────────────────────────────────────────────────

const statCards = [
  {
    title: "Total Bookings",
    amount: "1,245",
    subtitle: "↑ 12.5% this week",
    trend: "up",
    icon: CalendarCheck,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Confirmed",
    amount: "842",
    subtitle: "↑ 10.2% this week",
    trend: "up",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Pending",
    amount: "198",
    subtitle: "↑ 8.7% this week",
    trend: "up",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    trendColor: "text-emerald-600",
  },
  {
    title: "Cancelled",
    amount: "135",
    subtitle: "↓ 3.4% this week",
    trend: "down",
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    trendColor: "text-red-600",
  },
  {
    title: "Refunded",
    amount: "70",
    subtitle: "↓ 2.1% this week",
    trend: "down",
    icon: RotateCcw,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trendColor: "text-red-600",
  },
];

// ─── BOOKINGS DATA ─────────────────────────────────────────────────────────

type PaymentMethod = "UPI" | "Card" | "Wallet" | "Net Banking" | "Cash";
type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Refunded";

interface BookingRecord {
  id: string;
  userName: string;
  userPhone: string;
  routeFrom: string;
  routeTo: string;
  busType: string;
  journeyDate: string;
  journeyTime: string;
  seats: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  bookedOn: string;
  bookedTime: string;
}

const bookingsData: BookingRecord[] = [
  {
    id: "BB2024052401",
    userName: "Rohit Sharma",
    userPhone: "+91 9876543210",
    routeFrom: "Delhi",
    routeTo: "Jaipur",
    busType: "Volvo AC Seater",
    journeyDate: "24 May 2024",
    journeyTime: "08:30 AM",
    seats: "2A, 2B",
    amount: "₹1,200",
    paymentMethod: "UPI",
    status: "Confirmed",
    bookedOn: "20 May 2024",
    bookedTime: "10:30 AM",
  },
  {
    id: "BB2024052402",
    userName: "Neha Verma",
    userPhone: "+91 9123456780",
    routeFrom: "Mumbai",
    routeTo: "Pune",
    busType: "Volvo AC Seater",
    journeyDate: "24 May 2024",
    journeyTime: "11:00 AM",
    seats: "5C",
    amount: "₹650",
    paymentMethod: "Card",
    status: "Pending",
    bookedOn: "20 May 2024",
    bookedTime: "11:45 AM",
  },
  {
    id: "BB2024052403",
    userName: "Amit Kumar",
    userPhone: "+91 9988776655",
    routeFrom: "Bangalore",
    routeTo: "Chennai",
    busType: "AC Sleeper",
    journeyDate: "25 May 2024",
    journeyTime: "09:00 PM",
    seats: "7A, 7B",
    amount: "₹1,500",
    paymentMethod: "UPI",
    status: "Confirmed",
    bookedOn: "21 May 2024",
    bookedTime: "09:15 AM",
  },
  {
    id: "BB2024052404",
    userName: "Pooja Singh",
    userPhone: "+91 8877665544",
    routeFrom: "Hyderabad",
    routeTo: "Vijayawada",
    busType: "Non AC Seater",
    journeyDate: "25 May 2024",
    journeyTime: "07:30 AM",
    seats: "3L",
    amount: "₹800",
    paymentMethod: "Wallet",
    status: "Cancelled",
    bookedOn: "21 May 2024",
    bookedTime: "10:20 AM",
  },
  {
    id: "BB2024052405",
    userName: "Sandeep Yadav",
    userPhone: "+91 7766554433",
    routeFrom: "Ahmedabad",
    routeTo: "Surat",
    busType: "AC Seater",
    journeyDate: "26 May 2024",
    journeyTime: "02:00 PM",
    seats: "1A",
    amount: "₹350",
    paymentMethod: "UPI",
    status: "Confirmed",
    bookedOn: "22 May 2024",
    bookedTime: "08:40 AM",
  },
  {
    id: "BB2024052406",
    userName: "Kavita Joshi",
    userPhone: "+91 6655443322",
    routeFrom: "Indore",
    routeTo: "Bhopal",
    busType: "AC Seater",
    journeyDate: "26 May 2024",
    journeyTime: "06:15 PM",
    seats: "4C, 4D",
    amount: "₹700",
    paymentMethod: "Card",
    status: "Pending",
    bookedOn: "22 May 2024",
    bookedTime: "09:10 AM",
  },
  {
    id: "BB2024052407",
    userName: "Vikram Reddy",
    userPhone: "+91 5544332211",
    routeFrom: "Chennai",
    routeTo: "Coimbatore",
    busType: "AC Sleeper",
    journeyDate: "27 May 2024",
    journeyTime: "10:45 PM",
    seats: "6U",
    amount: "₹1,100",
    paymentMethod: "Net Banking",
    status: "Refunded",
    bookedOn: "22 May 2024",
    bookedTime: "11:05 AM",
  },
  {
    id: "BB2024052408",
    userName: "Anjali Mehta",
    userPhone: "+91 4433221100",
    routeFrom: "Delhi",
    routeTo: "Agra",
    busType: "Non AC Seater",
    journeyDate: "27 May 2024",
    journeyTime: "12:30 PM",
    seats: "10C",
    amount: "₹400",
    paymentMethod: "Cash",
    status: "Confirmed",
    bookedOn: "23 May 2024",
    bookedTime: "01:20 PM",
  },
];

const statusStyles: Record<BookingStatus, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-purple-50 text-purple-700 border-purple-200",
};

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

function getPaymentIcon(method: PaymentMethod) {
  switch (method) {
    case "UPI":
      return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
    case "Card":
      return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
    case "Wallet":
      return <Wallet className="w-3.5 h-3.5 text-orange-500" />;
    case "Net Banking":
      return <Landmark className="w-3.5 h-3.5 text-blue-500" />;
    case "Cash":
      return <Banknote className="w-3.5 h-3.5 text-emerald-500" />;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── MAIN BOOKINGS PAGE ────────────────────────────────────────────────────

export function BookingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 156;

  const getPaginationRange = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 mr-1.5" />
            Filters
          </Button>
          <Button
            size="sm"
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stat Cards - 5 in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
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
                  <span className={cn("text-xs font-medium", card.trendColor)}>
                    {card.subtitle}
                  </span>
                </div>
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0",
                    card.iconBg
                  )}
                >
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
            placeholder="Search by Booking ID, User, Route..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        <Select>
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

        <Select>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            <SelectItem value="delhi-jaipur">Delhi → Jaipur</SelectItem>
            <SelectItem value="mumbai-pune">Mumbai → Pune</SelectItem>
            <SelectItem value="bangalore-chennai">Bangalore → Chennai</SelectItem>
            <SelectItem value="hyderabad-vijayawada">Hyderabad → Vijayawada</SelectItem>
          </SelectContent>
        </Select>

        <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>May 18 - May 24, 2024</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Booking ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  User
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Route
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Journey Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Seats
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Amount
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Payment Method
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Booked On
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsData.map((booking, index) => (
                <TableRow
                  key={booking.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <TableCell className="py-3 px-4">
                    <span className="text-sm font-medium text-blue-600">
                      {booking.id}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            avatarColors[index % avatarColors.length]
                          )}
                        >
                          {getInitials(booking.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.userName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.userPhone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800">
                          {booking.routeFrom} → {booking.routeTo}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 ml-4">
                        {booking.busType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-700">{booking.journeyDate}</p>
                      <p className="text-xs text-gray-400">{booking.journeyTime}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-sm text-gray-700 font-mono">
                      {booking.seats}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {booking.amount}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {getPaymentIcon(booking.paymentMethod)}
                      <span className="text-sm text-gray-600">
                        {booking.paymentMethod}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
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
                  <TableCell className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-500">{booking.bookedOn}</p>
                      <p className="text-xs text-gray-400">{booking.bookedTime}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 gap-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">1</span> to{" "}
            <span className="font-medium text-gray-700">8</span> of{" "}
            <span className="font-medium text-gray-700">1,245</span> bookings
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-200"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {getPaginationRange().map((page, idx) =>
              typeof page === "string" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="h-8 w-8 flex items-center justify-center text-sm text-gray-400"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-sm",
                    currentPage === page
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-gray-200"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
