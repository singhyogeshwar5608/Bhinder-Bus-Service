"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Crown,
  Search,
  RotateCcw,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  SlidersHorizontal,
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

const statCards = [
  {
    title: "Total Users",
    amount: "5,420",
    subtitle: "Registered users",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active",
    amount: "4,850",
    subtitle: "89.5% active rate",
    icon: UserCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "New This Month",
    amount: "127",
    subtitle: "+18% from last month",
    icon: UserPlus,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Premium",
    amount: "342",
    subtitle: "6.3% of total users",
    icon: Crown,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

interface UserRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bookings: number;
  joined: string;
  status: "Active" | "Inactive" | "Blocked" | "Premium";
}

const usersData: UserRecord[] = [
  {
    id: "1",
    userId: "USR-5401",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    bookings: 24,
    joined: "12 Jan 2024",
    status: "Premium",
  },
  {
    id: "2",
    userId: "USR-5402",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 87654 32109",
    bookings: 18,
    joined: "25 Feb 2024",
    status: "Active",
  },
  {
    id: "3",
    userId: "USR-5403",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 76543 21098",
    bookings: 12,
    joined: "03 Mar 2024",
    status: "Active",
  },
  {
    id: "4",
    userId: "USR-5404",
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    phone: "+91 65432 10987",
    bookings: 8,
    joined: "18 Apr 2024",
    status: "Inactive",
  },
  {
    id: "5",
    userId: "USR-5405",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 54321 09876",
    bookings: 31,
    joined: "05 Jan 2024",
    status: "Premium",
  },
  {
    id: "6",
    userId: "USR-5406",
    name: "Anjali Gupta",
    email: "anjali.gupta@email.com",
    phone: "+91 43210 98765",
    bookings: 15,
    joined: "22 Feb 2024",
    status: "Active",
  },
  {
    id: "7",
    userId: "USR-5407",
    name: "Karthik Nair",
    email: "karthik.nair@email.com",
    phone: "+91 32109 87654",
    bookings: 5,
    joined: "10 May 2024",
    status: "Blocked",
  },
  {
    id: "8",
    userId: "USR-5408",
    name: "Meera Joshi",
    email: "meera.joshi@email.com",
    phone: "+91 21098 76543",
    bookings: 22,
    joined: "15 Jan 2024",
    status: "Premium",
  },
  {
    id: "9",
    userId: "USR-5409",
    name: "Ravi Verma",
    email: "ravi.verma@email.com",
    phone: "+91 10987 65432",
    bookings: 9,
    joined: "28 Mar 2024",
    status: "Active",
  },
  {
    id: "10",
    userId: "USR-5410",
    name: "Deepa Iyer",
    email: "deepa.iyer@email.com",
    phone: "+91 09876 54321",
    bookings: 3,
    joined: "15 May 2024",
    status: "Inactive",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  Inactive: "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-50",
  Blocked: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  Premium: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
};

const avatarColors = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-rose-50 text-rose-600",
  "bg-teal-50 text-teal-600",
  "bg-indigo-50 text-indigo-600",
  "bg-orange-50 text-orange-600",
  "bg-cyan-50 text-cyan-600",
  "bg-pink-50 text-pink-600",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function UsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

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

      {/* Filter Section */}
      <div className="space-y-4">
        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            User Directory
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
          </div>
        </div>

        {/* Filter Inputs Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
            />
          </div>

          <Select>
            <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-sm text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  User ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Email
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Phone
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Bookings
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Joined
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
              {usersData.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm font-medium text-blue-600">
                      {user.userId}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            avatarColors[index % avatarColors.length]
                          )}
                        >
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-800">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600">
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600">
                      {user.phone}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {user.bookings}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-500">
                      {user.joined}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                        statusStyles[user.status]
                      )}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
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
            <span className="font-medium text-gray-700">10</span> of{" "}
            <span className="font-medium text-gray-700">5,420</span> users
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
            {[1, 2, 3, 4, 5].map((page) => (
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
