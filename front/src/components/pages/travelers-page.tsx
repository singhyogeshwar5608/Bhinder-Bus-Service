"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Ticket,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useTravelers } from "@/hooks/use-booking";
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

// Stat cards data matching reference image
const statCards = [
  {
    title: "Total Travelers",
    amount: "1,245",
    subtitle: "All travelers in system",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Active Travelers",
    amount: "1,089",
    subtitle: "87.4% of total travelers",
    icon: UserCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Inactive Travelers",
    amount: "100",
    subtitle: "8.1% of total travelers",
    icon: UserX,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Total Bookings",
    amount: "2,156",
    subtitle: "By all travelers",
    icon: Ticket,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

// Traveler data matching reference image exactly
interface TravelerRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
  city: string;
  status: "Active" | "Inactive";
}

const travelersData: TravelerRecord[] = [
  {
    id: 1,
    name: "Rohit Sharma",
    email: "rohit.sharma@email.com",
    phone: "+91 98765 43210",
    totalBookings: 12,
    lastBooking: "24 May 2024",
    city: "Delhi",
    status: "Active",
  },
  {
    id: 2,
    name: "Neha Verma",
    email: "neha.verma@email.com",
    phone: "+91 91234 56780",
    totalBookings: 8,
    lastBooking: "22 May 2024",
    city: "Mumbai",
    status: "Active",
  },
  {
    id: 3,
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 99887 76655",
    totalBookings: 15,
    lastBooking: "24 May 2024",
    city: "Bangalore",
    status: "Active",
  },
  {
    id: 4,
    name: "Pooja Singh",
    email: "pooja.singh@email.com",
    phone: "+91 88776 65544",
    totalBookings: 6,
    lastBooking: "21 May 2024",
    city: "Hyderabad",
    status: "Active",
  },
  {
    id: 5,
    name: "Sandeep Yadav",
    email: "sandeep.yadav@email.com",
    phone: "+91 77665 54433",
    totalBookings: 9,
    lastBooking: "23 May 2024",
    city: "Ahmedabad",
    status: "Active",
  },
  {
    id: 6,
    name: "Kavita Joshi",
    email: "kavita.joshi@email.com",
    phone: "+91 66554 43322",
    totalBookings: 4,
    lastBooking: "20 May 2024",
    city: "Indore",
    status: "Inactive",
  },
  {
    id: 7,
    name: "Vikram Reddy",
    email: "vikram.reddy@email.com",
    phone: "+91 55443 32211",
    totalBookings: 7,
    lastBooking: "22 May 2024",
    city: "Chennai",
    status: "Active",
  },
  {
    id: 8,
    name: "Anjali Mehta",
    email: "anjali.mehta@email.com",
    phone: "+91 44332 21100",
    totalBookings: 3,
    lastBooking: "18 May 2024",
    city: "Agra",
    status: "Inactive",
  },
  {
    id: 9,
    name: "Rahul Patel",
    email: "rahul.patel@email.com",
    phone: "+91 33221 10099",
    totalBookings: 11,
    lastBooking: "24 May 2024",
    city: "Surat",
    status: "Active",
  },
  {
    id: 10,
    name: "Patel Travels",
    email: "patel.travels@email.com",
    phone: "+91 22110 09988",
    totalBookings: 5,
    lastBooking: "19 May 2024",
    city: "Vadodara",
    status: "Active",
  },
];

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
  const [search, setSearch] = useState("");
  const { data: travelersResponse, isLoading, isError } = useTravelers(page);
  const travelers = travelersResponse?.data || [];
  const meta = travelersResponse?.meta;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => (
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
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 border-gray-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-10 border-gray-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={() => {setSearch(""); setPage(1);}} className="h-10 border-gray-200">
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
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-center">Age</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-center">Gender</TableHead>
                    <TableHead className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                        No travelers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    travelers.map((traveler: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-xs">
                                {traveler.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-gray-900">{traveler.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center text-sm text-gray-600">
                          {traveler.age}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Badge variant="outline" className="capitalize">
                            {traveler.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-blue-600">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
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
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
