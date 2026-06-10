"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bus,
  CheckCircle2,
  Wrench,
  PowerOff,
  Plus,
  Download,
  SlidersHorizontal,
  Search,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Save,
  UploadCloud,
  Info,
  X,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  MapPin,
  Users,
  Snowflake,
  Wind,
  Settings,
  ShieldCheck,
  Fuel,
  Settings2,
  FileText,
  Clock,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar as CalendarComponent,
} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getImageUrl } from "@/lib/utils";
import { useNavStore } from "@/lib/nav-store";
import { useBuses, useCreateBus, useUpdateBus, useDeleteBus, useBusStats } from "@/hooks/use-buses";
import { busService } from "@/services/bus.service";
import { toast } from "@/hooks/use-toast";
import { SeatLayoutGeneratorService } from "@/services/seat-layout-generator.service";
import { motion, AnimatePresence } from "framer-motion";



/* ─────────────────────────────────────────────
   TABLE DATA (matching reference)
   ───────────────────────────────────────────── */
interface BusRecord {
  id: number;
  busNumber: string;
  busName: string;
  busLayout: string;
  acType: "AC" | "Non AC";
  busType: "AC Seater" | "AC Sleeper" | "Non AC Seater";
  seats: number;
  operator: string;
  status: "Active" | "Maintenance" | "Inactive";
  image: string;
}

const busesData: BusRecord[] = [
  {
    id: 1,
    busNumber: "RJ 14 PA 1234",
    busName: "Volvo AC Seater",
    busLayout: "2x2 Seater",
    acType: "AC",
    busType: "AC Seater",
    seats: 45,
    operator: "Sharma Travels",
    status: "Active",
    image: "/bus-1.png",
  },
  {
    id: 2,
    busNumber: "GJ 01 AB 5678",
    busName: "Bharat Benz Sleeper",
    busLayout: "Sleeper 2+1",
    acType: "AC",
    busType: "AC Sleeper",
    seats: 36,
    operator: "Patel Bus Service",
    status: "Active",
    image: "/bus-2.png",
  },
  {
    id: 3,
    busNumber: "MP 09 BC 9101",
    busName: "Tata Non AC Seater",
    busLayout: "2x2 Seater",
    acType: "Non AC",
    busType: "Non AC Seater",
    seats: 52,
    operator: "Madhya Travels",
    status: "Active",
    image: "/bus-3.png",
  },
  {
    id: 4,
    busNumber: "KA 51 ZZ 2222",
    busName: "Scania Multi Axle",
    busLayout: "Sleeper 2+1",
    acType: "AC",
    busType: "AC Sleeper",
    seats: 40,
    operator: "Karnataka Express",
    status: "Maintenance",
    image: "/bus-4.png",
  },
  {
    id: 5,
    busNumber: "UP 78 DT 3333",
    busName: "Ashok Leyland Seater",
    busLayout: "2x2 Seater",
    acType: "Non AC",
    busType: "Non AC Seater",
    seats: 50,
    operator: "UP State Transports",
    status: "Inactive",
    image: "/bus-5.png",
  },
  {
    id: 6,
    busNumber: "MH 12 KL 4444",
    busName: "Volvo B11R Sleeper",
    busLayout: "Sleeper 2+1",
    acType: "AC",
    busType: "AC Sleeper",
    seats: 38,
    operator: "Maharashtra Travels",
    status: "Active",
    image: "/bus-6.png",
  },
  {
    id: 7,
    busNumber: "RJ 19 TA 5555",
    busName: "Force Traveller",
    busLayout: "2x2 Seater",
    acType: "Non AC",
    busType: "Non AC Seater",
    seats: 42,
    operator: "Rajasthan Roadways",
    status: "Inactive",
    image: "/bus-7.png",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500 text-white",
  Maintenance: "bg-amber-500 text-white",
  "Off Duty": "bg-sky-500 text-white",
  Inactive: "bg-red-500 text-white",
};

const busTypeStyles: Record<string, string> = {
  "AC Seater": "text-sky-600",
  "AC Sleeper": "text-purple-600",
  "Non-AC": "text-gray-600",
  "ac-seater": "text-sky-600",
  "ac-sleeper": "text-purple-600",
  "non-ac": "text-gray-600",
};

/* ─────────────────────────────────────────────
   FORM FIELD COMPONENT
   ───────────────────────────────────────────── */
function FormField({
  label,
  required,
  children,
  helperText,
}: {
  label: React.ReactNode;
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
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />
          {helperText}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DATE PICKER COMPONENT
   ───────────────────────────────────────────── */
function DatePickerField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-left font-normal hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300",
            !value && "text-gray-400"
          )}
        >
          <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
          {value ? format(value, "dd/MM/yyyy") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* ─────────────────────────────────────────────
   BUS DETAILS VIEW DIALOG
   ───────────────────────────────────────────── */
function BusViewDialog({ bus, open, onOpenChange }: { bus: any, open: boolean, onOpenChange: (open: boolean) => void }) {
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
            {/* Images Grid */}
            {bus.images && bus.images.length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Vehicle Photos
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {(Array.isArray(bus.images) ? bus.images : (typeof bus.images === 'string' ? JSON.parse(bus.images) : [])).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
                      <img 
                        src={getImageUrl(img, bus.id)} 
                        alt="Bus" 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.dataset?.fallbackTried) { target.src = "/bus-1.png"; return; }
                          target.dataset.fallbackTried = "1";
                          const apiUrl = import.meta.env.VITE_API_BASE_URL;
                          if (apiUrl && !img.startsWith('http')) {
                            const storageUrl = apiUrl.replace(/\/api\/?$/, '/storage');
                            target.src = `${storageUrl}/${img.startsWith('/') ? img.substring(1) : img}`;
                            return;
                          }
                          target.src = "/bus-1.png";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Technical Specifications */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4">
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

              {/* Compliance & Documents */}
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
                              {item.valid ? format(new Date(item.valid), "dd MMM, yyyy") : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
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

/* ═══════════════════════════════════════════════
   ADD NEW BUS FORM - Pixel Perfect
   ═══════════════════════════════════════════════ */
function AddBusForm({ onCancel, editData }: { onCancel: () => void, editData?: any }) {
  const [registrationDate, setRegistrationDate] = useState<Date | undefined>(
    editData?.registration_date ? new Date(editData.registration_date) : undefined
  );
  const [manufacturingYear, setManufacturingYear] = useState<Date | undefined>(
    editData?.manufacturing_year ? new Date(editData.manufacturing_year, 0, 1) : undefined
  );
  const [insuranceValidTill, setInsuranceValidTill] = useState<Date | undefined>(
    editData?.insurance_valid_till ? new Date(editData.insurance_valid_till) : undefined
  );
  const [fitnessValidTill, setFitnessValidTill] = useState<Date | undefined>(
    editData?.fitness_valid_till ? new Date(editData.fitness_valid_till) : undefined
  );
  const [pucValidTill, setPucValidTill] = useState<Date | undefined>(
    editData?.puc_valid_till ? new Date(editData.puc_valid_till) : undefined
  );
  
  // Select states
  const [busType, setBusType] = useState<string>(editData?.bus_type || "");
  const [busCategory, setBusCategory] = useState<string>(editData?.bus_category || "");
  const [amenities, setAmenities] = useState<string[]>(editData?.amenities || []);
  const [manufacturer, setManufacturer] = useState<string>(editData?.manufacturer || "");
  const [fuelType, setFuelType] = useState<string>(editData?.fuel_type || "");
  const [emissionNorms, setEmissionNorms] = useState<string>(editData?.emission_norms || "");
  const [bodyType, setBodyType] = useState<string>(editData?.body_type || "");
  const [transmissionType, setTransmissionType] = useState<string>(editData?.transmission_type || "");
  const [busStatus, setBusStatus] = useState<string>(editData?.status || "");
  const [operator, setOperator] = useState<string>(editData?.operator || "Bhinder Bus Service");

  // Layout parameters states
  const [layoutType, setLayoutType] = useState<string>(editData?.layout_type || "2+3 Sleeper");
  const [totalSeats, setTotalSeats] = useState<number>(editData?.total_seats ? Number(editData.total_seats) : 52);
  const [lastRowSeats, setLastRowSeats] = useState<number>(editData?.last_row_seats ? Number(editData.last_row_seats) : 6);
  const [leftSeatsPerRow, setLeftSeatsPerRow] = useState<number>(editData?.left_seats_per_row ? Number(editData.left_seats_per_row) : 2);
  const [rightSeatsPerRow, setRightSeatsPerRow] = useState<number>(editData?.right_seats_per_row ? Number(editData.right_seats_per_row) : 3);
  
  // Preview modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Validation errors
  const [layoutErrors, setLayoutErrors] = useState<{
    totalSeats?: string;
    lastRowSeats?: string;
    leftSeatsPerRow?: string;
    rightSeatsPerRow?: string;
  }>({});

  const validateLayout = (): boolean => {
    const errors: typeof layoutErrors = {};
    let isValid = true;

    if (!totalSeats || totalSeats <= 0) {
      errors.totalSeats = "Total seats must be greater than 0.";
      isValid = false;
    }
    if (!lastRowSeats || lastRowSeats <= 0) {
      errors.lastRowSeats = "Last row seats must be greater than 0.";
      isValid = false;
    }
    if (totalSeats && lastRowSeats && totalSeats < lastRowSeats) {
      errors.totalSeats = "Total seats cannot be less than last row seats.";
      isValid = false;
    }

    if (layoutType === "Custom Layout") {
      if (!leftSeatsPerRow || leftSeatsPerRow <= 0) {
        errors.leftSeatsPerRow = "Left seats per row must be greater than 0.";
        isValid = false;
      }
      if (!rightSeatsPerRow || rightSeatsPerRow <= 0) {
        errors.rightSeatsPerRow = "Right seats per row must be greater than 0.";
        isValid = false;
      }
    }

    setLayoutErrors(errors);
    
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: Object.values(errors).find(e => e) || "Please check layout fields.",
        variant: "destructive",
      });
    }
    
    return isValid;
  };

  const handleViewLayout = () => {
    if (validateLayout()) {
      setIsPreviewOpen(true);
    }
  };

  // Image state
  const selectedFilesRef = useRef<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keepImagePaths, setKeepImagePaths] = useState<string[]>([]);
  
  // Sync previews when editData changes (editing different bus)
  useEffect(() => {
    if (!editData?.images) {
      setPreviews([]);
      setKeepImagePaths([]);
      selectedFilesRef.current = [];
      return;
    }
    const imgs = typeof editData.images === 'string' ? JSON.parse(editData.images) : editData.images;
    const imgArr = Array.isArray(imgs) ? imgs : [imgs];
    const urls = imgArr.map((img: string) => getImageUrl(img));
    // Extract relative paths from full URLs for the backend
    const rawPaths = imgArr.map((img: string) => {
      if (img.startsWith('http://') || img.startsWith('https://')) {
        try {
          const u = new URL(img);
          const match = u.pathname.match(/\/storage\/(.+)/);
          if (match) return match[1];
        } catch {}
      }
      return img;
    });
    setPreviews(urls);
    setKeepImagePaths(rawPaths);
    selectedFilesRef.current = [];
  }, [editData?.id, editData?.images]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createBus, isPending: isCreating } = useCreateBus();
  const { mutate: updateBus, isPending: isUpdating } = useUpdateBus(editData?.id);
  const isPending = isCreating || isUpdating;

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previews.length > 5) {
      toast({
        title: "Limit exceeded",
        description: "You can only upload up to 5 images",
        variant: "destructive",
      });
      return;
    }

    selectedFilesRef.current = [...selectedFilesRef.current, ...files];

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const existingCount = keepImagePaths.length;
    if (index >= existingCount) {
      const newFilesIndex = index - existingCount;
      const newFiles = [...selectedFilesRef.current];
      newFiles.splice(newFilesIndex, 1);
      selectedFilesRef.current = newFiles;
    } else {
      const newKeep = [...keepImagePaths];
      newKeep.splice(index, 1);
      setKeepImagePaths(newKeep);
    }

    const newPreviews = [...previews];
    if (newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSave = async (e: React.FormEvent) => {
    const formElement = document.getElementById('add-bus-form') as HTMLFormElement;
    if (!formElement) return;

    if (!validateLayout()) return;

    const formData = new FormData(formElement);
    
    // Add select values manually
    formData.append('bus_type', busType);
    formData.append('bus_category', busCategory);
    formData.append('manufacturer', manufacturer);
    formData.append('fuel_type', fuelType);
    formData.append('emission_norms', emissionNorms);
    formData.append('body_type', bodyType);
    formData.append('transmission_type', transmissionType);
    formData.append('status', busStatus);
    formData.append('operator', operator);

    // Add layout values manually
    formData.set('total_seats', totalSeats.toString());
    formData.set('layout_type', layoutType);
    formData.set('last_row_seats', lastRowSeats.toString());
    if (layoutType === "Custom Layout") {
      formData.set('left_seats_per_row', leftSeatsPerRow.toString());
      formData.set('right_seats_per_row', rightSeatsPerRow.toString());
    } else {
      formData.delete('left_seats_per_row');
      formData.delete('right_seats_per_row');
    }

    // Add amenities as array
    formData.delete('amenities[]'); // Clear existing if any
    amenities.forEach(item => {
      formData.append('amenities[]', item);
    });
    
    // Add dates manually as they are managed by state
    if (registrationDate) formData.append('registration_date', registrationDate.toISOString());
    if (manufacturingYear) formData.append('manufacturing_year', manufacturingYear.getFullYear().toString());
    if (insuranceValidTill) formData.append('insurance_valid_till', insuranceValidTill.toISOString());
    if (fitnessValidTill) formData.append('fitness_valid_till', fitnessValidTill.toISOString());
    if (pucValidTill) formData.append('puc_valid_till', pucValidTill.toISOString());

    // Add images
    selectedFilesRef.current.forEach((file) => {
      formData.append('images[]', file);
    });
    // Send which existing images to keep (for edit mode)
    keepImagePaths.forEach((path) => {
      formData.append('keep_images[]', path);
    });

    if (editData) {
      formData.append('id', editData.id.toString());
      // For Laravel PUT with FormData, we often need to spoof the method
      formData.append('_method', 'PUT');
      updateBus(formData, {
        onSuccess: () => {
          toast({ title: "Success", description: "Bus updated successfully" });
          onCancel();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to update bus",
            variant: "destructive",
          });
        }
      });
    } else {
      createBus(formData, {
        onSuccess: () => {
          toast({ title: "Success", description: "Bus added successfully" });
          onCancel();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to add bus",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <form id="add-bus-form" onSubmit={(e) => { e.preventDefault(); handleSave(e); }}>
      {/* ── Form Header: Title + Breadcrumb + Action Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {editData ? "Edit Bus" : "Add New Bus"}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <HomeIcon className="w-3.5 h-3.5 text-gray-400" />
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Home</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-blue-600 font-medium">Buses</span>
            <ChevronRightIcon className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-500 font-medium">{editData ? "Edit Bus" : "Add New Bus"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
            onClick={onCancel}
          >
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="h-9 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isPending ? "Saving..." : editData ? "Update Bus" : "Save Bus"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
      {/* ── Section 1: Basic Information ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">
          <FormField label="Bus Name" required>
            <Input name="bus_name" defaultValue={editData?.bus_name} placeholder="Enter bus name" className="h-10 text-sm border-gray-200 focus:border-blue-300" required />
          </FormField>
          <FormField label="Bus Number" required helperText="e.g. RJ 14 PA 1234">
            <Input name="bus_number" defaultValue={editData?.bus_number} placeholder="Enter bus number" className="h-10 text-sm border-gray-200 focus:border-blue-300" required />
          </FormField>
          <FormField label="Bus Type" required>
            <Select value={busType} onValueChange={setBusType}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select bus type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ac-sleeper">AC Sleeper</SelectItem>
                <SelectItem value="ac-seater">AC Seater</SelectItem>
                <SelectItem value="non-ac">Non-AC</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Layout Type" required>
            <Select value={layoutType} onValueChange={(val) => {
              setLayoutType(val);
              // Dynamic adjustments/defaults for specific types if desired
              if (val === "2+3 Sleeper") {
                setLastRowSeats(6);
              } else if (val === "2+2 Seater") {
                setLastRowSeats(6);
              } else if (val === "2+1 Luxury") {
                setLastRowSeats(5);
              } else if (val === "1+2 Sleeper") {
                setLastRowSeats(5);
              }
            }}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select layout type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2+3 Sleeper">🚍 2+3 Sleeper</SelectItem>
                <SelectItem value="2+2 Seater">🚌 2+2 Seater</SelectItem>
                <SelectItem value="2+1 Luxury">✨ 2+1 Luxury</SelectItem>
                <SelectItem value="1+2 Sleeper">🛏️ 1+2 Sleeper</SelectItem>
                <SelectItem value="Custom Layout">⚙️ Custom Layout</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Total Seats" required helperText="e.g. 52">
            <Input 
              name="total_seats" 
              value={totalSeats} 
              type="number" 
              onChange={(e) => {
                const val = Number(e.target.value);
                setTotalSeats(val);
                if (val > 0) {
                  setLayoutErrors(prev => ({ ...prev, totalSeats: undefined }));
                }
              }} 
              placeholder="Enter total seats" 
              className={cn("h-10 text-sm border-gray-200 focus:border-blue-300", layoutErrors.totalSeats && "border-red-500")} 
              required 
            />
            {layoutErrors.totalSeats && (
              <p className="text-xs text-red-500 font-medium mt-1">{layoutErrors.totalSeats}</p>
            )}
          </FormField>
          <FormField label="Last Row Seats" required helperText="e.g. 6">
            <Input 
              name="last_row_seats" 
              value={lastRowSeats} 
              type="number" 
              onChange={(e) => {
                const val = Number(e.target.value);
                setLastRowSeats(val);
                if (val > 0) {
                  setLayoutErrors(prev => ({ ...prev, lastRowSeats: undefined }));
                }
              }} 
              placeholder="Enter last row seats" 
              className={cn("h-10 text-sm border-gray-200 focus:border-blue-300", layoutErrors.lastRowSeats && "border-red-500")} 
              required 
            />
            {layoutErrors.lastRowSeats && (
              <p className="text-xs text-red-500 font-medium mt-1">{layoutErrors.lastRowSeats}</p>
            )}
          </FormField>
          {layoutType === "Custom Layout" && (
            <>
              <FormField label="Left Seats Per Row" required helperText="e.g. 2">
                <Input 
                  name="left_seats_per_row" 
                  value={leftSeatsPerRow} 
                  type="number" 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLeftSeatsPerRow(val);
                    if (val > 0) {
                      setLayoutErrors(prev => ({ ...prev, leftSeatsPerRow: undefined }));
                    }
                  }} 
                  placeholder="Enter left seats per row" 
                  className={cn("h-10 text-sm border-gray-200 focus:border-blue-300", layoutErrors.leftSeatsPerRow && "border-red-500")} 
                  required 
                />
                {layoutErrors.leftSeatsPerRow && (
                  <p className="text-xs text-red-500 font-medium mt-1">{layoutErrors.leftSeatsPerRow}</p>
                )}
              </FormField>
              <FormField label="Right Seats Per Row" required helperText="e.g. 3">
                <Input 
                  name="right_seats_per_row" 
                  value={rightSeatsPerRow} 
                  type="number" 
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRightSeatsPerRow(val);
                    if (val > 0) {
                      setLayoutErrors(prev => ({ ...prev, rightSeatsPerRow: undefined }));
                    }
                  }} 
                  placeholder="Enter right seats per row" 
                  className={cn("h-10 text-sm border-gray-200 focus:border-blue-300", layoutErrors.rightSeatsPerRow && "border-red-500")} 
                  required 
                />
                {layoutErrors.rightSeatsPerRow && (
                  <p className="text-xs text-red-500 font-medium mt-1">{layoutErrors.rightSeatsPerRow}</p>
                )}
              </FormField>
            </>
          )}
          <div className="flex items-end pb-2">
            <Button
              type="button"
              onClick={handleViewLayout}
              className="h-10 w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-md shadow-sm transition-all"
            >
              View Layout
            </Button>
          </div>
          <FormField label="Bus Category">
            <Select value={busCategory} onValueChange={setBusCategory}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Amenities" helperText="You can select multiple amenities">
            <div className="space-y-2">
              <Select onValueChange={(val) => setAmenities(prev => prev.includes(val) ? prev.filter(a => a !== val) : [...prev, val])}>
                <SelectTrigger className="h-10 text-sm border-gray-200">
                  <SelectValue placeholder="Select amenities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WiFi">WiFi</SelectItem>
                  <SelectItem value="Charging Point">Charging Point</SelectItem>
                  <SelectItem value="Blanket">Blanket</SelectItem>
                  <SelectItem value="Water Bottle">Water Bottle</SelectItem>
                  <SelectItem value="Snacks">Snacks</SelectItem>
                  <SelectItem value="TV/Entertainment">TV/Entertainment</SelectItem>
                </SelectContent>
              </Select>
              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {amenities.map((item) => (
                    <Badge 
                      key={item} 
                      variant="secondary" 
                      className="bg-blue-50 text-blue-600 border-blue-100 px-2 py-0.5 text-[11px] flex items-center gap-1"
                    >
                      {item}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-blue-800" 
                        onClick={() => setAmenities(prev => prev.filter(a => a !== item))}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FormField>
          <FormField label={<span>Chassis Number <span className="text-[10px] text-gray-400 font-normal">(Vehicle ID Number)</span></span>}>
            <Input name="chassis_number" defaultValue={editData?.chassis_number} placeholder="Enter chassis number" className="h-10 text-sm border-gray-200 focus:border-blue-300" />
          </FormField>
          <FormField label="Registration Date">
            <DatePickerField
              placeholder="Select date"
              value={registrationDate}
              onChange={setRegistrationDate}
            />
          </FormField>
        </div>
      </div>

      {/* ── Section 2: Bus Details ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          Bus Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">
          <FormField label="Manufacturer" required helperText="e.g. Volvo, Tata, Ashok Leyland">
            <Select value={manufacturer} onValueChange={setManufacturer}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select manufacturer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volvo">Volvo</SelectItem>
                <SelectItem value="tata">Tata Motors</SelectItem>
                <SelectItem value="ashok-leyland">Ashok Leyland</SelectItem>
                <SelectItem value="bharat-benz">BharatBenz</SelectItem>
                <SelectItem value="eicher">Eicher</SelectItem>
                <SelectItem value="scania">Scania</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Model" required helperText="e.g. B11R, AC Sleeper">
            <Input name="model" defaultValue={editData?.model} placeholder="Enter model name" className="h-10 text-sm border-gray-200 focus:border-blue-300" required />
          </FormField>
          <FormField label="Year of Manufacturing" required>
            <DatePickerField
              placeholder="Select year"
              value={manufacturingYear}
              onChange={setManufacturingYear}
            />
          </FormField>
          <FormField label="Fuel Type" required>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="petrol">Petrol</SelectItem>
                <SelectItem value="cng">CNG</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Engine Number">
            <Input name="engine_number" defaultValue={editData?.engine_number} placeholder="Enter engine number" className="h-10 text-sm border-gray-200 focus:border-blue-300" />
          </FormField>
          <FormField label={<span>Emission Norms <span className="text-[10px] text-gray-400 font-normal">(Emission Standard Type)</span></span>}>
            <Select value={emissionNorms} onValueChange={setEmissionNorms}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select emission norms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BS-III">BS-III</SelectItem>
                <SelectItem value="BS-IV">BS-IV</SelectItem>
                <SelectItem value="BS-VI">BS-VI</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Body Type">
            <Select value={bodyType} onValueChange={setBodyType}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fully Built">Fully Built</SelectItem>
                <SelectItem value="Semi Sleeper">Semi Sleeper</SelectItem>
                <SelectItem value="Sleeper">Sleeper</SelectItem>
                <SelectItem value="Seater">Seater</SelectItem>
                <SelectItem value="Luxury Coach">Luxury Coach</SelectItem>
                <SelectItem value="Mini Bus">Mini Bus</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={<span>Transmission Type <span className="text-[10px] text-gray-400 font-normal">(Gear System Type)</span></span>}>
            <Select value={transmissionType} onValueChange={setTransmissionType}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select transmission type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="amt">AMT</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </div>

      {/* ── Section 3: Operator & Status ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">
          Operator &amp; Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">
          <FormField label="Operator" required>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger className="h-10 text-sm border-gray-200 bg-gray-50">
                <SelectValue placeholder="Bhinder Bus Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bhinder Bus Service">Bhinder Bus Service</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Bus Status" required>
            <Select value={busStatus} onValueChange={setBusStatus}>
              <SelectTrigger className="h-10 text-sm border-gray-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Off Duty">Off Duty</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Insurance Number">
            <Input name="insurance_number" defaultValue={editData?.insurance_number} placeholder="Enter insurance number" className="h-10 text-sm border-gray-200 focus:border-blue-300" />
          </FormField>
          <FormField label="Insurance Valid Till">
            <DatePickerField
              placeholder="Select date"
              value={insuranceValidTill}
              onChange={setInsuranceValidTill}
            />
          </FormField>
          <FormField label="Fitness Certificate Number">
            <Input name="fitness_certificate_number" defaultValue={editData?.fitness_certificate_number} placeholder="Enter certificate number" className="h-10 text-sm border-gray-200 focus:border-blue-300" />
          </FormField>
          <FormField label="Fitness Valid Till">
            <DatePickerField
              placeholder="Select date"
              value={fitnessValidTill}
              onChange={setFitnessValidTill}
            />
          </FormField>
          <FormField label={<span>PUC Number <span className="text-[10px] text-gray-400 font-normal">(pollution certificate number)</span></span>}>
            <Input name="puc_number" defaultValue={editData?.puc_number} placeholder="Enter PUC number" className="h-10 text-sm border-gray-200 focus:border-blue-300" />
          </FormField>
          <FormField label="PUC Valid Till">
            <DatePickerField
              placeholder="Select date"
              value={pucValidTill}
              onChange={setPucValidTill}
            />
          </FormField>
        </div>
      </div>

      {/* ── Section 4: Bus Images ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Bus Images
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          Upload photos of the bus (Max 5 images)
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Upload Area */}
        <div 
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer mb-5"
        >
          <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
        </div>

        {/* Preview Area */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
          <div className="grid grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: 5 - previews.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                onClick={handleUploadClick}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6 text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-6 text-sm font-medium text-gray-600 border-gray-200 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 px-6 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {isPending ? "Saving..." : editData ? "Update Bus" : "Save Bus"}
        </Button>
      </div>
      </div>
      </form>

      {/* ── Dynamic Seat Layout Preview Modal (Glassmorphism) ── */}
      <AnimatePresence>
        {isPreviewOpen && (
          <Dialog open={isPreviewOpen} onOpenChange={(open) => !open && setIsPreviewOpen(false)}>
            <DialogContent className={cn(
              "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl p-0 overflow-hidden flex flex-col transition-all duration-300",
              isFullScreen 
                ? "max-w-4xl w-[95vw] h-[90vh] rounded-2xl" 
                : "max-w-md w-[95vw] max-h-[85vh] rounded-2xl"
            )}>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bus className="w-5 h-5 text-blue-600" />
                    Bus Layout Preview
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Live seat configuration preview
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2 mr-6">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="h-8 text-xs font-semibold text-gray-600 border-gray-200"
                  >
                    {isFullScreen ? "Exit Full Screen" : "Full Screen Preview"}
                  </Button>
                </div>
              </div>

              {/* Scrollable Layout Container */}
              <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start bg-slate-50/30">
                <motion.div
                  key={`${layoutType}-${totalSeats}-${lastRowSeats}-${leftSeatsPerRow}-${rightSeatsPerRow}-${isFullScreen}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "bg-white border border-slate-150 p-6 rounded-2xl flex flex-col justify-between shadow-lg transition-all",
                    isFullScreen ? "w-full max-w-xl" : "w-full max-w-[320px]"
                  )}
                >
                  {/* Driver & Conductor Card */}
                  <div className="grid grid-cols-2 gap-4 mb-4 select-none">
                    <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-100 bg-slate-50/50 shadow-xs">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">CONDUCTOR</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-100 bg-slate-50/50 shadow-xs">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">DRIVER</span>
                    </div>
                  </div>

                  {/* Cabin Partition Line */}
                  <div className="h-[2px] bg-slate-800 rounded-full mb-6 opacity-90" />

                  {/* Seat Grid Layout */}
                  <div className="space-y-2">
                    {(() => {
                      const mockSeats = SeatLayoutGeneratorService.generateMockSeats(totalSeats);
                      const rows = SeatLayoutGeneratorService.parseLayout(
                        mockSeats,
                        layoutType,
                        lastRowSeats,
                        leftSeatsPerRow,
                        rightSeatsPerRow
                      );

                      const renderSeatButton = (seat: any) => {
                        return (
                          <motion.div
                            key={seat.seat_number}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-8.5 h-8.5 rounded-lg text-[9.5px] font-black transition-all flex items-center justify-center border select-none cursor-pointer bg-emerald-500 border-emerald-600 text-white shadow-sm hover:shadow-emerald-300"
                          >
                            {seat.seat_number}
                          </motion.div>
                        );
                      };

                      return rows.map((rowObj) => {
                        if (rowObj.isLastRow) {
                          const lastRowSeatsList = rowObj.lastRowSeats || [];
                          return (
                            <div key={rowObj.rowLabel} className="flex flex-col gap-2 mt-3 pt-2 border-t border-slate-100/60">
                              <div className="flex items-center gap-3">
                                <span className="w-6 text-[11px] font-black text-slate-400 text-left shrink-0">
                                  {rowObj.rowLabel}
                                </span>
                                <div className="flex gap-1 flex-1 justify-between">
                                  {lastRowSeatsList.map((seat) => renderSeatButton(seat))}
                                </div>
                              </div>
                              <div className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {lastRowSeatsList.length} Seater (Last Row)
                              </div>
                            </div>
                          );
                        }

                        const leftSeats = rowObj.leftSeats || [];
                        const rightSeats = rowObj.rightSeats || [];

                        return (
                          <div key={rowObj.rowLabel} className="flex items-center gap-3">
                            <span className="w-6 text-[11px] font-black text-slate-400 text-left shrink-0">
                              {rowObj.rowLabel}
                            </span>
                            
                            {/* Left Side */}
                            <div className="flex gap-1.5">
                              {leftSeats.map((seat) => renderSeatButton(seat))}
                            </div>

                            {/* Center Aisle */}
                            <div className="flex-1 min-w-[16px]" />

                            {/* Right Side */}
                            <div className="flex gap-1.5">
                              {rightSeats.map((seat) => renderSeatButton(seat))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Front / Rear Labels */}
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col items-center gap-1 text-[10px] text-slate-400 font-bold tracking-widest uppercase select-none">
                    <div className="flex items-center gap-1">
                      <span>FRONT</span>
                      <span className="text-[11px]">↑</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>REAR</span>
                      <span className="text-[11px]">↓</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-white/40 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(false)}
                  className="h-9 text-sm font-semibold text-gray-600 border-gray-200"
                >
                  Close Preview
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

export function BusesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBus, setEditingBus] = useState<any>(null);
  const [viewingBus, setViewingBus] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  
  const { data: busesResponse, isLoading, isError } = useBuses({ page, search, status });
  const { data: stats } = useBusStats();
  const { mutate: deleteBus } = useDeleteBus();
  
  const buses = busesResponse?.data || [];
  const meta = busesResponse?.meta;

  const handleDeleteBus = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      deleteBus(id, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Bus deleted successfully",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to delete bus",
            variant: "destructive",
          });
        }
      });
    }
  };

  const handleExport = async () => {
    try {
      const exportData: any[] = buses || [];
      if (!exportData.length) { toast({ title: "No data to export", variant: "destructive" }); return; }
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight();
      const cols = ["Bus Name", "Bus Number", "Type", "Capacity", "Operator", "Status"];
      const colW = [44, 34, 34, 24, 42, 32];
      let y = 10, rowH = 6;
      const drawH = () => { pdf.setFillColor(37, 99, 235); pdf.rect(0, y, pageW, rowH + 2, "F"); pdf.setTextColor(255, 255, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(7); let hx = 4; cols.forEach((c, i) => { pdf.text(c, hx + 1, y + 5); hx += colW[i]; }); y += rowH + 3; };
      drawH(); pdf.setFont("helvetica", "normal"); pdf.setFontSize(6); pdf.setTextColor(30, 41, 59);
      exportData.forEach((b: any, idx: number) => {
        if (y > pageH - 15) { pdf.addPage(); y = 10; drawH(); }
        if (idx % 2 === 0) { pdf.setFillColor(248, 250, 252); pdf.rect(0, y - 1, pageW, rowH + 1, "F"); }
        const vals = [b.bus_name || "", b.bus_number || "", b.bus_type || "", String(b.total_seats || 0), b.operator || "--", b.status || ""];
        let vx = 4; vals.forEach((v, i) => { const d = typeof v === "string" ? v : String(v ?? ""); pdf.text(d.length > 20 ? d.slice(0, 18) + ".." : d, vx + 1, y + 4); vx += colW[i]; });
        y += rowH + 1;
      });
      pdf.save(`buses-export-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch { /* ignore */ }
  };

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
  };

  if (isAdding || editingBus) {
    return (
      <AddBusForm 
        onCancel={() => {
          setIsAdding(false);
          setEditingBus(null);
        }} 
        editData={editingBus}
      />
    );
  }

  const dynamicStatCards = [
    {
      title: "Total Buses",
      amount: stats?.total?.toString() || "0",
      subtitle: "All buses in system",
      icon: Bus,
      iconBg: "bg-blue-600",
      iconColor: "text-white",
    },
    {
      title: "Active Buses",
      amount: stats?.active?.toString() || "0",
      subtitle: "Currently active",
      icon: CheckCircle2,
      iconBg: "bg-emerald-600",
      iconColor: "text-white",
    },
    {
      title: "Maintenance",
      amount: stats?.maintenance?.toString() || "0",
      subtitle: "Under maintenance",
      icon: Wrench,
      iconBg: "bg-amber-600",
      iconColor: "text-white",
    },
    {
      title: "Inactive Buses",
      amount: stats?.inactive?.toString() || "0",
      subtitle: "Not in use",
      icon: PowerOff,
      iconBg: "bg-red-600",
      iconColor: "text-white",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStatCards.map((card, index) => (
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

      {/* ── Filter & Search Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search buses..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10 border-gray-200 focus:border-blue-300"
              />
            </div>
            <Select value={status} onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}>
              <SelectTrigger className="h-10 w-[130px] border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Off Duty">Off Duty</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="h-10 border-gray-200 text-gray-600"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 border-gray-200 text-gray-600"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Bus
            </Button>
          </div>
        </div>
      </div>

      {/* ── Buses Table ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading buses...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading buses.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="w-[80px] text-gray-500 font-semibold py-4">Image</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Bus Details</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Bus Type</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Capacity</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Operator</TableHead>
                    <TableHead className="text-gray-500 font-semibold py-4">Status</TableHead>
                    <TableHead className="text-right text-gray-500 font-semibold py-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No buses found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    buses.map((bus: any) => (
                      <TableRow key={bus.id} className="group hover:bg-gray-50/50 border-gray-100 transition-colors">
                        <TableCell className="py-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                            <img
                              src={getImageUrl(bus.images, bus.id)}
                              alt="Bus"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.dataset?.fallbackTried) {
                                  target.src = "/bus-1.png";
                                  return;
                                }
                                target.dataset.fallbackTried = "1";
                                // Extract relative path from whatever URL format and try API-derived storage URL
                                const apiUrl = import.meta.env.VITE_API_BASE_URL;
                                if (apiUrl) {
                                  let relPath = "";
                                  if (Array.isArray(bus.images) && bus.images.length > 0) {
                                    const first = bus.images[0];
                                    if (typeof first === 'string') {
                                      if (first.startsWith('http')) {
                                        try { relPath = new URL(first).pathname.replace(/^\/storage\//, ''); } catch {}
                                      } else {
                                        relPath = first;
                                      }
                                    }
                                  }
                                  if (relPath) {
                                    const storageUrl = apiUrl.replace(/\/api\/?$/, '/storage');
                                    target.src = `${storageUrl}/${relPath}`;
                                    return;
                                  }
                                }
                                target.src = "/bus-1.png";
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">{bus.bus_name}</span>
                            <span className="text-xs text-gray-400 font-medium mt-0.5">{bus.bus_number}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className={cn("text-xs font-bold uppercase tracking-wide", busTypeStyles[bus.bus_type] || "text-gray-600")}>
                            {bus.bus_type}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            {bus.total_seats} Seats
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <span className="text-sm text-gray-600 font-medium">{bus.operator || (bus.driver?.driver_name || "N/A")}</span>
                        </TableCell>
                        <TableCell className="py-4">
                          {(() => {
                            // Normalize status for styling and display
                            const displayStatus = bus.status ? (bus.status.charAt(0).toUpperCase() + bus.status.slice(1).toLowerCase()) : "N/A";
                            // Handle "Off Duty" special case for normalization
                            const normalizedStatus = bus.status?.toLowerCase() === 'off duty' ? 'Off Duty' : displayStatus;
                            
                            return (
                              <Badge className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", statusStyles[normalizedStatus] || "bg-gray-500")}>
                                {normalizedStatus}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => setViewingBus(bus)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                              onClick={() => setEditingBus(bus)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteBus(bus.id)}
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

            {/* ── Pagination ── */}
            {meta && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-900">{meta.from || 0}</span> to <span className="font-medium text-gray-900">{meta.to || 0}</span> of <span className="font-medium text-gray-900">{meta.total || 0}</span> buses
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

      <BusViewDialog 
        bus={viewingBus} 
        open={!!viewingBus} 
        onOpenChange={(open) => !open && setViewingBus(null)} 
      />
    </div>
  );
}
