"use client";

import React, { useState } from "react";
import {
  Route,
  CheckCircle2,
  TrendingUp,
  PauseCircle,
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
  Clock,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Info,
  IndianRupee,
  Ban,
  Power,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavStore } from "@/lib/nav-store";
import { useRoutes, useCreateRoute, useUpdateRoute, useDeleteRoute } from "@/hooks/use-routes";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Navigation, Timer, LayoutGrid } from "lucide-react";

/* ─────────────────────────────────────────────
   ROUTE VIEW DIALOG
   ───────────────────────────────────────────── */
function RouteViewDialog({ route, open, onOpenChange }: { route: any, open: boolean, onOpenChange: (open: boolean) => void }) {
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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-600" />
            Route Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-6 max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Starting Point</p>
                  <h3 className="text-2xl font-black text-gray-900">{route.from_city}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 mt-1 text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">{route.from_city_arrival_time || "Time not set"}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 flex-1 px-4">
                  <div className="w-full h-px bg-dashed border-t border-dashed border-gray-300 relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase mt-4">{route.distance} KM • {route.duration}</span>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Destination</p>
                  <h3 className="text-2xl font-black text-gray-900">{route.to_city}</h3>
                  <div className="flex items-center justify-center md:justify-end gap-1.5 mt-1 text-gray-500">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold text-blue-600">₹{route.total_fare}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
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
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
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
   ADD/EDIT ROUTE FORM
   ───────────────────────────────────────────── */
function AddRouteForm({ onBack, editData }: { onBack: () => void, editData?: any }) {
  const { setCustomHeader } = useNavStore();
  const { mutate: createRoute, isPending: isCreating } = useCreateRoute();
  const { mutate: updateRoute, isPending: isUpdating } = useUpdateRoute();
  const isPending = isCreating || isUpdating;

  const [formData, setFormData] = useState({
    fromCity: editData?.from_city || "",
    fromCityArrivalTime: editData?.from_city_arrival_time || "",
    toCity: editData?.to_city || "",
    distance: editData?.distance || "",
    duration: editData?.duration || "",
    totalFare: editData?.total_fare || "",
    roadType: editData?.road_type || "Highway",
    status: editData?.status || "active",
  });

  const [stops, setStops] = useState<any[]>(
    editData?.stops?.map((s: any) => ({
      stop_name: s.stop_name,
      arrival_time: s.arrival_time,
      departure_time: s.departure_time || "",
      fare: s.fare.toString(),
    })) || []
  );

  const addStop = () => {
    setStops([...stops, { stop_name: "", arrival_time: "", departure_time: "", fare: "" }]);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: string, value: string) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setStops(newStops);
  };

  React.useEffect(() => {
    setCustomHeader(
      editData ? "Edit Route" : "Add New Route",
      [
        { label: "Home", isActive: false },
        { label: "Routes", isActive: false },
        { label: editData ? "Edit Route" : "Add New Route", isActive: true },
      ],
      true
    );
    return () => setCustomHeader(null, null, false);
  }, [setCustomHeader, editData]);

  const handleSave = () => {
    if (!formData.fromCity || !formData.toCity) {
      toast({
        title: "Required Fields",
        description: "From City and To City are mandatory",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      from_city: formData.fromCity,
      from_city_arrival_time: formData.fromCityArrivalTime,
      to_city: formData.toCity,
      distance: formData.distance,
      duration: formData.duration,
      total_fare: formData.totalFare,
      road_type: formData.roadType,
      status: formData.status,
      stops: stops.map(s => ({
        stop_name: s.stop_name,
        arrival_time: s.arrival_time,
        departure_time: s.departure_time,
        fare: parseFloat(s.fare) || 0,
      })),
    };

    if (editData) {
      updateRoute({ id: editData.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Route updated successfully" });
          onBack();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to update route",
            variant: "destructive",
          });
        }
      });
    } else {
      createRoute(payload, {
        onSuccess: () => {
          toast({ title: "Success", description: "Route added successfully" });
          onBack();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to add route",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{editData ? "Edit Route" : "Add New Route"}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <HomeIcon className="w-3.5 h-3.5 text-gray-400" />
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Home</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Routes</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 font-medium">{editData ? "Edit Route" : "Add New Route"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <Button size="sm" className="h-10 bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isPending}>
            <Save className="w-4 h-4 mr-1.5" /> {isPending ? "Saving..." : "Save Route"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="From City" required helperText="Starting point of the route">
            <Input
              placeholder="e.g. Delhi"
              value={formData.fromCity}
              onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>
          <FormField label="From City Arrival Time" helperText="Bus arrival time at starting city">
            <div className="relative">
              <Input
                type="time"
                value={formData.fromCityArrivalTime}
                onChange={(e) => setFormData({ ...formData, fromCityArrivalTime: e.target.value })}
                className="h-11 pl-10 border-gray-200 focus:border-blue-300"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </FormField>
          <FormField label="To City" required helperText="Destination point of the route">
            <Input
              placeholder="e.g. Jaipur"
              value={formData.toCity}
              onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>
          <FormField label="Distance (km)" helperText="Total distance in kilometers">
            <Input
              type="number"
              placeholder="e.g. 280"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>
          <FormField label="Estimated Duration" helperText="e.g. 5h 30m">
            <Input
              placeholder="e.g. 5h 30m"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="h-11 border-gray-200 focus:border-blue-300"
            />
          </FormField>
          <FormField label="Total Fare (Optional)" helperText="Auto-calculated from last stop if 0">
            <div className="relative">
              <Input
                type="number"
                placeholder="Auto-calculated"
                value={formData.totalFare}
                onChange={(e) => setFormData({ ...formData, totalFare: e.target.value })}
                className="h-11 pl-10 border-gray-200 focus:border-blue-300"
              />
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </FormField>
          <FormField label="Road Type" helperText="Type of terrain for this route">
            <Select
              value={formData.roadType}
              onValueChange={(val) => setFormData({ ...formData, roadType: val })}
            >
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select road type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Highway">Highway</SelectItem>
                <SelectItem value="Hilly">Hilly</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* Stops Management Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-900">Stops Management (Boarding Points)</h3>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="h-9 border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={addStop}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Stop
          </Button>
        </div>

        <div className="p-6">
          {stops.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No stops added yet. Click "Add Stop" to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop, index) => (
                <div key={index} className="flex flex-col md:flex-row items-end gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 relative group">
                  <div className="flex-1 w-full">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Stop Name</Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. Kashmiri Gate"
                        value={stop.stop_name}
                        onChange={(e) => updateStop(index, 'stop_name', e.target.value)}
                        className="h-10 pl-9 border-gray-200 focus:border-blue-300 bg-white"
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-36">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Arrival Time</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={stop.arrival_time}
                        onChange={(e) => updateStop(index, 'arrival_time', e.target.value)}
                        className="h-10 pl-9 border-gray-200 focus:border-blue-300 bg-white"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="w-full md:w-36">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Departure Time</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={stop.departure_time}
                        onChange={(e) => updateStop(index, 'departure_time', e.target.value)}
                        className="h-10 pl-9 border-gray-200 focus:border-blue-300 bg-white"
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="w-full md:w-32">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Ticket Fare</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={stop.fare}
                        onChange={(e) => updateStop(index, 'fare', e.target.value)}
                        className="h-10 pl-9 border-gray-200 focus:border-blue-300 bg-white"
                      />
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                    onClick={() => removeStop(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Stops will be ordered automatically in the sequence they are added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARDS DATA (matching reference)
   ───────────────────────────────────────────── */
const statCardsConfig = [
  {
    key: "total",
    title: "Total Routes",
    subtitle: "All routes in system",
    icon: Route,
    iconBg: "bg-blue-600",
    iconColor: "text-white",
  },
  {
    key: "active",
    title: "Active Routes",
    subtitle: "Currently operational",
    icon: CheckCircle2,
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
  },
  {
    key: "inactive",
    title: "Inactive Routes",
    subtitle: "Not in operation",
    icon: PauseCircle,
    iconBg: "bg-amber-500",
    iconColor: "text-white",
  },
];

const routeTypeStyles: Record<string, string> = {
  Intercity: "bg-blue-50 text-blue-700 border-blue-200",
  Intracity: "bg-purple-50 text-purple-700 border-purple-200",
  "Hill Route": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500 text-white",
  Inactive: "bg-red-500 text-white",
};

/* ═══════════════════════════════════════════════
   ROUTES PAGE - Matching Reference Image
   ═══════════════════════════════════════════════ */
export function RoutesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [editingRoute, setEditingRoute] = useState<any>(null);
  const [viewingRoute, setViewingRoute] = useState<any>(null);

  const { data: routesResponse, isLoading, isError } = useRoutes(page, { search, status });
  const { mutate: deleteRoute } = useDeleteRoute();
  const { mutate: updateRoute } = useUpdateRoute();
  
  const routes = routesResponse?.data || [];
  const meta = routesResponse?.meta;
  const stats = routesResponse?.stats;

  const handleExport = () => {
    if (routes.length === 0) return;
    
    const headers = ["ID", "From City", "Arrival Time", "To City", "Distance", "Total Fare", "Status"];
    const csvData = routes.map((r: any) => [
      r.id,
      r.from_city,
      r.from_city_arrival_time || "N/A",
      r.to_city,
      `${r.distance} km`,
      r.total_fare,
      r.status
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `routes_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  const handleToggleStatus = (route: any) => {
    const newStatus = route.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';

    if (window.confirm(`Are you sure you want to ${actionText} this route?`)) {
      updateRoute({ 
        id: route.id, 
        data: { status: newStatus } 
      }, {
        onSuccess: () => {
          toast({ 
            title: "Success", 
            description: `Route ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully` 
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || `Failed to ${actionText} route`,
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleDeleteRoute = (id: number) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      deleteRoute(id, {
        onSuccess: () => {
          toast({ title: "Success", description: "Route deleted successfully" });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to delete route",
            variant: "destructive",
          });
        }
      });
    }
  };

  if (isAdding || editingRoute) {
    return (
      <AddRouteForm
        onBack={() => {
          setIsAdding(false);
          setEditingRoute(null);
        }}
        editData={editingRoute}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {statCardsConfig.map((card) => {
          const IconComponent = card.icon;
          const amount = stats ? stats[card.key] : "0";
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
                    {amount}
                  </p>
                  <p className="text-xs text-gray-400">{card.subtitle}</p>
                </div>
                <div
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0",
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

      {/* ── Action Buttons Row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Route Management</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            size="sm"
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Route
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search routes..."
            className="h-10 pl-9 border-gray-200 focus:border-blue-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select 
          value={status} 
          onValueChange={(val) => setStatus(val)}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white border-gray-200">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-sm text-gray-500 hover:text-gray-700"
          onClick={resetFilters}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </Button>
      </div>

      {/* ── Routes Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading routes...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading routes.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">From City</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Arrival Time</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">To City</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Distance</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Total Fare</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase py-3.5 px-4 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.length === 0 ? (                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500 italic">
                        No routes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes.map((route: any) => (
                      <TableRow key={route.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-900">{route.from_city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {route.from_city_arrival_time || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-900">{route.to_city}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <Badge className="font-mono bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm">
                            {route.distance} km
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-blue-600 font-bold">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {route.total_fare}
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border-0", route.status === 'active' ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                            {route.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => setViewingRoute(route)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-amber-600 hover:bg-amber-50"
                              onClick={() => setEditingRoute(route)}
                             >
                               <Pencil className="w-4 h-4" />
                             </Button>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className={cn(
                                 "w-8 h-8",
                                 route.status === 'active' ? "text-slate-500 hover:bg-slate-50" : "text-emerald-600 hover:bg-emerald-50"
                               )}
                               onClick={() => handleToggleStatus(route)}
                               title={route.status === 'active' ? "Deactivate Route" : "Activate Route"}
                             >
                               {route.status === 'active' ? <Ban className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                             </Button>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="w-8 h-8 text-red-600 hover:bg-red-50"
                               onClick={() => handleDeleteRoute(route.id)}
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
                  Showing <span className="font-medium text-gray-900">{meta.from || 0}</span> to <span className="font-medium text-gray-900">{meta.to || 0}</span> of <span className="font-medium text-gray-900">{meta.total || 0}</span> routes
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

      <RouteViewDialog 
        route={viewingRoute} 
        open={!!viewingRoute} 
        onOpenChange={(open) => !open && setViewingRoute(null)} 
      />
    </div>
  );
}
