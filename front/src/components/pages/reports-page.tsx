"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  RotateCcw,
  BarChart3,
  CalendarCheck,
  Route,
  Users,
  Bus,
  XCircle,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const statCards = [
  {
    title: "Revenue This Month",
    amount: "₹12,45,600",
    subtitle: "+12.5% from last month",
    icon: IndianRupee,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    trend: "up",
  },
  {
    title: "Growth",
    amount: "12.5%",
    subtitle: "Month over month",
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trend: "up",
  },
  {
    title: "Avg Booking Value",
    amount: "₹1,150",
    subtitle: "Per transaction average",
    icon: CreditCard,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trend: "up",
  },
  {
    title: "Refund Rate",
    amount: "4.2%",
    subtitle: "Below 5% target",
    icon: RotateCcw,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    trend: "down",
  },
];

const reportCards = [
  {
    title: "Revenue Report",
    description: "Detailed revenue breakdown by routes, buses, and time periods",
    icon: IndianRupee,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
  {
    title: "Booking Report",
    description: "Booking trends, conversion rates, and booking source analysis",
    icon: CalendarCheck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    title: "Route Performance",
    description: "Route-wise occupancy, revenue, and popularity analysis",
    icon: Route,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
  {
    title: "Customer Analysis",
    description: "User demographics, retention, and lifetime value metrics",
    icon: Users,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100",
  },
  {
    title: "Bus Utilization",
    description: "Fleet utilization rates, idle time, and maintenance schedules",
    icon: Bus,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    borderColor: "border-teal-100",
  },
  {
    title: "Cancellation Report",
    description: "Cancellation patterns, reasons, and refund processing stats",
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-100",
  },
];

interface ReportRecord {
  id: string;
  name: string;
  type: string;
  generatedDate: string;
  status: "Ready" | "Processing" | "Failed";
}

const recentReports: ReportRecord[] = [
  {
    id: "1",
    name: "Monthly Revenue Report - May 2024",
    type: "Revenue",
    generatedDate: "24 May 2024, 10:30 AM",
    status: "Ready",
  },
  {
    id: "2",
    name: "Weekly Booking Summary - Week 21",
    type: "Booking",
    generatedDate: "23 May 2024, 04:00 PM",
    status: "Ready",
  },
  {
    id: "3",
    name: "Route Performance - Q1 2024",
    type: "Route",
    generatedDate: "22 May 2024, 02:15 PM",
    status: "Ready",
  },
  {
    id: "4",
    name: "Customer Retention Analysis",
    type: "Customer",
    generatedDate: "24 May 2024, 09:00 AM",
    status: "Processing",
  },
  {
    id: "5",
    name: "Bus Utilization - April 2024",
    type: "Fleet",
    generatedDate: "21 May 2024, 11:45 AM",
    status: "Failed",
  },
];

const reportStatusStyles: Record<string, string> = {
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  Processing:
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  Failed: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
};

const typeColors: Record<string, string> = {
  Revenue: "bg-purple-50 text-purple-700",
  Booking: "bg-blue-50 text-blue-700",
  Route: "bg-emerald-50 text-emerald-700",
  Customer: "bg-amber-50 text-amber-700",
  Fleet: "bg-teal-50 text-teal-700",
};

export function ReportsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="space-y-6">
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

      {/* Quick Report Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {reportCards.map((report) => {
            const IconComponent = report.icon;
            return (
              <div
                key={report.title}
                className={cn(
                  "bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-5 group cursor-pointer",
                  report.borderColor
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      report.iconBg
                    )}
                  >
                    <IconComponent
                      className={cn("w-6 h-6", report.iconColor)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {report.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
                  >
                    View Report
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Reports
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Report Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Generated Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {report.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-block text-xs font-medium px-2 py-0.5 rounded-full",
                        typeColors[report.type] || "bg-gray-50 text-gray-600"
                      )}
                    >
                      {report.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {report.generatedDate}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                        reportStatusStyles[report.status]
                      )}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center justify-end gap-1">
                      {report.status === "Ready" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      >
                        <Download className="w-4 h-4" />
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
            <span className="font-medium text-gray-700">5</span> of{" "}
            <span className="font-medium text-gray-700">24</span> reports
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
            {[1, 2, 3].map((page) => (
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
