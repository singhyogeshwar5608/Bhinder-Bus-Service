"use client";

import React, { useState } from "react";
import {
  Tag,
  CheckCircle2,
  CalendarClock,
  PieChart,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  SlidersHorizontal,
  Search,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

/* ───── Stat Cards ───── */
const statCards = [
  {
    title: "Total Coupons",
    amount: "56",
    subtitle: "All coupons created",
    icon: Tag,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Active Coupons",
    amount: "38",
    subtitle: "Coupons are active",
    icon: CheckCircle2,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Expired Coupons",
    amount: "12",
    subtitle: "Coupons expired",
    icon: CalendarClock,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    title: "Total Usage",
    amount: "1,245",
    subtitle: "Across all coupons",
    icon: PieChart,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

/* ───── Table Data ───── */
interface CouponRecord {
  id: number;
  code: string;
  name: string;
  type: "Percentage" | "Flat";
  discount: string;
  minBooking: string;
  maxDiscount: string;
  validTill: string;
  status: "Active" | "Expired";
  usage: number;
}

const couponsData: CouponRecord[] = [
  {
    id: 1,
    code: "GET10",
    name: "Flat 10% Off",
    type: "Percentage",
    discount: "10% OFF",
    minBooking: "₹500",
    maxDiscount: "₹200",
    validTill: "31 May 2024",
    status: "Active",
    usage: 245,
  },
  {
    id: 2,
    code: "SAVE150",
    name: "Save ₹150 on Min ₹800",
    type: "Flat",
    discount: "₹150 OFF",
    minBooking: "₹800",
    maxDiscount: "₹150",
    validTill: "25 May 2024",
    status: "Active",
    usage: 187,
  },
  {
    id: 3,
    code: "BUS20",
    name: "20% Off on Bus Booking",
    type: "Percentage",
    discount: "20% OFF",
    minBooking: "₹1,000",
    maxDiscount: "₹400",
    validTill: "31 May 2024",
    status: "Active",
    usage: 312,
  },
  {
    id: 4,
    code: "SUMMER25",
    name: "Summer Special 25% Off",
    type: "Percentage",
    discount: "25% OFF",
    minBooking: "₹1,200",
    maxDiscount: "₹500",
    validTill: "15 Jun 2024",
    status: "Active",
    usage: 156,
  },
  {
    id: 5,
    code: "WEEKEND100",
    name: "Weekend Flat ₹100 Off",
    type: "Flat",
    discount: "₹100 OFF",
    minBooking: "₹600",
    maxDiscount: "₹100",
    validTill: "26 May 2024",
    status: "Active",
    usage: 89,
  },
  {
    id: 6,
    code: "FETRIP50",
    name: "Flat ₹50 Off on First Trip",
    type: "Flat",
    discount: "₹50 OFF",
    minBooking: "₹400",
    maxDiscount: "₹50",
    validTill: "20 May 2024",
    status: "Expired",
    usage: 64,
  },
  {
    id: 7,
    code: "TRAVEL200",
    name: "Save ₹200 on Min ₹1200",
    type: "Flat",
    discount: "₹200 OFF",
    minBooking: "₹1,200",
    maxDiscount: "₹200",
    validTill: "10 May 2024",
    status: "Expired",
    usage: 53,
  },
  {
    id: 8,
    code: "WELCOME15",
    name: "Welcome 15% Off",
    type: "Percentage",
    discount: "15% OFF",
    minBooking: "₹700",
    maxDiscount: "₹300",
    validTill: "05 May 2024",
    status: "Expired",
    usage: 72,
  },
  {
    id: 9,
    code: "MEGA300",
    name: "Mega Offer ₹300 Off",
    type: "Flat",
    discount: "₹300 OFF",
    minBooking: "₹1,500",
    maxDiscount: "₹300",
    validTill: "01 May 2024",
    status: "Expired",
    usage: 41,
  },
  {
    id: 10,
    code: "LOYAL10",
    name: "Loyal Customer 10% Off",
    type: "Percentage",
    discount: "10% OFF",
    minBooking: "₹500",
    maxDiscount: "₹150",
    validTill: "30 Apr 2024",
    status: "Expired",
    usage: 26,
  },
];

/* ───── Type Badge Colors ───── */
const typeStyles: Record<string, string> = {
  Percentage: "bg-purple-50 text-purple-700 border-purple-200",
  Flat: "bg-sky-50 text-sky-700 border-sky-200",
};

/* ───── Status Badge Colors ───── */
const statusStyles: Record<string, string> = {
  Active: "bg-emerald-600 text-white border-emerald-600",
  Expired: "bg-red-500 text-white border-red-500",
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export function CouponsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
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
                  <p className="text-xs text-gray-400">{card.subtitle}</p>
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

      {/* ── Header & Action Buttons ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Coupon Management
        </h2>
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
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Coupon
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Coupon Code or Name..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        {/* Coupon Type */}
        <Select>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Coupon Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coupon Types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="flat">Flat</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        {/* Channels */}
        <Select>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="app">Mobile App</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <div className="relative">
          <input
            type="date"
            className="w-full sm:w-[170px] h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            defaultValue="2024-05-24"
          />
        </div>

        {/* Reset */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
      </div>

      {/* ── Coupons Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 w-10 text-center">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Coupon Code
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Coupon Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Discount
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Min. Booking
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Max. Discount
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Valid Till
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-center">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">
                  Usage
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponsData.map((coupon, index) => (
                <TableRow
                  key={coupon.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  {/* # */}
                  <TableCell className="py-3.5 px-4 text-center">
                    <span className="text-sm text-gray-400 font-medium">
                      {index + 1}
                    </span>
                  </TableCell>

                  {/* Coupon Code */}
                  <TableCell className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-sm font-mono font-bold text-gray-800 tracking-wider">
                      {coupon.code}
                    </span>
                  </TableCell>

                  {/* Coupon Name */}
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm font-medium text-gray-800">
                      {coupon.name}
                    </span>
                  </TableCell>

                  {/* Type */}
                  <TableCell className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                        typeStyles[coupon.type]
                      )}
                    >
                      {coupon.type}
                    </Badge>
                  </TableCell>

                  {/* Discount */}
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {coupon.discount}
                    </span>
                  </TableCell>

                  {/* Min. Booking */}
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600">
                      {coupon.minBooking}
                    </span>
                  </TableCell>

                  {/* Max. Discount */}
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600">
                      {coupon.maxDiscount}
                    </span>
                  </TableCell>

                  {/* Valid Till */}
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-500">
                      {coupon.validTill}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3.5 px-4 text-center">
                    <Badge
                      className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-md border-0",
                        statusStyles[coupon.status]
                      )}
                    >
                      {coupon.status}
                    </Badge>
                  </TableCell>

                  {/* Usage */}
                  <TableCell className="py-3.5 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-800">
                      {coupon.usage.toLocaleString()}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1">
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
                        className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 gap-3">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-700">1</span> to{" "}
            <span className="font-medium text-gray-700">10</span> of{" "}
            <span className="font-medium text-gray-700">56</span> coupons
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
            {[1, 2, 3, 4, 5, 6].map((page) => (
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
            ))}
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
