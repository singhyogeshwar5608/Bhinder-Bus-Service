"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  Save,
  Calendar,
  Upload,
  Info,
  X,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  CalendarDays,
  FileCheck,
  Activity,
  Droplets,
  HeartPulse,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNavStore } from "@/lib/nav-store";

// ─── DRIVER VIEW DIALOG ───────────────────────────────────────────────────

function DriverViewDialog({ driver, open, onOpenChange }: { driver: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!driver) return null;

  const details = [
    { label: "Driver Name", value: driver.driver_name, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Phone Number", value: driver.driver_phone, icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Email Address", value: driver.driver_email || "N/A", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "License Number", value: driver.license_number, icon: FileCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "License Type", value: driver.license_type?.toUpperCase(), icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Experience", value: `${driver.experience_years} Years`, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Date of Birth", value: driver.dob ? new Date(driver.dob).toLocaleDateString() : "N/A", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Gender", value: driver.gender?.charAt(0).toUpperCase() + driver.gender?.slice(1) || "N/A", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Blood Group", value: driver.blood_group?.toUpperCase() || "N/A", icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
    { label: "Joining Date", value: driver.joining_date ? new Date(driver.joining_date).toLocaleDateString() : "N/A", icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Aadhaar Number", value: driver.aadhar_number || "N/A", icon: FileCheck, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "PAN Number", value: driver.pan_number || "N/A", icon: FileCheck, color: "text-slate-600", bg: "bg-slate-50" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Driver Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-6 max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                {driver.profile_image ? (
                  <img src={driver.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                    {driver.driver_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-2xl font-bold text-gray-900">{driver.driver_name}</h3>
                  <Badge className={cn("rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider", driver.status === 'active' ? "bg-emerald-500" : "bg-red-500")}>
                    {driver.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-500 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {driver.city}, {driver.state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {driver.experience_years} Years Experience
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Information Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Personal & License Info
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {details.map((item, idx) => (
                    <div key={idx} className={cn("flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 transition-colors", item.bg)}>
                      <div className={cn("w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm", item.color)}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents & Emergency */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                    Emergency Contact
                  </h4>
                  <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Contact Person</p>
                        <p className="text-sm font-bold text-gray-900">{driver.emergency_contact_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Emergency Number</p>
                        <p className="text-sm font-bold text-gray-900">{driver.emergency_contact_number}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                    Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {driver.license_copy && (
                      <a href={driver.license_copy} target="_blank" rel="noreferrer" className="group">
                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all text-center">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-indigo-600 mx-auto mb-2 group-hover:shadow-md transition-all">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-700">License Copy</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Click to view</p>
                        </div>
                      </a>
                    )}
                    {driver.aadhar_copy && (
                      <a href={driver.aadhar_copy} target="_blank" rel="noreferrer" className="group">
                        <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-indigo-200 transition-all text-center">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-indigo-600 mx-auto mb-2 group-hover:shadow-md transition-all">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-700">Aadhaar Copy</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Click to view</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1 h-4 bg-slate-600 rounded-full" />
                    Address & Remarks
                  </h4>
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Address</p>
                      <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {driver.address}, {driver.city}, {driver.state} - {driver.pincode}
                      </p>
                    </div>
                    {driver.remarks && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Remarks</p>
                        <p className="text-sm text-gray-600 italic">"{driver.remarks}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── DRIVER LISTING PAGE ───────────────────────────────────────────────────

const statCards = [
  {
    title: "Total Drivers",
    amount: "25",
    subtitle: "All registered drivers",
    icon: Users,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Active Drivers",
    amount: "20",
    subtitle: "80% of total drivers",
    icon: UserCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Inactive Drivers",
    amount: "5",
    subtitle: "20% of total drivers",
    icon: UserX,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    title: "On Trip",
    amount: "14",
    subtitle: "Currently on trips",
    icon: ClipboardList,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

interface DriverRecord {
  id: number;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: "LMV" | "HMV";
  experience: string;
  status: "Active" | "Inactive";
  assignedBus: string;
}

const driversData: DriverRecord[] = [
  { id: 1, name: "Ramesh Kumar", phone: "+91 98765 43210", licenseNumber: "RJ14 2020 1234567", licenseType: "LMV", experience: "8 Years", status: "Active", assignedBus: "RJ14PB1234" },
  { id: 2, name: "Suresh Yadav", phone: "+91 91234 56789", licenseNumber: "RJ14 2019 7654321", licenseType: "HMV", experience: "12 Years", status: "Active", assignedBus: "RJ14PA5678" },
  { id: 3, name: "Mahesh Choudhary", phone: "+91 99887 76655", licenseNumber: "RJ14 2021 1122334", licenseType: "HMV", experience: "6 Years", status: "Active", assignedBus: "RJ14PC9012" },
  { id: 4, name: "Vikram Singh", phone: "+91 88766 55443", licenseNumber: "RJ14 2018 9988776", licenseType: "LMV", experience: "10 Years", status: "Active", assignedBus: "RJ14PB1234" },
  { id: 5, name: "Manoj Meena", phone: "+91 77665 44332", licenseNumber: "RJ14 2022 5566778", licenseType: "LMV", experience: "3 Years", status: "Inactive", assignedBus: "—" },
  { id: 6, name: "Anil Sharma", phone: "+91 88999 66554", licenseNumber: "RJ14 2017 3344556", licenseType: "HMV", experience: "15 Years", status: "Active", assignedBus: "RJ14PA5678" },
  { id: 7, name: "Deepak Rawat", phone: "+91 70145 67890", licenseNumber: "RJ14 2020 4455667", licenseType: "LMV", experience: "7 Years", status: "Active", assignedBus: "RJ14PC9012" },
  { id: 8, name: "Harish Patel", phone: "+91 95497 66521", licenseNumber: "RJ14 2019 7788990", licenseType: "HMV", experience: "9 Years", status: "Active", assignedBus: "RJ14PB5678" },
  { id: 9, name: "Jitendra Solanki", phone: "+91 82334 55661", licenseNumber: "RJ14 2021 8899001", licenseType: "LMV", experience: "5 Years", status: "Inactive", assignedBus: "—" },
  { id: 10, name: "Pawan Kumawat", phone: "+91 90019 88877", licenseNumber: "RJ14 2023 1122113", licenseType: "LMV", experience: "2 Years", status: "Active", assignedBus: "RJ14PA3456" },
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

function DriverListing({ onAddNew }: { onAddNew: () => void }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

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
            onClick={onAddNew}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Driver
          </Button>
        </div>
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
                  <p className="text-xs text-gray-400">{card.subtitle}</p>
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

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or license..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
          />
        </div>

        <Select>
          <SelectTrigger className="w-full sm:w-[140px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All License Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All License Types</SelectItem>
            <SelectItem value="lmv">LMV</SelectItem>
            <SelectItem value="hmv">HMV</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm bg-white border-gray-200">
            <SelectValue placeholder="All Blood Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Groups</SelectItem>
            <SelectItem value="a+">A+</SelectItem>
            <SelectItem value="b+">B+</SelectItem>
            <SelectItem value="o+">O+</SelectItem>
            <SelectItem value="ab+">AB+</SelectItem>
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

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 w-12">
                  #
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Driver
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Phone Number
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  License Number
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  License Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Experience
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4">
                  Assigned Buses
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 px-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driversData.map((driver, index) => (
                <TableRow
                  key={driver.id}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-500">{driver.id}</span>
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
                          {getInitials(driver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-800">
                        {driver.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600">{driver.phone}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-600 font-mono">
                      {driver.licenseNumber}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-2.5 py-0.5 rounded-full border",
                        driver.licenseType === "HMV"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      )}
                    >
                      {driver.licenseType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className="text-sm text-gray-700 font-medium">
                      {driver.experience}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          driver.status === "Active"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          driver.status === "Active"
                            ? "text-emerald-600"
                            : "text-red-600"
                        )}
                      >
                        {driver.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-4">
                    <span className={cn(
                      "text-sm",
                      driver.assignedBus === "—" ? "text-gray-300" : "text-gray-600 font-mono"
                    )}>
                      {driver.assignedBus}
                    </span>
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 gap-3">
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">1</span> to{" "}
            <span className="font-medium text-gray-700">10</span> of{" "}
            <span className="font-medium text-gray-700">25</span> drivers
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

// ─── ADD NEW DRIVER FORM ───────────────────────────────────────────────────

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function AddDriverForm({ onBack, editData }: { onBack: () => void, editData?: any }) {
  const { setCustomHeader } = useNavStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const licenseInputRef = React.useRef<HTMLInputElement>(null);
  const aadharInputRef = React.useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    editData?.profile_image || null
  );
  const [licenseCopy, setLicenseCopy] = useState<File | null>(null);
  const [aadharCopy, setAadharCopy] = useState<File | null>(null);

  const { mutate: createDriver, isPending: isCreating } = useCreateDriver();
  const { mutate: updateDriver, isPending: isUpdating } = useUpdateDriver(editData?.id);
  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    driverName: editData?.driver_name || "",
    dateOfBirth: editData?.dob ? new Date(editData.dob).toISOString().split('T')[0] : "",
    gender: editData?.gender || "",
    phoneNumber: editData?.driver_phone || "",
    email: editData?.driver_email || "",
    address: editData?.address || "",
    city: editData?.city || "",
    state: editData?.state || "",
    pinCode: editData?.pincode || "",
    licenseNumber: editData?.license_number || "",
    licenseType: editData?.license_type || "",
    licenseIssueDate: editData?.license_issue_date ? new Date(editData.license_issue_date).toISOString().split('T')[0] : "",
    licenseExpiryDate: editData?.license_expiry_date ? new Date(editData.license_expiry_date).toISOString().split('T')[0] : "",
    aadhaarNumber: editData?.aadhar_number || "",
    panNumber: editData?.pan_number || "",
    experience: editData?.experience_years?.toString() || "",
    bloodGroup: editData?.blood_group || "",
    emergencyContactName: editData?.emergency_contact_name || "",
    emergencyContactNumber: editData?.emergency_contact_number || "",
    driverStatus: editData?.status || "",
    joiningDate: editData?.joining_date ? new Date(editData.joining_date).toISOString().split('T')[0] : "",
    remarks: editData?.remarks || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateFormats = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.driverName) newErrors.driverName = "Driver name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pinCode) newErrors.pinCode = "PIN code is required";
    if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required";
    if (!formData.licenseType) newErrors.licenseType = "License type is required";
    if (!formData.licenseIssueDate) newErrors.licenseIssueDate = "Issue date is required";
    if (!formData.licenseExpiryDate) newErrors.licenseExpiryDate = "Expiry date is required";
    if (!formData.experience) newErrors.experience = "Experience is required";
    if (!formData.emergencyContactName) newErrors.emergencyContactName = "Emergency contact name is required";
    if (!formData.emergencyContactNumber) newErrors.emergencyContactNumber = "Emergency contact number is required";
    if (!formData.driverStatus) newErrors.driverStatus = "Driver status is required";
    if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required";

    // Aadhaar: 12 digits
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Enter valid number";
    }
    
    // PAN: ABCDE1234F
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = "Enter valid number";
    }

    // Phone: 10 digits
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    // License Number: Standard DL validation (allowing spaces/hyphens)
    if (formData.licenseNumber && !/^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}$/i.test(formData.licenseNumber)) {
      newErrors.licenseNumber = "Enter valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'license' | 'aadhar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${type === 'profile' ? 'Profile photo' : type === 'license' ? 'License copy' : 'Aadhaar copy'} must be less than 5MB`,
        variant: "destructive",
      });
      e.target.value = ''; // Reset input
      return;
    }

    if (type === 'profile') {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    } else if (type === 'license') {
      setLicenseCopy(file);
    } else if (type === 'aadhar') {
      setAadharCopy(file);
    }
  };

  const handleSave = () => {
    if (!validateFormats()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append('driver_name', formData.driverName);
    data.append('dob', formData.dateOfBirth);
    data.append('gender', formData.gender);
    data.append('driver_phone', formData.phoneNumber);
    data.append('driver_email', formData.email);
    data.append('address', formData.address);
    data.append('city', formData.city);
    data.append('state', formData.state);
    data.append('pincode', formData.pinCode);
    data.append('license_number', formData.licenseNumber);
    data.append('license_type', formData.licenseType);
    data.append('license_issue_date', formData.licenseIssueDate);
    data.append('license_expiry_date', formData.licenseExpiryDate);
    data.append('aadhar_number', formData.aadhaarNumber);
    data.append('pan_number', formData.panNumber.toUpperCase());
    data.append('blood_group', formData.bloodGroup);
    data.append('emergency_contact_name', formData.emergencyContactName);
    data.append('emergency_contact_number', formData.emergencyContactNumber);
    data.append('remarks', formData.remarks);
    data.append('experience_years', formData.experience);
    data.append('status', formData.driverStatus);
    data.append('joining_date', formData.joiningDate);

    if (profileImage) data.append('profile_image', profileImage);
    if (licenseCopy) data.append('license_copy', licenseCopy);
    if (aadharCopy) data.append('aadhar_copy', aadharCopy);

    // If editing, we might need to spoof PUT method for FormData if Laravel requires it
    if (editData) {
      data.append('_method', 'PUT');
    }

    const mutation = editData ? updateDriver : createDriver;

    mutation(data, {
      onSuccess: () => {
        toast({ title: "Success", description: `Driver ${editData ? 'updated' : 'added'} successfully` });
        onBack();
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || `Failed to ${editData ? 'update' : 'save'} driver`,
          variant: "destructive",
        });
      }
    });
  };

  React.useEffect(() => {
    setCustomHeader(
      editData ? "Edit Driver" : "Add New Driver",
      [
        { label: "Home", isActive: false },
        { label: "Drivers", isActive: false },
        { label: editData ? "Edit Driver" : "Add New Driver", isActive: true },
      ],
      true
    );
    return () => setCustomHeader(null, null, false);
  }, [setCustomHeader, editData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when typing
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Header with Breadcrumb and Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{editData ? "Edit Driver" : "Add New Driver"}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <HomeIcon className="w-3.5 h-3.5 text-gray-400" />
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Home</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Drivers</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 font-medium">{editData ? "Edit Driver" : "Add New Driver"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Drivers
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleSave}
            className="h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isPending ? "Saving..." : editData ? "Update Driver" : "Save Driver"}
          </Button>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Driver Name" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter driver name"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.driverName && "border-red-500")}
                value={formData.driverName}
                onChange={(e) => handleChange("driverName", e.target.value)}
              />
              {errors.driverName && <p className="text-[10px] text-red-500 font-medium">{errors.driverName}</p>}
            </div>
          </FormField>
          <FormField label="Date of Birth" required>
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Select date"
                  className={cn("h-10 border-gray-200 focus:border-blue-300 pr-10", errors.dateOfBirth && "border-red-500")}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.dateOfBirth && <p className="text-[10px] text-red-500 font-medium">{errors.dateOfBirth}</p>}
            </div>
          </FormField>
          <FormField label="Gender" required>
            <div className="space-y-1">
              <Select
                value={formData.gender}
                onValueChange={(val) => handleChange("gender", val)}
              >
                <SelectTrigger className={cn("h-10 border-gray-200", errors.gender && "border-red-500")}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-[10px] text-red-500 font-medium">{errors.gender}</p>}
            </div>
          </FormField>
          <FormField label="Phone Number" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter 10 digit number"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.phoneNumber && "border-red-500 focus:border-red-500")}
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
              {errors.phoneNumber && <p className="text-[10px] text-red-500 font-medium">{errors.phoneNumber}</p>}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Email">
            <Input
              placeholder="Enter email (optional)"
              className="h-10 border-gray-200 focus:border-blue-300"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </FormField>
          <FormField label="Address" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter full address"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.address && "border-red-500")}
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
              {errors.address && <p className="text-[10px] text-red-500 font-medium">{errors.address}</p>}
            </div>
          </FormField>
          <FormField label="City" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter city"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.city && "border-red-500")}
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              {errors.city && <p className="text-[10px] text-red-500 font-medium">{errors.city}</p>}
            </div>
          </FormField>
          <FormField label="State" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter state"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.state && "border-red-500")}
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
              {errors.state && <p className="text-[10px] text-red-500 font-medium">{errors.state}</p>}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="PIN Code" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter PIN code"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.pinCode && "border-red-500")}
                value={formData.pinCode}
                onChange={(e) => handleChange("pinCode", e.target.value)}
              />
              {errors.pinCode && <p className="text-[10px] text-red-500 font-medium">{errors.pinCode}</p>}
            </div>
          </FormField>
          <FormField label="Profile Photo">
            <div className="relative overflow-hidden border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer min-h-[82px] flex flex-col justify-center items-center">
              <input
                type="file"
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'profile')}
              />
              {profilePreview ? (
                <div className="flex items-center justify-center gap-4 relative z-0">
                  <img src={profilePreview} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Preview" />
                  <p className="text-sm text-blue-600 font-medium">Click to change photo</p>
                </div>
              ) : (
                <div className="relative z-0 flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </div>
          </FormField>
        </div>
      </div>

      {/* Section 2: License & Documents */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
          License & Documents
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="License Number" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter license number"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.licenseNumber && "border-red-500 focus:border-red-500")}
                value={formData.licenseNumber}
                onChange={(e) => handleChange("licenseNumber", e.target.value)}
              />
              {errors.licenseNumber && <p className="text-[10px] text-red-500 font-medium">{errors.licenseNumber}</p>}
            </div>
          </FormField>
          <FormField label="License Type" required>
            <div className="space-y-1">
              <Select
                value={formData.licenseType}
                onValueChange={(val) => handleChange("licenseType", val)}
              >
                <SelectTrigger className={cn("h-10 border-gray-200", errors.licenseType && "border-red-500")}>
                  <SelectValue placeholder="Select license type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lmv">LMV</SelectItem>
                  <SelectItem value="hmv">HMV</SelectItem>
                </SelectContent>
              </Select>
              {errors.licenseType && <p className="text-[10px] text-red-500 font-medium">{errors.licenseType}</p>}
            </div>
          </FormField>
          <FormField label="License Issue Date" required>
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Select date"
                  className={cn("h-10 border-gray-200 focus:border-blue-300 pr-10", errors.licenseIssueDate && "border-red-500")}
                  value={formData.licenseIssueDate}
                  onChange={(e) => handleChange("licenseIssueDate", e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.licenseIssueDate && <p className="text-[10px] text-red-500 font-medium">{errors.licenseIssueDate}</p>}
            </div>
          </FormField>
          <FormField label="License Expiry Date" required>
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Select date"
                  className={cn("h-10 border-gray-200 focus:border-blue-300 pr-10", errors.licenseExpiryDate && "border-red-500")}
                  value={formData.licenseExpiryDate}
                  onChange={(e) => handleChange("licenseExpiryDate", e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.licenseExpiryDate && <p className="text-[10px] text-red-500 font-medium">{errors.licenseExpiryDate}</p>}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Aadhaar Number">
            <div className="space-y-1">
              <Input
                placeholder="Enter 12 digit number"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.aadhaarNumber && "border-red-500 focus:border-red-500")}
                value={formData.aadhaarNumber}
                onChange={(e) => handleChange("aadhaarNumber", e.target.value)}
              />
              {errors.aadhaarNumber && <p className="text-[10px] text-red-500 font-medium">{errors.aadhaarNumber}</p>}
            </div>
          </FormField>
          <FormField label="PAN Number">
            <div className="space-y-1">
              <Input
                placeholder="e.g. ABCDE1234F"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.panNumber && "border-red-500 focus:border-red-500")}
                value={formData.panNumber}
                onChange={(e) => handleChange("panNumber", e.target.value)}
              />
              {errors.panNumber && <p className="text-[10px] text-red-500 font-medium">{errors.panNumber}</p>}
            </div>
          </FormField>
          <FormField label="Upload License Copy" required>
            <div className="space-y-1">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileChange(e, 'license')}
                className="h-10 border-gray-200 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                JPG, PNG or PDF (Max 5MB)
              </p>
            </div>
          </FormField>
          <FormField label="Upload Aadhaar Copy">
            <div className="space-y-1">
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileChange(e, 'aadhar')}
                className="h-10 border-gray-200 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                JPG, PNG or PDF (Max 5MB)
              </p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Section 3: Other Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
          Other Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField label="Experience (In Years)" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter experience"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.experience && "border-red-500")}
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
              />
              {errors.experience && <p className="text-[10px] text-red-500 font-medium">{errors.experience}</p>}
            </div>
          </FormField>
          <FormField label="Blood Group">
            <Select
              value={formData.bloodGroup}
              onValueChange={(val) => handleChange("bloodGroup", val)}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a+">A+</SelectItem>
                <SelectItem value="a-">A-</SelectItem>
                <SelectItem value="b+">B+</SelectItem>
                <SelectItem value="b-">B-</SelectItem>
                <SelectItem value="o+">O+</SelectItem>
                <SelectItem value="o-">O-</SelectItem>
                <SelectItem value="ab+">AB+</SelectItem>
                <SelectItem value="ab-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Emergency Contact Name" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter contact name"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.emergencyContactName && "border-red-500")}
                value={formData.emergencyContactName}
                onChange={(e) => handleChange("emergencyContactName", e.target.value)}
              />
              {errors.emergencyContactName && <p className="text-[10px] text-red-500 font-medium">{errors.emergencyContactName}</p>}
            </div>
          </FormField>
          <FormField label="Emergency Contact Number" required>
            <div className="space-y-1">
              <Input
                placeholder="Enter contact number"
                className={cn("h-10 border-gray-200 focus:border-blue-300", errors.emergencyContactNumber && "border-red-500")}
                value={formData.emergencyContactNumber}
                onChange={(e) => handleChange("emergencyContactNumber", e.target.value)}
              />
              {errors.emergencyContactNumber && <p className="text-[10px] text-red-500 font-medium">{errors.emergencyContactNumber}</p>}
            </div>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField label="Driver Status" required>
            <div className="space-y-1">
              <Select
                value={formData.driverStatus}
                onValueChange={(val) => handleChange("driverStatus", val)}
              >
                <SelectTrigger className={cn("h-10 border-gray-200", errors.driverStatus && "border-red-500")}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.driverStatus && <p className="text-[10px] text-red-500 font-medium">{errors.driverStatus}</p>}
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Active drivers can be assigned to trips
              </p>
            </div>
          </FormField>
          <FormField label="Joining Date" required>
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="date"
                  placeholder="Select date"
                  className={cn("h-10 border-gray-200 focus:border-blue-300 pr-10", errors.joiningDate && "border-red-500")}
                  value={formData.joiningDate}
                  onChange={(e) => handleChange("joiningDate", e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.joiningDate && <p className="text-[10px] text-red-500 font-medium">{errors.joiningDate}</p>}
            </div>
          </FormField>
          <FormField label="Remarks">
            <Textarea
              placeholder="Enter remarks (optional)"
              className="h-10 border-gray-200 focus:border-blue-300 min-h-[40px] resize-none"
              value={formData.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
            />
          </FormField>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-5 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
          onClick={onBack}
        >
          <X className="w-4 h-4 mr-1.5" />
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={isPending}
          onClick={handleSave}
          className="h-10 px-5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isPending ? "Saving..." : "Save Driver"}
        </Button>
      </div>
    </div>
  );
}

// ─── MAIN DRIVERS PAGE COMPONENT ───────────────────────────────────────────

import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "@/hooks/use-drivers";
import { toast } from "@/hooks/use-toast";

export function DriversPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [viewingDriver, setViewingDriver] = useState<any>(null);
  const [page, setPage] = useState(1);
  const { data: driversResponse, isLoading, isError } = useDrivers(page);
  const { mutate: deleteDriver } = useDeleteDriver();
  const drivers = driversResponse?.data || [];
  const meta = driversResponse?.meta;

  const handleDeleteDriver = (id: number) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      deleteDriver(id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Driver deleted successfully" });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to delete driver",
            variant: "destructive",
          });
        }
      });
    }
  };

  if (isAdding || editingDriver) {
    return (
      <AddDriverForm 
        onBack={() => {
          setIsAdding(false);
          setEditingDriver(null);
        }} 
        editData={editingDriver}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", card.iconBg)}>
                <card.icon className={cn("w-5 h-5", card.iconColor)} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{card.amount}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons Row */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search drivers..."
                className="pl-9 h-10 border-gray-200 focus:border-blue-300"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="h-10 w-[130px] border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10 border-gray-200 text-gray-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 border-gray-200 text-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading drivers...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading drivers.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="w-[80px] text-gray-500 font-semibold py-4">Avatar</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Driver Details</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">License No.</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Location</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Experience</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Joining Date</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4 text-center">Status</TableHead>
                    <TableHead className="text-right text-gray-500 font-semibold py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                        No drivers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    drivers.map((driver: any, index: number) => (
                      <TableRow key={driver.id} className="group hover:bg-gray-50/50 border-gray-100 transition-colors">
                        <TableCell className="py-4">
                          <Avatar className={cn("w-10 h-10 border border-gray-200", avatarColors[index % avatarColors.length])}>
                            {driver.profile_image && <AvatarImage src={driver.profile_image} alt={driver.driver_name} className="object-cover" />}
                            <AvatarFallback className="font-bold text-sm">
                              {getInitials(driver.driver_name)}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{driver.driver_name}</span>
                            <span className="text-xs text-gray-400 font-medium mt-0.5">{driver.driver_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            {driver.license_number}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-600">
                          {driver.city && driver.state ? `${driver.city}, ${driver.state}` : driver.city || driver.state || "—"}
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-600">
                          {driver.experience_years} Years
                        </TableCell>
                        <TableCell className="py-4 text-sm text-gray-600">
                          {driver.joining_date ? new Date(driver.joining_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0", driver.status === 'active' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                            {driver.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => setViewingDriver(driver)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-amber-600 hover:bg-amber-50"
                              onClick={() => setEditingDriver(driver)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteDriver(driver.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {meta && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{meta.from || 0}</span> to <span className="font-medium text-gray-900">{meta.to || 0}</span> of <span className="font-medium text-gray-900">{meta.total || 0}</span> drivers
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-gray-200"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(meta.last_page || 1)].map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        className={cn("w-8 h-8 p-0 text-xs font-medium", page === i + 1 ? "bg-blue-600 hover:bg-blue-700" : "border-gray-200")}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-gray-200"
                    disabled={page === meta.last_page}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DriverViewDialog 
        driver={viewingDriver} 
        open={!!viewingDriver} 
        onOpenChange={(open) => !open && setViewingDriver(null)} 
      />
    </div>
  );
}
