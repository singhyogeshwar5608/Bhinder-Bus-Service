import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  PauseCircle,
  Clock,
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
  MapPin,
  ArrowRight,
  Save,
  X,
  ArrowLeft,
  Info,
  Home as HomeIcon,
  Bus,
  FileText,
  Settings,
  Users,
  Settings2,
  Fuel,
  Wind,
  User,
  ShieldCheck,
  Navigation,
  Timer,
  IndianRupee,
  LayoutGrid,
  Phone,
  Mail,
  Route,
  FileCheck,
  Activity,
  Briefcase,
  Droplets,
  HeartPulse,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSchedules, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useScheduleStats } from "@/hooks/use-schedules";
import { useBuses } from "@/hooks/use-buses";
import { useRoutes } from "@/hooks/use-routes";
import { useDrivers } from "@/hooks/use-drivers";
import { toast } from "@/hooks/use-toast";
import { useNavStore } from "@/lib/nav-store";
import { scheduleService } from "@/services/schedule.service";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const formatSafeDate = (dateStr: any) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? "N/A" : format(date, "dd MMM, yyyy");
};

const isValidDate = (dateStr: any) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/* ─────────────────────────────────────────────
   STAT CARDS DATA (matching reference)
   ───────────────────────────────────────────── */
const statCards = [
  {
    title: "Total Schedules",
    amount: "320",
    subtitle: "All schedules in system",
    icon: CalendarDays,
    iconBg: "bg-blue-600",
    iconColor: "text-white",
  },
  {
    title: "Active Schedules",
    amount: "278",
    subtitle: "Currently running",
    icon: CheckCircle2,
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
  },
  {
    title: "Inactive Schedules",
    amount: "28",
    subtitle: "Paused or stopped",
    icon: PauseCircle,
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
  {
    title: "Today's Trips",
    amount: "42",
    subtitle: "Scheduled for today",
    icon: Clock,
    iconBg: "bg-purple-600",
    iconColor: "text-white",
  },
];

/* ─────────────────────────────────────────────
   TABLE DATA (matching reference)
   ───────────────────────────────────────────── */
type ScheduleStatus = "Active" | "Inactive";

interface ScheduleRecord {
  id: number;
  scheduleId: string;
  busName: string;
  operator: string;
  busImage: string;
  route: string;
  via: string;
  departure: string;
  arrival: string;
  days: string[];
  fare: string;
  seats: number;
  status: ScheduleStatus;
}

const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const schedulesData: ScheduleRecord[] = [
  {
    id: 1,
    scheduleId: "SCH-240524-001",
    busName: "Volvo AC Seater",
    operator: "Sharma Travels",
    busImage: "/bus-1.png",
    route: "Delhi → Jaipur",
    via: "Gurugram",
    departure: "06:30 AM",
    arrival: "12:30 PM",
    days: allDays,
    fare: "₹1,200",
    seats: 45,
    status: "Active",
  },
  {
    id: 2,
    scheduleId: "SCH-240524-002",
    busName: "Bharat Benz Sleeper",
    operator: "Patel Bus Service",
    busImage: "/bus-2.png",
    route: "Mumbai → Pune",
    via: "Lonavala",
    departure: "08:00 PM",
    arrival: "11:00 PM",
    days: allDays,
    fare: "₹650",
    seats: 36,
    status: "Active",
  },
  {
    id: 3,
    scheduleId: "SCH-240524-003",
    busName: "Scania Multi Axle",
    operator: "Karnataka Express",
    busImage: "/bus-4.png",
    route: "Bangalore → Chennai",
    via: "Vellore",
    departure: "09:00 PM",
    arrival: "03:15 AM",
    days: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    fare: "₹1,500",
    seats: 40,
    status: "Active",
  },
  {
    id: 4,
    scheduleId: "SCH-240524-004",
    busName: "Tata Non AC Seater",
    operator: "Madhya Travels",
    busImage: "/bus-3.png",
    route: "Indore → Bhopal",
    via: "Dewas",
    departure: "07:00 AM",
    arrival: "10:00 AM",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    fare: "₹700",
    seats: 52,
    status: "Active",
  },
  {
    id: 5,
    scheduleId: "SCH-240524-005",
    busName: "Volvo B11R Sleeper",
    operator: "Maharashtra Travels",
    busImage: "/bus-6.png",
    route: "Pune → Nashik",
    via: "Chakan",
    departure: "10:30 PM",
    arrival: "02:30 AM",
    days: allDays,
    fare: "₹900",
    seats: 38,
    status: "Active",
  },
  {
    id: 6,
    scheduleId: "SCH-240524-006",
    busName: "Ashok Leyland Seater",
    operator: "UP State Transports",
    busImage: "/bus-5.png",
    route: "Lucknow → Kanpur",
    via: "Unnao",
    departure: "05:45 PM",
    arrival: "07:45 PM",
    days: allDays,
    fare: "₹350",
    seats: 50,
    status: "Inactive",
  },
  {
    id: 7,
    scheduleId: "SCH-240524-007",
    busName: "Force Traveller",
    operator: "Rajasthan Roadways",
    busImage: "/bus-7.png",
    route: "Jaipur → Udaipur",
    via: "Ajmer",
    departure: "08:00 AM",
    arrival: "02:30 PM",
    days: ["Tue", "Thu", "Sat"],
    fare: "₹800",
    seats: 42,
    status: "Inactive",
  },
  {
    id: 8,
    scheduleId: "SCH-240524-008",
    busName: "Bharat Benz Sleeper",
    operator: "Patel Bus Service",
    busImage: "/bus-2.png",
    route: "Surat → Ahmedabad",
    via: "Bharuch",
    departure: "11:00 PM",
    arrival: "03:30 AM",
    days: allDays,
    fare: "₹600",
    seats: 36,
    status: "Active",
  },
  {
    id: 9,
    scheduleId: "SCH-240524-009",
    busName: "Volvo AC Seater",
    operator: "Sharma Travels",
    busImage: "/bus-1.png",
    route: "Delhi → Chandigarh",
    via: "Panipat",
    departure: "07:00 AM",
    arrival: "11:30 AM",
    days: ["Mon", "Wed", "Fri", "Sat", "Sun"],
    fare: "₹1,000",
    seats: 45,
    status: "Active",
  },
  {
    id: 10,
    scheduleId: "SCH-240524-010",
    busName: "Scania Multi Axle",
    operator: "Karnataka Express",
    busImage: "/bus-4.png",
    route: "Hyderabad → Vijayawada",
    via: "Guntur",
    departure: "09:30 PM",
    arrival: "01:00 AM",
    days: allDays,
    fare: "₹900",
    seats: 40,
    status: "Active",
  },
];

const statusStyles: Record<ScheduleStatus, string> = {
  Active: "bg-emerald-500 text-white",
  Inactive: "bg-amber-500 text-white",
};

/* ─────────────────────────────────────────────
   DAYS BADGE COMPONENT
   ───────────────────────────────────────────── */
function DaysBadges({ days }: { days: string[] }) {
  const isDaily = days.length === 7 && allDays.every((d) => days.includes(d));

  if (isDaily) {
    return (
      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 leading-none">
        Daily
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-0.5">
      {allDays.map((day) => {
        const isActive = days.includes(day);
        return (
          <span
            key={day}
            className={cn(
              "inline-flex items-center justify-center w-6 h-5 rounded text-[9px] font-bold leading-none",
              isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-gray-100 text-gray-300"
            )}
          >
            {day.slice(0, 2)}
          </span>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM FIELD COMPONENT
   ───────────────────────────────────────────── */
function FormField({
  label,
  required,
  children,
  helperText,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {helperText && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
          <Info className="w-3 h-3" />
          {helperText}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ADD/EDIT SCHEDULE FORM
   ───────────────────────────────────────────── */
function AddScheduleForm({ onBack, editData }: { onBack: () => void; editData?: any }) {
  const { setCustomHeader } = useNavStore();
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule(editData?.id);
  const isPending = isCreating || isUpdating;

  // Fetch buses, routes, and drivers for dropdown selection
  const { data: busesResponse } = useBuses({ per_page: 100 });
  const { data: routesResponse } = useRoutes(1, { per_page: 100 });
  const { data: driversResponse } = useDrivers({ per_page: 100 });

  const [formData, setFormData] = useState({
    busId: editData?.bus_id?.toString() || "",
    routeId: editData?.route_id?.toString() || "",
    driverId: editData?.driver_id?.toString() || "",
    journeyDate: editData?.journey_date || "",
    departureTime: editData?.departure_time ? editData.departure_time.slice(0, 5) : "",
    arrivalTime: editData?.arrival_time ? editData.arrival_time.slice(0, 5) : "",
    fare: editData?.fare?.toString() || "",
    availableSeats: editData?.available_seats?.toString() || "",
    status: editData?.status || "scheduled",
  });

  const buses = busesResponse?.data || [];
  const routes = routesResponse?.data || [];
  const drivers = driversResponse?.data || [];
  const selectedRoute = routes.find((r: any) => r.id?.toString() === formData.routeId);

  const [viewingBusId, setViewingBusId] = useState<number | null>(null);
  const [viewingRouteId, setViewingRouteId] = useState<number | null>(null);
  const [viewingDriverId, setViewingDriverId] = useState<number | null>(null);

  const selectedBusObj = buses.find((b: any) => b.id === viewingBusId);
  const selectedRouteObj = routes.find((r: any) => r.id === viewingRouteId);
  const selectedDriverObj = drivers.find((d: any) => d.id === viewingDriverId);

  React.useEffect(() => {
    setCustomHeader(
      editData ? "Edit Schedule" : "Add New Schedule",
      [
        { label: "Home", isActive: false },
        { label: "Schedules", isActive: false },
        { label: editData ? "Edit Schedule" : "Add New Schedule", isActive: true },
      ],
      true
    );
    return () => setCustomHeader(null, null, false);
  }, [setCustomHeader, editData]);

  // Auto-fill available seats and driver when a bus is selected
  const handleBusChange = (busIdStr: string) => {
    const selectedBus = buses.find((b: any) => b.id.toString() === busIdStr);
    setFormData((prev) => ({
      ...prev,
      busId: busIdStr,
      availableSeats: selectedBus ? selectedBus.total_seats.toString() : prev.availableSeats,
      driverId: selectedBus && (selectedBus.driver_id || selectedBus.driver?.id) ? (selectedBus.driver_id || selectedBus.driver?.id).toString() : prev.driverId,
    }));
  };

  // Auto-fill fare, departure time, and arrival time when a route is selected
  const handleRouteChange = (routeIdStr: string) => {
    const selectedRoute = routes.find((r: any) => r.id.toString() === routeIdStr);
    
    let depTime = "";
    if (selectedRoute?.from_city_arrival_time) {
      depTime = selectedRoute.from_city_arrival_time.slice(0, 5);
    }
    
    let arrTime = "";
    if (selectedRoute?.stops && selectedRoute.stops.length > 0) {
      const sortedStops = [...selectedRoute.stops].sort((a: any, b: any) => a.order - b.order);
      const lastStop = sortedStops[sortedStops.length - 1];
      if (lastStop?.arrival_time) {
        arrTime = lastStop.arrival_time.slice(0, 5);
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      routeId: routeIdStr,
      fare: selectedRoute ? selectedRoute.total_fare.toString() : prev.fare,
      departureTime: depTime || prev.departureTime,
      arrivalTime: arrTime || prev.arrivalTime,
    }));
  };

  const handleSave = () => {
    if (!formData.busId || !formData.routeId || !formData.journeyDate || !formData.departureTime || !formData.arrivalTime || !formData.fare || !formData.availableSeats) {
      toast({
        title: "Required Fields",
        description: "All fields marked with * are mandatory",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      bus_id: parseInt(formData.busId),
      route_id: parseInt(formData.routeId),
      driver_id: (formData.driverId && formData.driverId !== 'none') ? parseInt(formData.driverId) : null,
      journey_date: formData.journeyDate,
      departure_time: formData.departureTime,
      arrival_time: formData.arrivalTime,
      fare: parseFloat(formData.fare),
      available_seats: parseInt(formData.availableSeats),
      status: formData.status,
    };

    if (editData) {
      updateSchedule(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Schedule updated successfully" });
          onBack();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to update schedule",
            variant: "destructive",
          });
        },
      });
    } else {
      createSchedule(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Schedule added successfully" });
          onBack();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to add schedule",
            variant: "destructive",
          });
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{editData ? "Edit Schedule" : "Add New Schedule"}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <HomeIcon className="w-3.5 h-3.5 text-gray-400" />
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Home</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Schedules</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 font-medium">{editData ? "Edit Schedule" : "Add New Schedule"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <Button size="sm" className="h-10 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={isPending}>
            <Save className="w-4 h-4 mr-1.5" /> {isPending ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Bus" required helperText="Select the vehicle for this schedule">
            <Select value={formData.busId} onValueChange={handleBusChange}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select a Bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus: any) => (
                  <SelectItem key={bus.id} value={bus.id.toString()}>
                    {bus.bus_name} ({bus.bus_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.busId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50/50 flex items-center gap-1"
                onClick={() => setViewingBusId(parseInt(formData.busId))}
              >
                <Eye className="w-3.5 h-3.5" />
                View Bus Details
              </Button>
            )}
          </FormField>

          <FormField label="Route" required helperText="Select the route of travel">
            <Select value={formData.routeId} onValueChange={handleRouteChange}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select a Route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route: any) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.from_city} → {route.to_city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.routeId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50/50 flex items-center gap-1"
                onClick={() => setViewingRouteId(parseInt(formData.routeId))}
              >
                <Eye className="w-3.5 h-3.5" />
                View Route Details
              </Button>
            )}
          </FormField>

          <FormField label="Assigned Driver" helperText="Select a driver for this schedule (optional)">
            <Select value={formData.driverId || "none"} onValueChange={(val) => setFormData({ ...formData, driverId: val })}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select a Driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Driver / Unassigned</SelectItem>
                {drivers.map((driver: any) => (
                  <SelectItem key={driver.id} value={driver.id.toString()}>
                    {driver.driver_name} ({driver.license_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.driverId && formData.driverId !== "none" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50/50 flex items-center gap-1"
                onClick={() => setViewingDriverId(parseInt(formData.driverId))}
              >
                <Eye className="w-3.5 h-3.5" />
                View Driver Details
              </Button>
            )}
          </FormField>

          <FormField label="Journey Date" required>
            <Input
              type="date"
              value={formData.journeyDate}
              onChange={(e) => setFormData({ ...formData, journeyDate: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>

          <FormField label="Available Seats" required helperText="Defaults to the selected bus seating capacity">
            <Input
              type="number"
              placeholder="e.g. 45"
              value={formData.availableSeats}
              onChange={(e) => setFormData({ ...formData, availableSeats: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>

          <FormField label="Departure Time" required>
            <div className="relative">
              <Input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="h-11 pl-10 border-gray-200 focus:border-blue-300"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </FormField>

          <FormField label="Arrival Time" required>
            <div className="relative">
              <Input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="h-11 pl-10 border-gray-200 focus:border-blue-300"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </FormField>

          <FormField label="Ticket Fare (₹)" required helperText="Ticket price per seat">
            <Input
              type="number"
              placeholder="e.g. 1200"
              value={formData.fare}
              onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>

          <FormField label="Status" required helperText="Select schedule status">
            <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      <SchedulesBusViewDialog
        busId={viewingBusId}
        open={viewingBusId !== null}
        onOpenChange={(open) => !open && setViewingBusId(null)}
      />
      <SchedulesRouteViewDialog
        routeId={viewingRouteId}
        open={viewingRouteId !== null}
        onOpenChange={(open) => !open && setViewingRouteId(null)}
      />
      <SchedulesDriverViewDialog
        driverId={viewingDriverId}
        open={viewingDriverId !== null}
        onOpenChange={(open) => !open && setViewingDriverId(null)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDULE DETAIL VIEW DIALOG
   ───────────────────────────────────────────── */
function ScheduleViewDialog({ schedule, open, onOpenChange }: { schedule: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  if (!schedule) return null;

  const bus = schedule.bus;
  const route = schedule.route;
  const driver = schedule.driver;

  const busDetails = bus ? [
    { label: "Bus Name", value: bus.bus_name, icon: Bus, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bus Number", value: bus.bus_number, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Bus Type", value: bus.bus_type, icon: Bus, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Category", value: bus.bus_category || "N/A", icon: Settings, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Capacity", value: `${bus.total_seats} Seats`, icon: Users, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Manufacturer", value: bus.manufacturer || "N/A", icon: Settings2, color: "text-indigo-650", bg: "bg-indigo-50" },
    { label: "Model", value: bus.model || "N/A", icon: Info, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Fuel Type", value: bus.fuel_type || "N/A", icon: Fuel, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Emission", value: bus.emission_norms || "N/A", icon: Wind, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Transmission", value: bus.transmission_type || "N/A", icon: Settings, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Operator", value: bus.operator || "N/A", icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Engine No", value: bus.engine_number || "N/A", icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Chassis No", value: bus.chassis_number || "N/A", icon: FileText, color: "text-slate-600", bg: "bg-slate-50" },
  ] : [];

  const busCompliance = bus ? [
    { label: "Insurance", value: bus.insurance_number, valid: bus.insurance_valid_till },
    { label: "Fitness", value: bus.fitness_certificate_number, valid: bus.fitness_valid_till },
    { label: "PUC", value: bus.puc_number, valid: bus.puc_valid_till },
  ] : [];

  const routeDetails = route ? [
    { label: "From City", value: route.from_city, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "To City", value: route.to_city, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Departure Time", value: schedule.departure_time ? schedule.departure_time.slice(0, 5) : "N/A", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Arrival Time", value: schedule.arrival_time ? schedule.arrival_time.slice(0, 5) : "N/A", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Distance", value: `${route.distance} km`, icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Duration", value: route.duration || "N/A", icon: Timer, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Total Fare", value: `₹${route.total_fare}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Road Type", value: route.road_type || "N/A", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Status", value: route.status?.toUpperCase(), icon: CheckCircle2, color: route.status === 'active' ? "text-emerald-600" : "text-red-600", bg: route.status === 'active' ? "bg-emerald-50" : "bg-red-50" },
  ] : [];

  const driverDetails = driver ? [
    { label: "Driver Name", value: driver.driver_name, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Phone Number", value: driver.driver_phone, icon: Phone, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Email Address", value: driver.driver_email || "N/A", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Gender", value: driver.gender || "N/A", icon: User, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Experience", value: `${driver.experience_years || 0} Years`, icon: Settings, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "License Number", value: driver.license_number, icon: FileText, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "License Type", value: driver.license_type || "N/A", icon: Settings2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Status", value: driver.status?.toUpperCase() || "ACTIVE", icon: CheckCircle2, color: driver.status === 'active' ? "text-emerald-600" : "text-amber-600", bg: driver.status === 'active' ? "bg-emerald-50" : "bg-amber-50" },
    { label: "Blood Group", value: driver.blood_group || "N/A", icon: Info, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Joining Date", value: formatSafeDate(driver.joining_date), icon: CalendarDays, color: "text-indigo-600", bg: "bg-indigo-50" },
  ] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b bg-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Schedule Details & Integration
          </DialogTitle>
          <DialogDescription className="text-sm">
            Detailed information of the selected Schedule (Bus & Route)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-gray-50/30">
          <Tabs defaultValue="route" className="h-full flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="route" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Route Information
              </TabsTrigger>
              <TabsTrigger value="bus" className="flex items-center gap-2">
                <Bus className="w-4 h-4" />
                Vehicle (Bus) Details
              </TabsTrigger>
              <TabsTrigger value="driver" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Driver Details
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin" style={{ maxHeight: 'calc(90vh - 260px)' }}>
              <TabsContent value="route" className="mt-0 outline-none space-y-6">
                {/* Route Core Flow Header */}
                {route && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-150 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Starting Point</p>
                        <h3 className="text-2xl font-black text-gray-900">{route.from_city}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1 text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-700">Dep: {schedule.departure_time ? schedule.departure_time.slice(0, 5) : "N/A"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 flex-1 px-4">
                        <div className="w-full h-px bg-dashed border-t border-dashed border-gray-300 relative">
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                            <ArrowRight className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-4">
                          {route.distance} KM • {route.duration}
                        </span>
                      </div>

                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Destination</p>
                        <h3 className="text-2xl font-black text-gray-900">{route.to_city}</h3>
                        <div className="flex items-center justify-center md:justify-end gap-3 mt-1.5 text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-700">Arr: {schedule.arrival_time ? schedule.arrival_time.slice(0, 5) : "N/A"}</span>
                          </div>
                          <span className="flex items-center gap-0.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-bold text-xs">
                            ₹{schedule.fare || route.total_fare}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Route Quick Info Grid */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-600 rounded-full" />
                      General Route Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
                      {routeDetails.map((item, idx) => (
                        <div key={idx} className={cn("p-3 rounded-xl border border-gray-100 transition-colors bg-white shadow-sm")}>
                          <item.icon className={cn("w-4 h-4 mb-2", item.color)} />
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-gray-900">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Route Stops Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                      Route Stoppages ({route?.stops?.length || 0})
                    </h4>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                      {route?.stops && route.stops.length > 0 ? (
                        route.stops.map((stop: any, idx: number) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-100 hover:border-emerald-250 hover:shadow-sm transition-all group">
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-950 truncate">{stop.stop_name}</p>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span>Arr: {stop.arrival_time || "--:--"}</span>
                                  </div>
                                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <span>Dep: {stop.departure_time || "--:--"}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                                  ₹{stop.fare}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-400 italic">
                          No intermediate stops defined for this route.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bus" className="mt-0 outline-none space-y-6">
                {bus ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Technical Specifications */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-600 rounded-full" />
                        Technical Specifications
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {busDetails.map((item, idx) => (
                          <div key={idx} className={cn("flex items-center gap-3 p-2.5 rounded-lg border border-gray-100/50 bg-white shadow-sm transition-colors")}>
                            <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center", item.color)}>
                              <item.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">{item.label}</p>
                              <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compliance & Amenities */}
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-4 bg-blue-600 rounded-full" />
                          Compliance &amp; Documents
                        </h4>
                        <div className="space-y-3">
                          {busCompliance.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-gray-100 bg-white shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-bold text-gray-900">{item.label}</p>
                                <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1.5 h-4.5">
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
                                    item.valid && isValidDate(item.valid) && new Date(item.valid) < new Date() ? "text-red-500" : "text-emerald-600"
                                  )}>
                                    {formatSafeDate(item.valid)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-1 h-4 bg-blue-600 rounded-full" />
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {bus.amenities?.map((am: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] sm:text-xs">
                              {am}
                            </Badge>
                          )) || <span className="text-xs text-gray-400">No amenities listed</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400 italic">
                    No bus details available for this schedule.
                  </div>
                )}
              </TabsContent>

              <TabsContent value="driver" className="mt-0 outline-none space-y-6">
                {driver ? (
                  <div className="grid grid-cols-1 gap-6">
                    {/* Basic Driver Info */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-600 rounded-full" />
                        Driver Information
                      </h4>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                        {driver.profile_image ? (
                          <img 
                            src={driver.profile_image} 
                            alt={driver.driver_name} 
                            className="w-20 h-20 rounded-full object-cover border-2 border-purple-100 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-purple-50 border-2 border-purple-100 flex items-center justify-center text-purple-600 font-bold text-2xl">
                            {driver.driver_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-center sm:text-left space-y-1.5">
                          <h3 className="text-lg font-bold text-gray-900">{driver.driver_name}</h3>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-bold uppercase shadow-none py-0 px-2 h-5">
                              {driver.experience_years || 0} Years Exp
                            </Badge>
                            <Badge className={cn("text-[10px] font-bold uppercase py-0 px-2 h-5 shadow-none border-transparent",
                              driver.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            )}>
                              {driver.status || 'Active'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {driverDetails.map((item, idx) => (
                          <div key={idx} className={cn("flex items-center gap-3 p-2.5 rounded-lg border border-gray-100/50 bg-white shadow-sm transition-colors")}>
                            <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center", item.color)}>
                              <item.icon className="w-3.5 h-3.5 sm:w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400 leading-none mb-1">{item.label}</p>
                              <p className="text-xs font-semibold text-gray-700 truncate">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400 italic bg-white border border-gray-100 rounded-xl p-6">
                    No driver assigned for this schedule.
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="p-4 border-t bg-gray-50/50 flex flex-row justify-end">
          <Button variant="outline" size="sm" className="h-9" onClick={() => onOpenChange(false)}>
            Close details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════════
   SCHEDULES PAGE - Matching Reference Image
   ═══════════════════════════════════════════════ */
export function SchedulesPage() {
  const [page, setPage] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [journeyDate, setJourneyDate] = useState("");
  const [status, setStatus] = useState("all");
  const [todayOnly, setTodayOnly] = useState(false);
  
  const { data: schedulesResponse, isLoading, isError } = useSchedules(page, {
    journey_date: journeyDate,
    status: status === "all" ? "" : status,
    today_trips: todayOnly ? "true" : "",
  });
  const { data: stats } = useScheduleStats();
  const { mutate: deleteSchedule } = useDeleteSchedule();
  
  const schedules = schedulesResponse?.data || [];
  const meta = schedulesResponse ? {
    current_page: schedulesResponse.current_page,
    last_page: schedulesResponse.last_page,
    per_page: schedulesResponse.per_page,
    total: schedulesResponse.total,
    from: schedulesResponse.from,
    to: schedulesResponse.to
  } : null;

  const dynamicStatCards = [
    {
      title: "Total Schedules",
      amount: stats?.total?.toString() || "0",
      subtitle: "All schedules in system",
      icon: CalendarDays,
      iconBg: "bg-blue-600",
      iconColor: "text-white",
    },
    {
      title: "Active Schedules",
      amount: stats?.active?.toString() || "0",
      subtitle: "Currently running",
      icon: CheckCircle2,
      iconBg: "bg-emerald-600",
      iconColor: "text-white",
    },
    {
      title: "Inactive Schedules",
      amount: stats?.inactive?.toString() || "0",
      subtitle: "Paused or stopped",
      icon: PauseCircle,
      iconBg: "bg-amber-500",
      iconColor: "text-white",
    },
    {
      title: "Today's Trips",
      amount: stats?.today?.toString() || "0",
      subtitle: "Scheduled for today",
      icon: Clock,
      iconBg: "bg-purple-600",
      iconColor: "text-white",
    },
  ];

  const handleExport = async () => {
    try {
      const response = await scheduleService.getAll(1, { 
        export: 'true',
        journey_date: journeyDate,
        status: status === 'all' ? '' : status,
        today_trips: todayOnly ? 'true' : ''
      });
      const rawData = response.data;
      const exportData = Array.isArray(rawData) ? rawData : (rawData.data || []);
      
      if (!exportData || exportData.length === 0) {
        toast({ title: "No data to export", variant: "destructive" });
        return;
      }

      // Create CSV
      const headers = ["Schedule ID", "Bus Name", "Bus Number", "Route", "Journey Date", "Departure Time", "Arrival Time", "Fare", "Status"];
      const csvRows = [headers.join(",")];

      exportData.forEach((s: any) => {
        const row = [
          s.id,
          s.bus ? `"${s.bus.bus_name.replace(/"/g, '""')}"` : "N/A",
          s.bus ? `"${s.bus.bus_number.replace(/"/g, '""')}"` : "N/A",
          s.route ? `"${s.route.from_city} -> ${s.route.to_city}"` : "N/A",
          s.journey_date,
          s.departure_time,
          s.arrival_time,
          s.fare,
          s.status
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `schedules_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Export successful", description: "Your file has been downloaded" });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export schedules data",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      deleteSchedule(id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Schedule deleted successfully" });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to delete schedule",
            variant: "destructive",
          });
        }
      });
    }
  };

  if (isAdding || editingSchedule) {
    return (
      <AddScheduleForm
        onBack={() => {
          setIsAdding(false);
          setEditingSchedule(null);
        }}
        editData={editingSchedule}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {dynamicStatCards.map((card) => (
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Schedule Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 border-gray-200" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        <div className="flex flex-1 items-center gap-2.5 w-full flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Journey Date:</span>
            <Input 
              type="date" 
              value={journeyDate} 
              disabled={todayOnly}
              onChange={(e) => {
                setJourneyDate(e.target.value);
                if (e.target.value) {
                  setTodayOnly(false);
                }
              }} 
              className="h-10 border-gray-200 focus:border-blue-300 max-w-[200px] w-full disabled:opacity-50 disabled:bg-gray-100" 
            />
          </div>
          <Button
            type="button"
            variant={todayOnly ? "default" : "outline"}
            className={cn(
              "h-10 text-xs font-bold px-3 transition-all flex items-center gap-1.5",
              todayOnly 
                ? "bg-purple-600 hover:bg-purple-700 text-white border-transparent shadow-sm"
                : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900"
            )}
            onClick={() => {
              const val = !todayOnly;
              setTodayOnly(val);
              if (val) {
                setJourneyDate("");
              }
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            Today's Trips
          </Button>
        </div>
        <Select value={status} onValueChange={(val) => setStatus(val)}>
          <SelectTrigger className="w-full sm:w-[140px] h-10 border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-10 text-gray-500"
          onClick={() => {
            setJourneyDate("");
            setStatus("all");
            setTodayOnly(false);
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading schedules...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading schedules.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Bus / Route</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Journey Date</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Departure Time</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Arrival Time</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Fare</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No schedules found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule: any) => (
                      <TableRow key={schedule.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Bus className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 leading-tight">{schedule.bus?.bus_name || "Unknown Bus"}</span>
                              <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100/80 w-max">
                                <span>{schedule.route?.from_city || "Unknown Start"}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                                <span>{schedule.route?.to_city || "Unknown End"}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                            <CalendarDays className="w-4 h-4 text-emerald-500" />
                            {schedule.journey_date}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {schedule.departure_time ? schedule.departure_time.slice(0, 5) : ""}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            {schedule.arrival_time ? schedule.arrival_time.slice(0, 5) : ""}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <span className="text-base font-extrabold text-emerald-600">₹{schedule.fare}</span>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase shadow-sm border border-transparent transition-all", 
                            schedule.status === 'scheduled' ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-blue-100/50" : 
                            schedule.status === 'completed' ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-100/50" : 
                            "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-red-100/50"
                          )}>
                            {schedule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-sm transition-all hover:scale-105"
                              onClick={() => setViewingSchedule(schedule)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 shadow-sm transition-all hover:scale-105"
                              onClick={() => setEditingSchedule(schedule)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 shadow-sm transition-all hover:scale-105"
                              onClick={() => handleDelete(schedule.id)}
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
                  Showing <span className="font-medium text-gray-900">{meta.from || 0}</span> to <span className="font-medium text-gray-900">{meta.to || 0}</span> of <span className="font-medium text-gray-900">{meta.total || 0}</span> schedules
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8" disabled={page === 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {[...Array(meta.last_page || 1)].map((_, i) => (
                      <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm" className="w-8 h-8" onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="h-8" disabled={page === meta.last_page} onClick={() => setPage(page + 1)}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <ScheduleViewDialog 
        schedule={viewingSchedule} 
        open={!!viewingSchedule} 
        onOpenChange={(open) => !open && setViewingSchedule(null)} 
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDULES PAGE DETAILED SUB-DIALOGS (MOBILE RESPONSIVE)
   ───────────────────────────────────────────── */
function SchedulesBusViewDialog({ busId, open, onOpenChange }: { busId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: busesResponse } = useBuses({ per_page: 100 });
  const buses = busesResponse?.data || [];
  const bus = buses.find((b: any) => b.id === busId);
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
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
          <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b bg-white sticky top-0 z-10">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Bus className="w-5 h-5 text-blue-600" />
              {bus.bus_name}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Full details and specifications of the vehicle
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="space-y-6 sm:space-y-8">
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
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-600 rounded-full" />
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
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
                                {item.valid ? formatSafeDate(item.valid) : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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

function SchedulesRouteViewDialog({ routeId, open, onOpenChange }: { routeId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: routesResponse } = useRoutes(1, { per_page: 100 });
  const routes = routesResponse?.data || [];
  const route = routes.find((r: any) => r.id === routeId);
  if (!route) return null;

  const mainDetails = [
    { label: "From City", value: route.from_city, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Arrival Time", value: route.from_city_arrival_time || "N/A", icon: Clock, color: "text-blue-500", bg: "bg-blue-50/50" },
    { label: "To City", value: route.to_city, icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Distance", value: `${route.distance} km`, icon: Navigation, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Duration", value: route.duration || "N/A", icon: Timer, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Total Fare", value: `₹${route.total_fare}`, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Road Type", value: route.road_type || "N/A", icon: LayoutGrid, color: "text-slate-600", bg: "bg-slate-50" },
    { label: "Status", value: route.status?.toUpperCase(), icon: CheckCircle2, color: route.status === 'active' ? "text-emerald-600" : "text-red-600", bg: route.status === 'active' ? "bg-emerald-50" : "bg-red-50" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b bg-white">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-600" />
            Route Details
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Full path details and intermediate stoppage information
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Starting Point</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">{route.from_city}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{route.from_city_arrival_time || "Time not set"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-1 px-4 w-full">
                  <div className="w-full h-px bg-dashed border-t border-dashed border-gray-300 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-4">{route.distance} KM • {route.duration}</span>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Destination</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">{route.to_city}</h3>
                  <div className="flex items-center justify-center md:justify-end gap-1.5 mt-1 text-gray-500">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold text-blue-600">₹{route.total_fare}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Quick Info Grid */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  General Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {mainDetails.map((item, idx) => (
                    <div key={idx} className={cn("p-3 rounded-xl border border-gray-100 transition-colors", item.bg)}>
                      <item.icon className={cn("w-4 h-4 mb-2", item.color)} />
                      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider leading-none mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-emerald-600 rounded-full" />
                  Route Stoppages ({route.stops?.length || 0})
                </h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-100">
                  {route.stops && route.stops.length > 0 ? (
                    route.stops.map((stop: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2 border-emerald-500 bg-white shadow-sm z-10" />
                        <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-950 truncate">{stop.stop_name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-505" />
                                <span>Arr: {stop.arrival_time || "--:--"}</span>
                              </div>
                              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Dep: {stop.departure_time || "--:--"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                              ₹{stop.fare}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-gray-400 italic">
                      No intermediate stops defined for this route.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-gray-50/50 flex flex-row justify-end">
          <Button variant="outline" size="sm" className="h-9" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SchedulesDriverViewDialog({ driverId, open, onOpenChange }: { driverId: number | null, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: driversResponse } = useDrivers({ per_page: 100 });
  const drivers = driversResponse?.data || [];
  const driver = drivers.find((d: any) => d.id === driverId);
  if (!driver) return null;

  const details = [
    { label: "Driver Name", value: driver.driver_name, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Phone Number", value: driver.driver_phone, icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Email Address", value: driver.driver_email || "N/A", icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "License Number", value: driver.license_number, icon: FileCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "License Type", value: driver.license_type?.toUpperCase(), icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Experience", value: `${driver.experience_years} Years`, icon: Activity, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Date of Birth", value: driver.dob ? formatSafeDate(driver.dob) : "N/A", icon: CalendarDays, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Gender", value: driver.gender?.charAt(0).toUpperCase() + driver.gender?.slice(1) || "N/A", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Blood Group", value: driver.blood_group?.toUpperCase() || "N/A", icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
    { label: "Joining Date", value: driver.joining_date ? formatSafeDate(driver.joining_date) : "N/A", icon: Calendar, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-none shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 pb-2 border-b bg-white">
          <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Driver Details
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Basic information of the assigned driver
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="space-y-6 sm:space-y-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                {driver.profile_image ? (
                  <img src={driver.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                    {driver.driver_name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{driver.driver_name}</h3>
                  <Badge className={cn("rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider", driver.status === 'active' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                    {driver.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-gray-500 text-sm flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {driver.city}, {driver.state}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {driver.experience_years} Years Experience
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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

              {/* Emergency Contact & Address */}
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
        </div>

        <DialogFooter className="p-4 border-t bg-gray-50/50 flex flex-row justify-end">
          <Button variant="outline" size="sm" className="h-9" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
