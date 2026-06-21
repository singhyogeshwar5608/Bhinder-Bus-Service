"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bus,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Shield,
  Lock,
  RotateCcw,
  Headphones,
  Clock,
  Calendar,
  Users,
  Wifi,
  Zap,
  Layers,
  Droplet,
  Lightbulb,
  Wind,
  CheckCircle,
  Star,
  Navigation,
  CreditCard,
  User,
  Check,
  ChevronDown,
  Info,
  Smartphone,
  Ticket,
  Download,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchBuses, useScheduleSeats, useScheduleDetails } from "@/hooks/use-search";
import { useCreateBooking, useLockSeats, useUnlockSeats } from "@/hooks/use-booking";
import { toast } from "@/hooks/use-toast";
import { cn, getImageUrl } from "@/lib/utils";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { SeatLayoutGeneratorService } from "@/services/seat-layout-generator.service";
import jsPDF from "jspdf";

// Time formatting utility helper
const formatTime12h = (timeStr: string) => {
  if (!timeStr) return "--:--";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  if (hours === 0) hours = 12;
  
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export function BookingPage() {
  const navigate = useNavigate();
  
  // Load search parameters
  const [searchParams] = useState(() => {
    const saved = localStorage.getItem("search_params");
    return saved ? JSON.parse(saved) : { from: "Delhi", to: "Jaipur", date: new Date().toISOString().split("T")[0] };
  });

  // Fetch all schedules matching search params
  const { data: schedules, isLoading: searching } = useSearchBuses({
    from_city: searchParams.from,
    to_city: searchParams.to,
    journey_date: searchParams.date,
  });

  // Track currently selected schedule ID (expandedBus)
  const [expandedBus, setExpandedBus] = useState<number | null>(() => {
    const savedId = localStorage.getItem("selected_schedule_id");
    return savedId ? Number(savedId) : null;
  });

  // Set default selected schedule if none is set
  useEffect(() => {
    if (schedules && schedules.length > 0 && !expandedBus) {
      setExpandedBus(schedules[0].id);
    }
  }, [schedules, expandedBus]);

  const { data: selectedSchedule, isLoading: loadingScheduleDetails } = useScheduleDetails(expandedBus || undefined);

  // Generate/Retrieve persistent Session ID for seat locks
  const [sessionId, setSessionId] = useState(() => {
    let id = localStorage.getItem("booking_session_id");
    if (!id) {
      id = "session-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("booking_session_id", id);
    }
    return id;
  });

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<string>("");
  const [droppingPoint, setDroppingPoint] = useState<string>("");

  useEffect(() => {
    if (selectedSchedule) {
      if (!boardingPoint) setBoardingPoint(selectedSchedule.from);
      if (!droppingPoint) setDroppingPoint(selectedSchedule.to);
    }
  }, [selectedSchedule, boardingPoint, droppingPoint]);

  // Modal State for Passenger Details Form
  const [isPassengerModalOpen, setIsPassengerModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [passengerNames, setPassengerNames] = useState<Record<string, string>>({});
  const [passengerAges, setPassengerAges] = useState<Record<string, number>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmData, setConfirmData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Recover from payment if handler never fired (page refresh, stuck modal, etc.)
  useEffect(() => {
    const pendingRaw = localStorage.getItem('pending_booking');
    if (!pendingRaw) return;
    localStorage.removeItem('pending_booking');

    let pending: any;
    try { pending = JSON.parse(pendingRaw); } catch { return; }
    if (!pending?.bookingNumber) return;

    const age = Date.now() - (pending.timestamp || 0);
    if (age > 30 * 60 * 1000) return; // Older than 30 mins, skip

    console.log("[RECOVERY] Found pending booking, checking status...", pending);
    api.get(`/bookings/${pending.bookingNumber}`)
      .then((res: any) => {
        const booking = res.data?.booking || res.data;
        if (booking?.payment_status === 'paid' || booking?.payment_status === 'success') {
          console.log("[RECOVERY] Booking already paid! Showing confirmation.");
          setConfirmData({
            bookingNumber: pending.bookingNumber,
            passengers: [],
            totalAmount: booking.total_amount,
            boardingLocation: '',
            boardingTime: '',
            destination: booking?.schedule?.to || '',
            arrivalTime: '',
            scheduleName: booking?.schedule?.name || '',
            scheduleDate: booking?.schedule?.journey_date || '',
            customerName: booking.customer_name,
            customerPhone: booking.customer_phone,
            customerEmail: booking.customer_email,
            seatNumbers: booking.seat_numbers || [],
            busName: booking?.schedule?.bus?.bus_name || '',
            busNumber: booking?.schedule?.bus?.bus_number || '',
            busType: booking?.schedule?.bus?.bus_type || '',
          });
          setIsConfirmOpen(true);
          toast({ title: "✓ Payment Already Confirmed!", description: "Your booking was completed.", variant: "default" });
        } else {
          // Payment not made yet, check Razorpay order status
          if (pending.razorpayOrderId) {
            api.get(`/payments/order-status/${pending.razorpayOrderId}`)
              .then((statusRes: any) => {
                if (statusRes.data?.paid) {
                  console.log("[RECOVERY] Payment detected via Razorpay! Confirming booking...");
                  toast({ title: "Payment Found", description: "Completing your booking...", variant: "default" });
                  window.location.reload();
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch seats for the selected bus, passing session_id to map 'selected' status
  const { data: seatDataResponse, isLoading: loadingSeats } = useScheduleSeats(expandedBus, sessionId);
  const seats = seatDataResponse?.seats || [];

  const lockSeatsMutation = useLockSeats();
  const unlockSeatsMutation = useUnlockSeats();
  const createBookingMutation = useCreateBooking();

  const [seatsInitialized, setSeatsInitialized] = useState(false);

  // Reset seat selections when bus selection changes
  useEffect(() => {
    setSeatsInitialized(false);
    setSelectedSeats([]);
    setPassengerNames({});
    setPassengerAges({});
  }, [expandedBus]);

  // Initialize selectedSeats from the server if they are already locked in this session
  useEffect(() => {
    if (seatDataResponse?.seats && !seatsInitialized) {
      const userSelected = seatDataResponse.seats
        .filter((s: any) => s.status === 'selected')
        .map((s: any) => s.seat_number);
      setSelectedSeats(userSelected);
      setSeatsInitialized(true);
    }
  }, [seatDataResponse, seatsInitialized]);

  // Auto-heal selectedSeats state by filtering out seats that are now booked or locked by another user
  useEffect(() => {
    if (seatDataResponse?.seats && selectedSeats.length > 0) {
      const updatedSelected = selectedSeats.filter((seatNum) => {
        const seatDetail = seatDataResponse.seats.find((s: any) => s.seat_number === seatNum);
        return seatDetail && seatDetail.status !== 'booked' && seatDetail.status !== 'locked';
      });

      if (updatedSelected.length !== selectedSeats.length) {
        setSelectedSeats(updatedSelected);
        setPassengerNames((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            if (!updatedSelected.includes(key)) {
              delete next[key];
            }
          });
          return next;
        });
      }
    }
  }, [seatDataResponse, selectedSeats]);

  const toggleSeat = async (seatNumber: string) => {
    const isAlreadySelected = selectedSeats.includes(seatNumber);

    if (isAlreadySelected) {
      const originalSeats = [...selectedSeats];
      const originalNames = { ...passengerNames };

      // Optimistically update UI instantly
      setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
      const updatedNames = { ...passengerNames };
      delete updatedNames[seatNumber];
      setPassengerNames(updatedNames);

      // Backend lock release in the background
      try {
        await unlockSeatsMutation.mutateAsync({
          schedule_id: expandedBus!,
          seat_numbers: [seatNumber],
          session_id: sessionId,
        });
      } catch (error: any) {
        // Rollback state on error
        setSelectedSeats(originalSeats);
        setPassengerNames(originalNames);
        toast({
          title: "Error Releasing Seat",
          description: error.response?.data?.message || "Could not release seat lock.",
          variant: "destructive"
        });
      }
    } else {
      if (selectedSeats.length >= 6) {
        toast({ title: "Limit reached", description: "You can select up to 6 seats only." });
        return;
      }

      const originalSeats = [...selectedSeats];

      // Optimistically update UI instantly
      setSelectedSeats((prev) => [...prev, seatNumber]);

      // Backend lock creation in the background
      try {
        await lockSeatsMutation.mutateAsync({
          schedule_id: expandedBus!,
          seat_numbers: [seatNumber],
          session_id: sessionId,
        });
      } catch (error: any) {
        // Rollback state on error
        setSelectedSeats(originalSeats);
        toast({
          title: "Seat Unavailable",
          description: error.response?.data?.message || "This seat is already locked or booked.",
          variant: "destructive"
        });
      }
    }
  };

  // Dynamic fare per seat based on boarding point
  const selectedStop = selectedSchedule?.stops?.find((s: any) => s.stop_name === boardingPoint);
  const farePerSeat = selectedStop ? Number(selectedStop.fare) : (selectedSchedule?.fare || 0);

  const baseFare = selectedSeats.length * farePerSeat;
  const totalFare = baseFare;

  // Display boarding point details dynamically based on selected boarding point
  const boardingTime = selectedStop ? formatTime12h(selectedStop.departure_time || selectedStop.arrival_time) : selectedSchedule?.dep;
  const boardingLocation = boardingPoint || selectedSchedule?.from;

  // Handle final booking submission
  const [processingPayment, setProcessingPayment] = useState(false);
  const paymentInFlightRef = useRef(false);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => { unmountedRef.current = true; };
  }, []);

  // Warn user if they try to leave during payment
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (paymentInFlightRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PAYMENT] handleBookingSubmit started");
    if (!customerName || !customerPhone || !customerEmail) {
      toast({ title: "Validation Error", description: "Please fill in all customer contact details.", variant: "destructive" });
      return;
    }

    const passengersList = selectedSeats.map((seatNumber) => ({
      seat_number: seatNumber,
      name: passengerNames[seatNumber] || customerName,
      age: passengerAges[seatNumber] || 25,
      gender: "male"
    }));

    setProcessingPayment(true);
    paymentInFlightRef.current = true;
    try {
      // 1. Create pending booking
      console.log("[PAYMENT] Step 1: Creating booking...");
      const response = await createBookingMutation.mutateAsync({
        schedule_id: expandedBus!,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        seat_numbers: selectedSeats,
        total_amount: totalFare,
        passengers: passengersList,
        session_id: sessionId,
      });
      
      const bookingData = response?.data || response;
      const bookingId = bookingData.id;
      const bookingNumber = bookingData.booking_number;
      console.log("[PAYMENT] Booking created", { bookingId, bookingNumber });

      // 2. Initiate Razorpay order
      console.log("[PAYMENT] Step 2: Initiating Razorpay order...");
      const initRes = await api.post('/payments/initiate', { booking_id: bookingId });
      const initData = initRes.data;
      console.log("[PAYMENT] Razorpay order initiated", { orderId: initData.razorpay_order_id });

      // Store pending booking in localStorage for recovery if handler never fires
      localStorage.setItem('pending_booking', JSON.stringify({
        bookingId,
        bookingNumber,
        razorpayOrderId: initData.razorpay_order_id,
        timestamp: Date.now(),
      }));

      // 3. Load Razorpay and open checkout
      console.log("[PAYMENT] Step 3: Loading Razorpay SDK...");
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        localStorage.removeItem('pending_booking');
        throw new Error("Failed to load Razorpay SDK");
      }
      console.log("[PAYMENT] Razorpay SDK loaded");

      // Build commonData upfront for use in handler
      const schedule = selectedSchedule;
      const bus = schedule?.bus_details;
      const allStops = schedule?.stops || [];

      // Open Razorpay checkout
      let paymentCompleted = false;

      const options = {
        key: initData.key_id,
        amount: initData.amount,
        currency: initData.currency,
        name: "Bhinder Bus Service",
        description: `Booking ${bookingNumber}`,
        order_id: initData.razorpay_order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#2563EB",
        },
        modal: {
          ondismiss: function () {
            console.log("[PAYMENT] Razorpay modal dismissed by user");
            if (paymentCompleted) {
              // Handler already fired, nothing to do
              return;
            }
            paymentCompleted = true;

            // Check if payment actually went through (handler might not have fired)
            api.get(`/payments/order-status/${initData.razorpay_order_id}`)
              .then((res: any) => {
                if (res.data?.paid) {
                  console.log("[PAYMENT] Payment detected via order status check! Recovering...");
                  // Payment went through but handler didn't fire — verify now
                  return api.get(`/bookings/${bookingNumber}`)
                    .then((bookingRes: any) => {
                      const booking = bookingRes.data;
                      if (booking?.payment_status === 'paid') {
                        // Already verified on backend, show confirmation
                        const commonData = {
                          bookingNumber: booking.booking_number,
                          passengers: passengersList,
                          totalAmount: totalFare,
                          boardingLocation,
                          boardingTime,
                          destination: schedule?.to,
                          arrivalTime: schedule?.arr,
                          scheduleName: schedule?.name,
                          scheduleDate: schedule?.date,
                          customerName,
                          customerPhone,
                          customerEmail,
                          seatNumbers: [...selectedSeats],
                          busName: bus?.bus_name,
                          busNumber: bus?.bus_number,
                          busType: bus?.bus_type,
                          operator: bus?.operator,
                          routeFrom: schedule?.from,
                          routeTo: schedule?.to,
                          journeyDate: schedule?.date,
                          depTime: schedule?.dep,
                          arrTimeFull: schedule?.arr,
                          fare: schedule?.fare,
                          amenities: schedule?.amenities,
                          stops: allStops,
                          boardingPoint: boardingPoint || schedule?.from,
                          droppingPoint: droppingPoint || schedule?.to,
                        };
                        localStorage.removeItem('pending_booking');
                        setConfirmData(commonData);
                        setIsConfirmOpen(true);
                        toast({ title: "✓ Booking Confirmed!", description: "Your payment was successful.", variant: "default" });
                        generateAndEmailPdf(commonData);
                      } else {
                        toast({ title: "Payment Detected", description: "We received your payment. Confirming booking...", variant: "default" });
                      }
                    });
                } else {
                  toast({ title: "Payment Cancelled", description: "Your booking is pending. You can retry from the booking page.", variant: "destructive" });
                }
              })
              .catch(() => {
                toast({ title: "Payment Cancelled", description: "Your booking is pending. You can retry from the booking page.", variant: "destructive" });
              })
              .finally(() => {
                setProcessingPayment(false);
                paymentInFlightRef.current = false;
              });
          },
          confirm_close: true,
        },
        handler: function (paymentResponse: any) {
          console.log("[PAYMENT] Razorpay handler called - payment successful", {
            payment_id: paymentResponse.razorpay_payment_id,
            order_id: paymentResponse.razorpay_order_id,
          });
          // Force close the Razorpay modal (SDK sometimes doesn't close on its own in production)
          paymentCompleted = true;
          try { rzp.close(); } catch (e) { console.warn("[PAYMENT] rzp.close() failed", e); }

          // Run verification in background (non-blocking)
          api.post('/payments/verify', {
            booking_id: bookingId,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          })
          .then((verifyRes: any) => {
            console.log("[PAYMENT] Verification successful", verifyRes.data);
            const verifiedData = verifyRes.data;

            const commonData = {
              bookingNumber: verifiedData.booking?.booking_number || bookingNumber,
              passengers: passengersList,
              totalAmount: totalFare,
              boardingLocation,
              boardingTime,
              destination: schedule?.to,
              arrivalTime: schedule?.arr,
              scheduleName: schedule?.name,
              scheduleDate: schedule?.date,
              customerName,
              customerPhone,
              customerEmail,
              seatNumbers: [...selectedSeats],
              busName: bus?.bus_name,
              busNumber: bus?.bus_number,
              busType: bus?.bus_type,
              operator: bus?.operator,
              routeFrom: schedule?.from,
              routeTo: schedule?.to,
              journeyDate: schedule?.date,
              depTime: schedule?.dep,
              arrTimeFull: schedule?.arr,
              fare: schedule?.fare,
              amenities: schedule?.amenities,
              stops: allStops,
              boardingPoint: boardingPoint || schedule?.from,
              droppingPoint: droppingPoint || schedule?.to,
            };

            localStorage.removeItem('pending_booking');
            setConfirmData(commonData);
            setIsPassengerModalOpen(false);
            setIsConfirmOpen(true);
            console.log("[PAYMENT] Confirmation dialog shown");

            generateAndEmailPdf(commonData).finally(() => {
              console.log("[PAYMENT] Auto-email complete");
            });
          })
          .catch((verifyError: any) => {
            console.error("[PAYMENT] Verification failed AFTER payment was taken!", {
              error: verifyError?.response?.data || verifyError?.message || verifyError,
            });
            toast({
              title: "Payment Received - Verification Pending",
              description: "Your payment was successful but verification is pending. Our team will confirm your booking shortly.",
              variant: "default",
            });
          })
          .finally(() => {
            setProcessingPayment(false);
            paymentInFlightRef.current = false;
          });
        },
      };

      if (unmountedRef.current) {
        console.log("[PAYMENT] Component unmounted before Razorpay open");
        throw new Error("Component unmounted");
      }
      const rzp = new (window as any).Razorpay(options);
      console.log("[PAYMENT] Step 3b: Opening Razorpay checkout modal...");
      rzp.open();
    } catch (error: any) {
      console.error("[PAYMENT] Booking flow failed before payment modal:", {
        error: error?.response?.data || error?.message || error,
      });
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || error.message || "Something went wrong during checkout.",
        variant: "destructive"
      });
      setProcessingPayment(false);
      paymentInFlightRef.current = false;
    }
  };

  // Handle ticket download → email send → redirect home (only after email completes)
  const handleDownloadTicket = async () => {
    if (!confirmData) return;
    console.log("[TICKET] handleDownloadTicket started");
    setDownloading(true);
    try {
      const d = confirmData;
      const pass = d.passengers || [];
      const stops: any[] = d.stops || [];
      const bp = d.boardingPoint || "";
      const seatNums = d.seatNumbers || [];

      const w = 1000;
      const margin = 30;
      const split = 0.58;
      const cw = w - margin * 2;
      const leftW = Math.floor(cw * split);
      const rightW = cw - leftW;
      const LX = margin;
      const LWR = leftW - 4;
      const RX = margin + leftW + 10;
      const RWR = rightW - 10;

      const C = {
        primary: "#0F172A", secondary: "#1E293B", accent: "#F59E0B",
        success: "#22C55E", white: "#FFFFFF", text: "#1E293B",
        muted: "#94A3B8", border: "#E2E8F0", cardBg: "#F8FAFC", subtext: "#64748B",
        blue: "#2563EB", red: "#DC2626",
      };

      let testY = 105;
      testY += 34; testY += 8; testY += 62; testY += 10;
      testY += 48;
      testY += 34; testY += 8;
      testY += 96 + pass.length * 24 + 4; testY += 10;
      testY += 34; testY += 8;
      testY += Math.min(stops.length, 5) * 28 + 4; testY += 10;
      testY += 34; testY += 8;
      testY += 90;
      const neededH = testY + 16 + 60 + 20;

      console.log("[TICKET] Generating PDF canvas...");
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = neededH;
      const ctx = canvas.getContext("2d")!;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, neededH);

      ctx.fillStyle = C.blue;
      ctx.fillRect(0, 0, w, 90);
      ctx.fillStyle = C.white;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("BHINDER BUS SERVICE", w / 2, 36);
      ctx.fillStyle = C.accent;
      ctx.font = "bold 13px Arial";
      ctx.fillText("BOOKING CONFIRMATION TICKET", w / 2, 56);
      ctx.fillStyle = C.muted;
      ctx.font = "13px Arial";
      ctx.fillText(`Booking: ${d.bookingNumber || "—"}  |  ${d.journeyDate || d.scheduleDate || "—"}`, w / 2, 76);

      let ly = 105;
      ly = drawCardHeader(ctx, LX, ly, LWR, "ROUTE DETAILS", C) + 8;
      ly = drawRoute(ctx, LX, LWR, ly, d, C, stops, bp) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "PASSENGER DETAILS", C) + 8;
      ly = drawPassengers(ctx, LX, LWR, ly, pass, C, d) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "BOARDING DETAILS", C) + 8;
      ly = drawRouteTimeline(ctx, LX, LWR, ly, stops, bp, C, d) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "SEAT MAP", C) + 8;
      ly = drawSeats(ctx, LX, LWR, ly, seatNums, C);

      let ry = 105;
      ry = drawCardHeader(ctx, RX, ry, RWR, "BUS DETAILS", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 220); ctx.clip();
      ry = drawBus(ctx, RX, RWR, ry, d, C) + 10; ctx.restore();
      ry = drawCardHeader(ctx, RX, ry, RWR, "PAYMENT SUMMARY", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 200); ctx.clip();
      ry = drawPayment(ctx, RX, RWR, ry, d, C) + 10; ctx.restore();
      ry = drawCardHeader(ctx, RX, ry, RWR, "BOOKING STATUS", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 100); ctx.clip();
      ry = drawStatus(ctx, RX, RWR, ry, C); ctx.restore();

      const beforeFootY = Math.max(ly, ry) + 16;
      const disclaimerY = beforeFootY + 10;
      ctx.fillStyle = "#94A3B8";
      ctx.font = "11px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Please note that bus, route, driver, boarding/drop points, and travel", w / 2, disclaimerY + 12);
      ctx.fillText("schedules may be modified due to operational requirements or unforeseen circumstances.", w / 2, disclaimerY + 26);

      const footY = disclaimerY + 40;
      ctx.fillStyle = C.blue;
      ctx.fillRect(0, footY, w, 60);
      ctx.fillStyle = C.muted;
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Contact: 8092000025  |  Email: bhinderbusservice@gmail.com", w / 2, footY + 24);
      ctx.fillStyle = C.accent;
      ctx.font = "bold 13px Arial";
      ctx.fillText("Thank you for travelling with Bhinder Bus Service", w / 2, footY + 42);

      const pdfH = footY + 60;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const imgH = (pdfH / w) * pageW;
      pdf.addImage(imgData, "PNG", 0, 0, pageW, imgH);
      pdf.save(`ticket-${d.bookingNumber || "booking"}.pdf`);
      console.log("[Ticket] PDF downloaded");

      if (d.customerEmail && d.bookingNumber) {
        setDownloading(false);
        setSendingEmail(true);
        console.log("[Email] Sending to", d.customerEmail);
        const pdfArr = pdf.output("arraybuffer");
        const pdfBlob = new Blob([pdfArr], { type: "application/pdf" });
        console.log("[Email] PDF size:", pdfBlob.size, "bytes");
        if (pdfBlob.size < 100) throw new Error("PDF too small — likely empty");
        const fd = new FormData();
        fd.append("email", d.customerEmail);
        fd.append("ticket_pdf", pdfBlob, `ticket-${d.bookingNumber}.pdf`);
        console.log("[Email] POST /api/bookings/...");
        const res = await api.post(`/bookings/${d.bookingNumber}/email-ticket`, fd, { timeout: 60000 });
        console.log("[Email] Status:", res.status, "Body:", res.data);
        toast({ title: "✓ Ticket Sent!", description: `Emailed to ${d.customerEmail}` });
      } else {
        console.log("[Email] Skipped — no email address");
      }

      console.log("[TICKET] All done, navigating to home");
      setIsConfirmOpen(false);
      navigate("/");
    } catch (err: any) {
      console.error("[TICKET] Error:", err?.response?.data || err?.message || err);
      const msg = err?.response?.data?.error || err?.message || "Could not complete";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setDownloading(false);
      setSendingEmail(false);
    }
  };

  // Auto-generate PDF and email it (called after payment success)
  const generateAndEmailPdf = async (d: any) => {
    try {
      const pass = d.passengers || [];
      const stops: any[] = d.stops || [];
      const bp = d.boardingPoint || "";
      const seatNums = d.seatNumbers || [];

      const w = 1000, margin = 30, split = 0.58;
      const cw = w - margin * 2, leftW = Math.floor(cw * split), rightW = cw - leftW;
      const LX = margin, LWR = leftW - 4, RX = margin + leftW + 10, RWR = rightW - 10;

      const C = {
        primary: "#0F172A", secondary: "#1E293B", accent: "#F59E0B",
        success: "#22C55E", white: "#FFFFFF", text: "#1E293B",
        muted: "#94A3B8", border: "#E2E8F0", cardBg: "#F8FAFC", subtext: "#64748B",
        blue: "#2563EB", red: "#DC2626",
      };

      let testY = 105;
      testY += 34; testY += 8; testY += 62; testY += 10;
      testY += 48;
      testY += 34; testY += 8;
      testY += 96 + pass.length * 24 + 4; testY += 10;
      testY += 34; testY += 8;
      testY += Math.min(stops.length, 5) * 28 + 4; testY += 10;
      testY += 34; testY += 8;
      testY += 90;
      const neededH = testY + 16 + 60 + 20;

      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = neededH;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, w, neededH);

      ctx.fillStyle = C.blue; ctx.fillRect(0, 0, w, 90);
      ctx.fillStyle = C.white; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
      ctx.fillText("BHINDER BUS SERVICE", w / 2, 36);
      ctx.fillStyle = C.accent; ctx.font = "bold 13px Arial";
      ctx.fillText("BOOKING CONFIRMATION TICKET", w / 2, 56);
      ctx.fillStyle = C.muted; ctx.font = "13px Arial";
      ctx.fillText(`Booking: ${d.bookingNumber || "—"}  |  ${d.journeyDate || d.scheduleDate || "—"}`, w / 2, 76);

      let ly = 105;
      ly = drawCardHeader(ctx, LX, ly, LWR, "ROUTE DETAILS", C) + 8;
      ly = drawRoute(ctx, LX, LWR, ly, d, C, stops, bp) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "PASSENGER DETAILS", C) + 8;
      ly = drawPassengers(ctx, LX, LWR, ly, pass, C, d) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "BOARDING DETAILS", C) + 8;
      ly = drawRouteTimeline(ctx, LX, LWR, ly, stops, bp, C, d) + 10;
      ly = drawCardHeader(ctx, LX, ly, LWR, "SEAT MAP", C) + 8;
      ly = drawSeats(ctx, LX, LWR, ly, seatNums, C);

      let ry = 105;
      ry = drawCardHeader(ctx, RX, ry, RWR, "BUS DETAILS", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 220); ctx.clip();
      ry = drawBus(ctx, RX, RWR, ry, d, C) + 10; ctx.restore();
      ry = drawCardHeader(ctx, RX, ry, RWR, "PAYMENT SUMMARY", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 200); ctx.clip();
      ry = drawPayment(ctx, RX, RWR, ry, d, C) + 10; ctx.restore();
      ry = drawCardHeader(ctx, RX, ry, RWR, "BOOKING STATUS", C) + 8;
      ctx.save(); ctx.beginPath(); ctx.rect(RX + 2, ry - 42, RWR - 4, 100); ctx.clip();
      ry = drawStatus(ctx, RX, RWR, ry, C); ctx.restore();

      const beforeFootY = Math.max(ly, ry) + 16;
      const disclaimerY = beforeFootY + 10;
      ctx.fillStyle = "#94A3B8"; ctx.font = "11px Arial"; ctx.textAlign = "center";
      ctx.fillText("Please note that bus, route, driver, boarding/drop points, and travel", w / 2, disclaimerY + 12);
      ctx.fillText("schedules may be modified due to operational requirements or unforeseen circumstances.", w / 2, disclaimerY + 26);

      const footY = disclaimerY + 40;
      ctx.fillStyle = C.blue; ctx.fillRect(0, footY, w, 60);
      ctx.fillStyle = C.muted; ctx.font = "13px Arial"; ctx.textAlign = "center";
      ctx.fillText("Contact: 8092000025  |  Email: bhinderbusservice@gmail.com", w / 2, footY + 24);
      ctx.fillStyle = C.accent; ctx.font = "bold 13px Arial";
      ctx.fillText("Thank you for travelling with Bhinder Bus Service", w / 2, footY + 42);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      pdf.addImage(imgData, "PNG", 0, 0, pageW, (footY + 60) / w * pageW);

      if (d.customerEmail && d.bookingNumber) {
        const blob = new Blob([pdf.output("arraybuffer")], { type: "application/pdf" });
        const fd = new FormData();
        fd.append("email", d.customerEmail);
        fd.append("ticket_pdf", blob, `ticket-${d.bookingNumber}.pdf`);
        await api.post(`/bookings/${d.bookingNumber}/email-ticket`, fd, { timeout: 60000 });
        console.log("[AutoEmail] Ticket sent to", d.customerEmail);
      }
    } catch (err) {
      console.error("[AutoEmail] Failed:", err);
    }
  };

  // ── Canvas helpers (pure, y-in / new-y-out) ──
  // ── Helper: truncate text with ellipsis ──
  function t(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
    if (ctx.measureText(text).width <= maxW) return text;
    let s = text;
    while (ctx.measureText(s + "...").width > maxW && s.length > 1) s = s.slice(0, -1);
    return s + "...";
  }

  function drawCardHeader(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, title: string, C: any) {
    if (!title) return y + 34;
    ctx.fillStyle = C.cardBg;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 32, 4);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = C.border;
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.fillRect(x, y, 4, 32);
    ctx.fillStyle = C.primary;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText(title, x + 14, y + 21);
    return y + 34;
  }

  function drawRoute(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, d: any, C: any, stops?: any[], bp?: string) {
    const x1 = LX + 12, x2 = LX + LWR - 12, cy = y, lY = cy + 10;
    const halfW = (x2 - x1) / 2 - 10;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1 + 14, lY);
    ctx.lineTo(x2 - 14, lY);
    ctx.stroke();
    ctx.beginPath(); ctx.arc(x1 + 14, lY, 6, 0, Math.PI * 2); ctx.fillStyle = C.accent; ctx.fill();
    ctx.beginPath(); ctx.arc(x2 - 14, lY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = "left";
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = C.blue;
    ctx.fillText(t(ctx, d.routeFrom || d.boardingLocation || "—", halfW), x1, cy + 32);
    ctx.textAlign = "right";
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = C.success;
    ctx.fillText(t(ctx, d.routeTo || d.destination || "—", halfW), x2, cy + 32);
    ctx.textAlign = "center";
    ctx.fillStyle = C.accent;
    ctx.font = "bold 13px Arial";
    ctx.fillText("180 KM", (x1 + x2) / 2, lY - 8);
    ctx.textAlign = "left";
    ctx.fillStyle = C.blue;
    ctx.font = "13px Arial";
    ctx.fillText(d.depTime || d.boardingTime || "", x1, cy + 52);
    ctx.textAlign = "right";
    ctx.fillStyle = C.success;
    ctx.font = "13px Arial";
    ctx.fillText(d.arrTimeFull || d.arrivalTime || "", x2, cy + 52);

    // Boarding point with fare below route
    const boardPoint = bp || d.boardingPoint || "";
    const boardStop = (stops || d.stops || []).find((s: any) => s.stop_name === boardPoint);
    const boardFare = boardStop ? Number(boardStop.fare) : (d.fare || 0);
    if (boardPoint) {
      ctx.textAlign = "left";
      ctx.fillStyle = C.text;
      ctx.font = "bold 14px Arial";
      ctx.fillText("Boarding: " + boardPoint, x1, cy + 76);
      ctx.textAlign = "right";
      ctx.fillStyle = C.text;
      ctx.font = "bold 16px Arial";
      ctx.fillText("₹" + Number(boardFare).toLocaleString("en-IN"), x2, cy + 76);
      // Boarding time
      if (boardStop) {
        const arrTime = boardStop.arrival_time || "";
        const depTime = boardStop.departure_time || "";
        const timeStr = depTime ? (arrTime ? arrTime + " - " + depTime : depTime) : (arrTime || "");
        if (timeStr) {
          ctx.textAlign = "left";
          ctx.fillStyle = C.text;
          ctx.font = "13px Arial";
          ctx.fillText(timeStr, x1, cy + 96);
        }
      }
    }

    return cy + (boardPoint ? (boardStop ? 110 : 92) : 62);
  }

  function drawRouteTimeline(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, stops: any[], bp: string, C: any, d?: any) {
    const bx = LX + 18;
    const maxW = LWR - 50;
    const dd = d || {};

    // Route details header
    const from = dd.routeFrom || dd.boardingLocation || "";
    const to = dd.routeTo || dd.destination || "";
    if (from || to) {
      ctx.fillStyle = C.blue;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(t(ctx, from, 120), bx, y + 9);
      ctx.fillStyle = C.accent;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("→", bx + 130, y + 9);
      ctx.textAlign = "right";
      ctx.fillStyle = C.success;
      ctx.fillText(t(ctx, to, 120), bx + 260, y + 9);
      y += 14;
    }

    if (stops.length === 0) {
      ctx.fillStyle = C.text;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(t(ctx, bp || "—", maxW), bx, y + 16);
      return y + 26;
    }
    const bpIdx = stops.findIndex((s: any) => s.stop_name === bp);
    const boardIdx = bpIdx >= 0 ? bpIdx : 0;

    // Vertical line background
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, y + 14);
    ctx.lineTo(bx, y + stops.length * 32 - 6);
    ctx.stroke();

    stops.forEach((s: any, i: number) => {
      const isBefore = i < boardIdx;
      const isSel = s.stop_name === bp;

      if (i > 0) {
        ctx.strokeStyle = isBefore ? C.border : C.accent;
        ctx.lineWidth = isBefore ? 1 : 2;
        ctx.beginPath();
        ctx.moveTo(bx, y + 14);
        ctx.lineTo(bx, y + 32);
        ctx.stroke();
      }

      if (isBefore) {
        ctx.fillStyle = C.muted;
        ctx.font = "13px Arial";
        ctx.textAlign = "left";
        ctx.fillText(t(ctx, s.stop_name, maxW - 70), bx + 14, y + 18);
        const time = s.departure_time || s.arrival_time || "";
        if (time) {
          ctx.textAlign = "right";
          ctx.font = "13px Arial";
          ctx.fillStyle = "#CBD5E1";
          ctx.fillText(time, LX + LWR - 70, y + 18);
        }
        const fare = Number(s.fare || 0);
        if (fare > 0) {
          ctx.textAlign = "right";
          ctx.font = "13px Arial";
          ctx.fillStyle = "#CBD5E1";
          ctx.fillText("₹" + fare.toLocaleString("en-IN"), LX + LWR - 14, y + 18);
        }
      } else {
        const dotCol = isSel ? C.accent : C.accent;
        ctx.beginPath();
        ctx.arc(bx, y + 14, isSel ? 6 : 5, 0, Math.PI * 2);
        ctx.fillStyle = dotCol;
        ctx.fill();
        if (isSel) {
          ctx.beginPath(); ctx.arc(bx, y + 14, 2.5, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
        }

        ctx.textAlign = "left";
        ctx.font = isSel ? "bold 13px Arial" : "13px Arial";
        ctx.fillStyle = isSel ? C.accent : C.blue;
        ctx.fillText(t(ctx, s.stop_name, maxW - 70), bx + 14, y + 18);

        const time = s.departure_time || s.arrival_time || "";
        if (time) {
          ctx.textAlign = "right";
          ctx.font = "bold 13px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText(time, LX + LWR - 70, y + 18);
        }

        const fare = Number(s.fare || 0);
        if (fare > 0) {
          ctx.textAlign = "right";
          ctx.font = "bold 13px Arial";
          ctx.fillStyle = C.success;
          ctx.fillText("₹" + fare.toLocaleString("en-IN"), LX + LWR - 14, y + 18);
        }
      }

      y += 32;
    });
    return y + 4;
  }

  function drawPassengers(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, pass: any[], C: any, d?: any) {
    const tx = LX + 12, c1 = tx, c2 = tx + 85, c3 = tx + LWR - 110;
    const nameW = LWR - 210;
    const dd = d || {};

    // Customer info — label: value format
    if (dd.customerName || dd.customerPhone || dd.customerEmail) {
      ctx.fillStyle = C.text;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "left";
      const labelW = 110;
      const valX = tx + labelW;
      const valW = LWR - labelW - 20;

      if (dd.customerName) {
        ctx.fillText("Booked By:", tx, y + 20);
        ctx.font = "13px Arial";
        ctx.fillText(t(ctx, dd.customerName, valW), valX, y + 20);
        y += 22;
        ctx.font = "bold 13px Arial";
      }

      if (dd.customerPhone) {
        ctx.fillText("Mobile:", tx, y + 20);
        ctx.font = "13px Arial";
        ctx.fillText(dd.customerPhone, valX, y + 20);
        y += 22;
        ctx.font = "bold 13px Arial";
      }

      if (dd.customerEmail) {
        ctx.fillText("Email:", tx, y + 20);
        ctx.font = "13px Arial";
        ctx.fillText(t(ctx, dd.customerEmail, valW), valX, y + 20);
        y += 22;
        ctx.font = "bold 13px Arial";
      }

      const jDate = dd.journeyDate || dd.scheduleDate || "";
      if (jDate) {
        ctx.fillText("Journey Date:", tx, y + 20);
        ctx.font = "13px Arial";
        const shortDate = jDate.length > 15 ? jDate.slice(0, 15) : jDate;
        ctx.fillText(shortDate, valX, y + 20);
        y += 26;
      }
      // 7px gap after journey date
      y += 7;
    }

    ctx.fillStyle = C.muted;
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.fillText("SEAT", c1, y + 9);
    ctx.fillText("NAME", c2, y + 9);
    ctx.textAlign = "right";
    ctx.fillText("AGE", c3, y + 9);
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(tx, y + 16);
    ctx.lineTo(tx + LWR - 20, y + 16);
    ctx.stroke();
    y += 20;
    pass.forEach((p: any) => {
      ctx.fillStyle = C.blue;
      ctx.font = "bold 13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(p.seat_number || "—", c1, y + 14);
      ctx.font = "13px Arial";
      ctx.fillStyle = C.text;
      ctx.fillText(t(ctx, p.name || "", nameW), c2, y + 14);
      ctx.textAlign = "right";
      ctx.fillStyle = C.success;
      ctx.font = "bold 13px Arial";
      ctx.fillText(String(p.age || ""), c3, y + 14);
      y += 24;
    });
    return y + 4;
  }

  function drawSeats(ctx: CanvasRenderingContext2D, LX: number, LWR: number, y: number, seatNums: string[], C: any) {
    const sx = LX + 12, sw = LWR - 24, cols = 10, ss = 16, sg = 4;
    const tw = cols * (ss + sg);
    const sx2 = sx + (sw - tw) / 2;
    const rows = 2, totalH = rows * (ss + sg);
    const totalS = cols * rows;
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i < totalS; i++) {
      const r = Math.floor(i / cols), c = i % cols;
      const cx = sx2 + c * (ss + sg), cy = y + r * (ss + sg);
      const isBooked = i < seatNums.length;
      // Draw circle
      ctx.beginPath();
      ctx.arc(cx + ss / 2, cy + ss / 2, ss / 2 - 1, 0, Math.PI * 2);
      if (isBooked) { ctx.fillStyle = C.red; ctx.fill(); }
      else { ctx.fillStyle = "#DCFCE7"; ctx.fill(); }
      // Border
      ctx.strokeStyle = isBooked ? "#991B1B" : "#22C55E";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Seat number
      ctx.fillStyle = isBooked ? C.white : C.primary;
      ctx.fillText(isBooked ? seatNums[i] : String(i + 1), cx + ss / 2, cy + ss / 2 + 3);
    }
    const lgY = y + totalH + 14;
    ctx.beginPath(); ctx.arc(sx + 14, lgY + 5, 5, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
    ctx.fillStyle = C.subtext;
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.fillText("= Booked", sx + 24, lgY + 9);
    ctx.beginPath(); ctx.arc(sx + 100, lgY + 5, 5, 0, Math.PI * 2); ctx.fillStyle = "#DCFCE7"; ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = C.subtext;
    ctx.fillText("= Available", sx + 110, lgY + 9);
    return lgY + 22;
  }

  function drawBus(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number, d: any, C: any) {
    const bx = RX + 12, bw = RWR - 24;
    const maxVW = bw - 10;
    const items: [string, string][] = [
      ["Bus Name", d.busName || d.scheduleName || "—"],
      ["Bus Type", d.busType || "—"],
      ["Bus Number", d.busNumber || "—"],
      ["Operator", d.operator || "—"],
    ];
    items.forEach(([label, val], i) => {
      ctx.fillStyle = C.text;
      ctx.font = "13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(label, bx, y + 16);
      ctx.textAlign = "right";
      ctx.font = "bold 13px Arial";
      ctx.fillStyle = i === 0 ? C.accent : (i === 1 ? C.blue : C.text);
      ctx.fillText(t(ctx, val, maxVW), bx + bw, y + 16);
      y += 24;
    });
    return y + 4;
  }

  function drawPayment(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number, d: any, C: any) {
    const bx = RX + 12, bw = RWR - 24;
    const maxVW = bw - 10;
    const items: [string, string][] = [
      ["Total Fare", "₹" + Number(d.totalAmount || 0).toLocaleString("en-IN")],
      ["Discount", "₹0"],
      ["Paid Amount", "₹" + Number(d.totalAmount || 0).toLocaleString("en-IN")],
      ["Payment Mode", "UPI"],
    ];
    items.forEach(([label, val], i) => {
      ctx.fillStyle = C.text;
      ctx.font = "13px Arial";
      ctx.textAlign = "left";
      ctx.fillText(label, bx, y + 9);
      ctx.textAlign = "right";
      ctx.font = i === 2 ? "bold 13px Arial" : "bold 13px Arial";
      ctx.fillStyle = i === 2 ? C.success : C.text;
      ctx.fillText(t(ctx, val, maxVW), bx + bw, y + 9);
      y += 22;
    });
    return y + 4;
  }

  function drawStatus(ctx: CanvasRenderingContext2D, RX: number, RWR: number, y: number, C: any) {
    ctx.fillStyle = C.success;
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "left";
    ctx.fillText("✓ CONFIRMED", RX + 12, y + 18);
    return y + 28;
  }

  // Handle email ticket via backend
  const handleEmailTicket = async () => {
    if (!confirmData?.bookingNumber || !confirmData?.customerEmail) {
      toast({ title: "Email Error", description: "No email address available for this booking.", variant: "destructive" });
      return;
    }
    setSendingEmail(true);
    try {
      await api.post(`/bookings/${confirmData.bookingNumber}/email-ticket`, {
        email: confirmData.customerEmail,
      });
      toast({ title: "Email Sent!", description: `Ticket sent to ${confirmData.customerEmail}`, variant: "default" });
    } catch {
      toast({ title: "Email Failed", description: "Could not send ticket via email. Please try downloading.", variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  if (searching || (expandedBus ? loadingScheduleDetails : false)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading schedule details...</p>
        </div>
      </div>
    );
  }

  if (!selectedSchedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="max-w-md p-6 bg-white rounded-2xl border border-slate-150 text-center shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Buses Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't retrieve any schedules for the route from {searchParams.from} to {searchParams.to} on {searchParams.date}.
          </p>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  // Format Date Helper
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      weekday: "long"
    });
  };

  // Structured timeline details dynamically
  const journeyStops = [
    {
      name: selectedSchedule.from,
      location: `${selectedSchedule.from} Central Terminal, Platform 1`,
      arrival: "—",
      departure: selectedSchedule.dep,
      badge: "Boarding / Start",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
      dotClass: "border-emerald-500",
      fare: selectedSchedule.fare,
      isBoardingOption: true,
    },
    ...(selectedSchedule.stops || []).map((stop: any) => {
      return {
        name: stop.stop_name,
        location: `${stop.stop_name} Bus Stand`,
        arrival: formatTime12h(stop.arrival_time),
        departure: formatTime12h(stop.departure_time),
        badge: "Boarding Only",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
        dotClass: "border-blue-500",
        fare: Number(stop.fare),
        isBoardingOption: true,
      };
    }),
    {
      name: selectedSchedule.to,
      location: `${selectedSchedule.to} Swargate Station, Main Exit`,
      arrival: selectedSchedule.arr,
      departure: "—",
      badge: "Dropping Only",
      badgeClass: "bg-red-50 text-red-700 border-red-100",
      dotClass: "border-red-500",
      isBoardingOption: false,
    }
  ];

  // Generate seat layout dynamically using the layout service
  const bus = seatDataResponse?.schedule?.bus;
  const effectiveSeats = seats.length > 0
    ? seats
    : SeatLayoutGeneratorService.generateMockSeats(bus?.total_seats || 52);
  const busRows = SeatLayoutGeneratorService.parseLayout(
    effectiveSeats,
    bus?.layout_type || "2+3 Sleeper",
    bus?.last_row_seats || 6,
    bus?.left_seats_per_row,
    bus?.right_seats_per_row
  );

  const bookedSeatsCount = seats.filter((s: any) => s.status === 'booked' || s.status === 'locked').length;
  const totalSeatsCount = seats.length || 52;
  const filledPercent = seats.length > 0 ? Math.round((bookedSeatsCount / totalSeatsCount) * 100) : 30;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-slate-800">
      
      {/* ═══ TOP NAVBAR HEADER ═══ */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 shadow-xs h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center justify-between w-full lg:w-auto lg:justify-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group text-sm font-semibold"
            >
              <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
              <span>Modify Search</span>
            </button>
            <div className="hidden lg:block w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2 cursor-pointer lg:order-none order-last" onClick={() => navigate("/")}>
              <img src="/logo.png" alt="Logo" className="h-14 object-contain" />
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1.5">
            {["Home", "Buses", "Routes", "Track Booking"].map((link, i) => (
              <button
                key={link}
                onClick={() => {
                  if (i === 0) navigate("/");
                  if (i === 1) navigate("/buses");
                  if (i === 2) navigate("/routes");
                  if (i === 3) navigate("/track");
                }}
                className={cn(
                  "px-4 py-2 text-sm font-bold transition-all duration-150 rounded-full",
                  i === 1 ? "text-blue-600 bg-blue-50" : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                )}
              >
                {link}
              </button>
            ))}
          </nav>

          <div className="hidden sm:block w-4" />
        </div>
      </header>

      {/* ═══ TOP HERO SECTION: ROUTE INFO & SELECTED BUS CARD ═══ */}
      <section className="bg-white border-b border-slate-100 py-6 sm:py-8 select-none relative overflow-hidden">
        {/* Decorative SVGs for background */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          {/* Route Title block */}
          <div className="text-left shrink-0 w-full md:w-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col gap-1"
            >
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {selectedSchedule.from}
                </span>
                <ArrowRight className="w-5 h-5 sm:w-7 sm:h-7 text-slate-300" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  {selectedSchedule.to}
                </span>
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {formatDisplayDate(selectedSchedule.date)}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm shadow-blue-50">
                  <Bus className="w-3.5 h-3.5" />
                  {schedules?.length || 0} Buses Available
                </div>
              </div>
            </motion.div>
          </div>

          {/* Selected Bus card widget */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full bg-white rounded-[24px] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 flex flex-col sm:flex-row items-center gap-6 justify-between group hover:border-blue-200 transition-all duration-300"
          >
            {/* Bus visual */}
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="w-28 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 select-none relative group-hover:shadow-lg transition-all duration-300">
                <img
                  src={getImageUrl(selectedSchedule.images, selectedSchedule.id)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "/bus-1.png"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base sm:text-lg truncate">{selectedSchedule.name}</h3>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-bold tracking-wide mt-1 uppercase">{selectedSchedule.type}</p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {selectedSchedule.amenities?.slice(0, 3).map((a: string) => (
                    <span key={a} className="text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{a}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timings row block */}
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-center px-4 py-3 sm:py-0 border-y sm:border-y-0 border-slate-100/60 bg-slate-50/50 sm:bg-transparent rounded-xl">
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{selectedSchedule.dep}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedSchedule.from.substring(0, 3)}</p>
              </div>
              <div className="flex flex-col items-center gap-1 min-w-[80px] sm:min-w-[100px] shrink-0">
                <span className="text-[10px] text-blue-600 font-black tracking-tighter bg-blue-50 px-2 py-0.5 rounded-full">{selectedSchedule.duration}</span>
                <div className="relative w-full h-px bg-slate-200">
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-slate-300 bg-white" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-slate-300 bg-white" />
                  <motion.div 
                    animate={{ x: [0, 80, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-0.5 bg-blue-500 rounded-full" 
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{selectedSchedule.arr}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedSchedule.to.substring(0, 3)}</p>
              </div>
            </div>

            {/* Price + View details CTA */}
            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="text-left sm:text-right">
                <div className="flex items-baseline sm:justify-end gap-0.5">
                  <span className="text-xs font-bold text-slate-400">₹</span>
                  <p className="text-2xl font-black text-slate-900">{selectedSchedule.fare}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 sm:justify-end">
                  <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-black text-amber-700">4.5</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">(120)</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(`/schedule/${selectedSchedule.id}`)}
                className="h-11 px-6 rounded-2xl border-blue-150 text-blue-600 font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100/50"
              >
                View Details
              </Button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ═══ DYNAMIC ROAD & BOOKING DETAILS INFOGRAPHIC SECTION ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 select-none">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          {/* Neon Glow Blobs */}
          <div className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Column 1: Capacity & Real-Time Booking Load */}
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl backdrop-blur-xs">
              {/* Circular progress SVG */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer Background Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.2"
                  />
                  {/* Active Progress Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.2"
                    strokeDasharray={`${filledPercent} ${100 - filledPercent}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-black tracking-tight text-white leading-none">{filledPercent}%</span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filled</span>
                </div>
              </div>

              {/* Booking status stats */}
              <div className="text-left space-y-1.5 flex-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  Live Load Tracking
                </div>
                <h3 className="text-base font-black text-slate-100">Seat Distribution</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10.5px] text-slate-300 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Avail: {totalSeatsCount - bookedSeatsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>Booked: {bookedSeatsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>Selected: {selectedSeats.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>Total: {totalSeatsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Animated Road Route Progress */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
                <span className="flex items-center gap-1 text-blue-400">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  {selectedSchedule.from} (Start)
                </span>
                <span className="text-slate-400 font-semibold">{selectedSchedule.duration} Journey</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Navigation className="w-3 h-3 text-emerald-500" />
                  {selectedSchedule.to} (End)
                </span>
              </div>

              {/* Road SVG */}
              <div className="bg-slate-950/20 border border-slate-800/40 rounded-xl p-3 relative h-20 flex items-center">
                <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="headlight-glow-infographic" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Road Asphalt Track */}
                  <path
                    id="infographic-road"
                    d="M 15,30 Q 110,12 200,30 T 385,30"
                    stroke="#1e293b"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Road Center Dash Lane Marker */}
                  <path
                    d="M 15,30 Q 110,12 200,30 T 385,30"
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeDasharray="4,6"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />

                  {/* Start Pin */}
                  <circle cx="15" cy="30" r="3" fill="#2563eb" />
                  <circle cx="15" cy="30" r="6" stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.5">
                    <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* End Pin */}
                  <circle cx="385" cy="30" r="3" fill="#10b981" />
                  <circle cx="385" cy="30" r="6" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.5">
                    <animate attributeName="r" values="3;7;3" dur="2s" repeatCount="indefinite" />
                  </circle>

                  {/* Dynamic intermediate stop dots along the path */}
                  {selectedSchedule.stops?.slice(0, 3).map((stop: any, idx: number) => {
                    const xPositions = [110, 200, 290];
                    const yPositions = [20, 30, 40];
                    return (
                      <g key={idx}>
                        <circle cx={xPositions[idx]} cy={yPositions[idx]} r="2.5" fill="#f59e0b" />
                        <title>{stop.stop_name} (Arr: {stop.arrival_time})</title>
                      </g>
                    );
                  })}

                  {/* Animated top-down Bus shape following the road */}
                  <g>
                    <path d="M 8,0 L 22,-6 L 22,6 Z" fill="url(#headlight-glow-infographic)" opacity="0.35" />
                    <rect x="-8" y="-4" width="16" height="8" rx="1.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="0.7" />
                    <rect x="4" y="-3" width="2" height="6" rx="0.5" fill="#93c5fd" />
                    <rect x="-7" y="-3" width="1.5" height="6" rx="0.5" fill="#93c5fd" />
                    <rect x="-3" y="-3" width="2" height="0.8" fill="#93c5fd" opacity="0.8" />
                    <rect x="0" y="-3" width="2" height="0.8" fill="#93c5fd" opacity="0.8" />
                    <rect x="-3" y="2.2" width="2" height="0.8" fill="#93c5fd" opacity="0.8" />
                    <rect x="0" y="2.2" width="2" height="0.8" fill="#93c5fd" opacity="0.8" />
                    <circle cx="8" cy="-2" r="0.6" fill="#eab308" />
                    <circle cx="8" cy="2" r="0.6" fill="#eab308" />
                    <animateMotion
                      dur="10s"
                      repeatCount="indefinite"
                      rotate="auto"
                      path="M 15,30 Q 110,12 200,30 T 385,30"
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Column 3: Live Coach Details & Safety */}
            <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl backdrop-blur-xs justify-between">
              <div className="text-left space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                  <Shield className="w-3.5 h-3.5" />
                  Premium Class Service
                </div>
                <h4 className="text-sm font-black text-slate-100">{selectedSchedule.name}</h4>
                <div className="flex flex-col gap-1 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" /> Free High-Speed Wi-Fi
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Air Suspension Equipped
                  </span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-purple-500" /> GPS Real-time Tracking
                  </span>
                </div>
              </div>

              {/* Side view bus SVG */}
              <div className="w-24 h-16 flex items-center justify-center shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 100 45" className="w-full h-full">
                  <defs>
                    <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="window-glass-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="100%" stopColor="#bae6fd" />
                    </linearGradient>
                  </defs>
                  {/* Road speed line */}
                  <line x1="2" y1="38" x2="98" y2="38" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="5,3" />
                  
                  {/* Bus Body */}
                  <path d="M12,12 L84,12 C88,12 91,15 92,19 L94,27 C95,31 93,35 88,35 L12,35 C8,35 6,32 5,28 L5,19 C5,15 8,12 12,12 Z" fill="url(#neon-glow)" />
                  
                  {/* Windshield */}
                  <path d="M85,14 L91,19 C92,20 92,22 91,24 L86,24 Z" fill="url(#window-glass-glow)" opacity="0.9" stroke="#0284c7" strokeWidth="0.4" />
                  
                  {/* Windows */}
                  <rect x="14" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />
                  <rect x="25" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />
                  <rect x="36" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />
                  <rect x="47" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />
                  <rect x="58" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />
                  <rect x="69" y="15" width="9" height="7" rx="1" fill="url(#window-glass-glow)" stroke="#0284c7" strokeWidth="0.4" />

                  {/* Passenger Entry Folding Glass Door */}
                  <rect x="80" y="15" width="4.5" height="19.5" rx="0.5" fill="url(#window-glass-glow)" stroke="#ffffff" strokeWidth="0.5" />
                  <line x1="82.25" y1="15" x2="82.25" y2="34.5" stroke="#ffffff" strokeWidth="0.5" />

                  {/* Headlights and Taillights */}
                  <path d="M94,28 L95,29 C95,29.5 94.5,30 94,30 Z" fill="#fbbf24" opacity="0.9" />
                  <path d="M5,28 L4,29 C4,29.5 4.5,30 5,30 Z" fill="#ef4444" opacity="0.9" />

                  {/* Wheels */}
                  <circle cx="25" cy="35" r="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="25" cy="35" r="2" fill="#94a3b8" />
                  <circle cx="72" cy="35" r="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="72" cy="35" r="2" fill="#94a3b8" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ THREE COLUMN MAIN LAYOUT ═══ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: JOURNEY DETAILS */}
          <div className="hidden lg:flex bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex-col h-full justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Journey Details
              </h3>

              {/* Dynamic Timeline Wrapper */}
              <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
                {journeyStops.map((stop, sIdx) => {
                  const isSelected = boardingPoint === stop.name;
                  const canSelect = stop.isBoardingOption;

                  return (
                    <div key={sIdx} className="relative">
                      {/* Circle Pin */}
                      <div
                        className={cn(
                          "absolute -left-[20px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all z-10",
                          isSelected
                            ? "border-blue-600 bg-blue-600 ring-4 ring-blue-100 scale-110 z-20"
                            : stop.dotClass || "border-slate-300"
                        )}
                      />
                      
                      {/* Grid card content */}
                      <button
                        type="button"
                        disabled={!canSelect}
                        onClick={() => canSelect && setBoardingPoint(stop.name)}
                        className={cn(
                          "w-full flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-150 select-none",
                          canSelect
                            ? isSelected
                              ? "border-blue-500 bg-blue-50/30 shadow-xs ring-2 ring-blue-100/50"
                              : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 cursor-pointer"
                            : "border-slate-100 bg-slate-50/20 opacity-80 cursor-default"
                        )}
                      >
                        {/* Row 1: Name and Timing/Badge info */}
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className={cn("text-xs sm:text-sm font-black truncate", 
                              isSelected 
                                ? "text-blue-700 font-extrabold" 
                                : sIdx === 0 
                                  ? "text-blue-600" 
                                  : sIdx === journeyStops.length - 1 
                                    ? "text-emerald-600" 
                                    : "text-slate-800"
                            )}>
                              {stop.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] font-black shrink-0 leading-none">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                              <span>{stop.departure !== "—" ? "Dep:" : "Arr:"}</span>
                              <span className={cn("font-black", 
                                sIdx === 0 
                                  ? "text-blue-600" 
                                  : sIdx === journeyStops.length - 1 
                                    ? "text-emerald-600" 
                                    : "text-indigo-600"
                              )}>{stop.departure !== "—" ? stop.departure : stop.arrival}</span>
                            </div>
                            <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border shrink-0", stop.badgeClass)}>
                              {stop.badge}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Location and Fare */}
                        <div className="flex items-center justify-between w-full gap-3 text-[10px] border-t border-slate-100/60 pt-2 mt-0.5">
                          <span className="text-slate-400 font-medium truncate flex-1">
                            {stop.location}
                          </span>
                          
                          {stop.fare !== undefined && (
                            <span className={cn(
                              "font-black px-2 py-0.5 rounded border leading-none shrink-0",
                              isSelected 
                                ? "bg-blue-600 border-blue-700 text-white shadow-xs" 
                                : "bg-blue-50/60 border-blue-100 text-blue-600"
                            )}>
                              Fare: ₹{stop.fare}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline bottom advisory note */}
            <div className="mt-6 p-3.5 bg-blue-50/40 border border-blue-100 rounded-xl flex items-start gap-2 text-[10px] text-slate-500 font-bold leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>Note: Times are approximate and may vary due to traffic and road conditions.</p>
            </div>
          </div>

          {/* COLUMN 2: BOOKING SUMMARY */}
          <div className="hidden lg:flex bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex-col h-fit">
            <div className="space-y-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                Booking Summary
              </h3>

              {/* Operator Circle branding */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-black shrink-0">
                  {selectedSchedule.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-blue-600">{selectedSchedule.name}</h4>
                  <p className="text-[10.5px] text-emerald-600 font-bold tracking-wide mt-0.5">{selectedSchedule.type}</p>
                </div>
              </div>

              {/* Small timeline */}
              <div className="space-y-3 py-1">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-black text-blue-600 w-16">{boardingTime}</span>
                  <span className="font-semibold text-slate-500 truncate">{boardingLocation} Bus Stand</span>
                </div>
                <div className="ml-1 border-l border-dashed border-slate-300 h-4" />
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                  <span className="font-black text-emerald-600 w-16">{selectedSchedule.arr}</span>
                  <span className="font-semibold text-slate-500 truncate">{selectedSchedule.to} Terminal</span>
                </div>
              </div>

              {/* Metadata listing grid */}
              <div className="space-y-2.5 py-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Date</span>
                  <span className="text-violet-600 font-black">{formatDisplayDate(selectedSchedule.date)}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Bus</span>
                  <span className="text-blue-600 font-black">{selectedSchedule.name}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Boarding Point</span>
                  <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded">
                    {boardingLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-400">Seats</span>
                  <span className="text-blue-600 font-black bg-blue-50 px-2 py-0.5 rounded">
                    {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None selected"}
                  </span>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Base Fare ({selectedSeats.length} × ₹{farePerSeat})</span>
                  <span className="text-indigo-600 font-black">₹{baseFare}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm font-black text-slate-900">Total Amount</span>
                  <span className="text-xl font-extrabold text-blue-600">₹{totalFare}</span>
                </div>
              </div>
            </div>

            {/* CTA Continue Booking and trust factor labels */}
            <div className="space-y-4 pt-6">
              <Button
                onClick={() => setIsPassengerModalOpen(true)}
                disabled={selectedSeats.length === 0}
                className="w-full h-11 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 shadow-lg shadow-blue-100 transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
              >
                Continue to Book
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="grid grid-cols-2 gap-2 text-[9.5px] font-bold text-slate-400 select-none border-t border-slate-100 pt-4">
                {[
                  { icon: Shield, label: "Secure & Safe Booking", col: "text-blue-600" },
                  { icon: Headphones, label: "24/7 Customer Support", col: "text-purple-600" },
                  { icon: RotateCcw, label: "Easy Cancellation", col: "text-orange-500" },
                  { icon: Lock, label: "Secure Payments", col: "text-pink-600" },
                  { icon: CheckCircle, label: "Best Price Guarantee", col: "text-emerald-600" },
                  { icon: CreditCard, label: "Multiple Payment Options", col: "text-cyan-600" },
                ].map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <IconComponent className={cn("w-3.5 h-3.5", item.col)} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 3: SELECT YOUR SEATS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col justify-between h-full">
            <div>
              {/* Header and Seat Price Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-600 rounded-full" />
                  Select Your Seats
                </h3>
                <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                  ₹{farePerSeat}.00 per seat
                </span>
              </div>

              {/* Mobile Only: View Journey Details Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setIsJourneyModalOpen(true)}
                  className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-300 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center animate-bounce-slow">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Journey Info</p>
                        <p className="text-sm font-black tracking-tight">View Journey Details</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Mobile Only: Selected Boarding Point Info Card */}
              <AnimatePresence mode="wait">
                {boardingPoint && (
                  <motion.div
                    key={boardingPoint}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="lg:hidden mb-6 overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
                      {/* Decorative background circle */}
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-200/20 rounded-full blur-2xl group-hover:bg-blue-300/30 transition-colors" />
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-200">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Selected Boarding Point</p>
                          <p className="text-sm font-black text-slate-900 leading-tight">{boardingPoint}</p>
                        </div>
                      </div>
                      
                      <div className="text-right relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fare</p>
                        <div className="flex items-baseline justify-end gap-0.5">
                          <span className="text-xs font-bold text-blue-600">₹</span>
                          <span className="text-xl font-black text-blue-600 tracking-tight">{farePerSeat}</span>
                          <span className="text-[9px] font-bold text-slate-400 ml-0.5">/seat</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend status indicators */}
              <div className="flex items-center gap-3.5 mb-5 flex-wrap border-b border-slate-100 pb-4 select-none">
                {[
                  { label: "Available", bg: "bg-emerald-500 border-emerald-600" },
                  { label: "Selected", bg: "bg-blue-600 border-blue-700" },
                  { label: "Locked", bg: "bg-orange-500 border-orange-600" },
                  { label: "Booked", bg: "bg-red-600 border-red-700" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
                    <div className={cn("w-3.5 h-3.5 rounded-sm border", item.bg)} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              {/* Custom Bus Seat layout box */}
              <div className="flex justify-center select-none py-1">
                {loadingSeats ? (
                  <div className="p-12 text-center text-xs text-slate-400 font-bold">Loading seat layout...</div>
                ) : (
                  <div className="relative bg-slate-50 border-4 border-slate-700 p-5 pt-8 rounded-t-[50px] rounded-b-[24px] w-full max-w-[310px] flex flex-col justify-between shadow-xl">
                    
                    {/* Bus Exterior Side Mirrors */}
                    <div className="absolute -left-5 top-8 z-30 flex items-end gap-0">
                      <div className="w-1.5 h-7 bg-slate-700 rounded-l-sm" />
                      <div className="w-6 h-6 bg-gradient-to-br from-sky-300 to-sky-100 border-2 border-slate-600 rounded-md shadow-lg flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-sm bg-white/30" />
                      </div>
                    </div>
                    <div className="absolute -right-5 top-8 z-30 flex items-end gap-0">
                      <div className="w-1.5 h-7 bg-slate-700 rounded-r-sm" />
                      <div className="w-6 h-6 bg-gradient-to-br from-sky-300 to-sky-100 border-2 border-slate-600 rounded-md shadow-lg flex items-center justify-center">
                        <div className="w-3.5 h-3.5 rounded-sm bg-white/30" />
                      </div>
                    </div>

                    {/* Passenger Entry Glass Door (Left side, front) - Centered on border */}
                    <div 
                      className="absolute top-[66px] w-2.5 h-11 bg-slate-800 border border-slate-700 rounded-sm flex flex-col justify-between p-0.5 z-30 shadow-md"
                      style={{ left: "-7px" }}
                    >
                      <div className="h-[18px] w-full bg-gradient-to-b from-sky-300 to-sky-100 border border-slate-500 rounded-xs" />
                      <div className="h-[18px] w-full bg-gradient-to-b from-sky-300 to-sky-100 border border-slate-500 rounded-xs" />
                    </div>

                    {/* Driver Door Panel (Right side, front) - Centered on border */}
                    <div 
                      className="absolute top-[66px] w-2.5 h-10 bg-slate-800 border border-slate-700 rounded-sm z-30 shadow-md" 
                      style={{ right: "-7px" }}
                    />

                    {/* Side Passenger Windows - Centered on border */}
                    {[120, 185, 250, 315, 380, 445, 510].map((topPos) => (
                      <React.Fragment key={topPos}>
                        {/* Left Side Window */}
                        <div 
                          className="absolute w-2.5 h-12 bg-gradient-to-b from-sky-300/90 to-sky-100/90 border border-slate-700 rounded-xs z-30 shadow-xs transition-colors hover:from-sky-200 hover:to-white" 
                          style={{ left: "-7px", top: `${topPos}px` }} 
                        />
                        {/* Right Side Window */}
                        <div 
                          className="absolute w-2.5 h-12 bg-gradient-to-b from-sky-300/90 to-sky-100/90 border border-slate-700 rounded-xs z-30 shadow-xs transition-colors hover:from-sky-200 hover:to-white" 
                          style={{ right: "-7px", top: `${topPos}px` }} 
                        />
                      </React.Fragment>
                    ))}

                    {/* Bus Wheels */}
                    <div className="absolute -left-2.5 top-[100px] w-2 h-10 bg-slate-900 rounded-l border-r border-slate-700" />
                    <div className="absolute -right-2.5 top-[100px] w-2 h-10 bg-slate-900 rounded-r border-l border-slate-700" />
                    <div className="absolute -left-2.5 bottom-[80px] w-2 h-12 bg-slate-900 rounded-l border-r border-slate-700" />
                    <div className="absolute -right-2.5 bottom-[80px] w-2 h-12 bg-slate-900 rounded-r border-l border-slate-700" />

                    {/* Front Headlights */}
                    <div className="absolute left-5 top-1.5 w-3 h-1 bg-yellow-300 rounded-full rotate-[15deg] shadow-md shadow-yellow-200" />
                    <div className="absolute right-5 top-1.5 w-3 h-1 bg-yellow-300 rounded-full -rotate-[15deg] shadow-md shadow-yellow-200" />

                    {/* Windshield glass */}
                    <div className="w-full h-7 bg-gradient-to-b from-sky-900 to-slate-900 rounded-t-[36px] border-b border-slate-700 flex items-center justify-center mb-3 relative overflow-hidden shrink-0">
                      <div className="absolute bottom-0 left-1/3 w-6 h-0.5 bg-slate-400 origin-bottom-right rotate-[20deg]" />
                      <div className="absolute bottom-0 right-1/3 w-6 h-0.5 bg-slate-400 origin-bottom-left -rotate-[20deg]" />
                    </div>

                    {/* Top deck controls: Driver cabin with steering, seat & gear */}
                    <div className="grid grid-cols-2 gap-3 mb-4 select-none">
                      {/* Conductor (Left side) */}
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200/80 bg-white shadow-xs">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">CONDUCTOR</span>
                      </div>
                      {/* Driver Cabin (Right side) */}
                      <div className="relative py-2.5 px-2 rounded-xl border border-slate-200/80 bg-white shadow-xs flex flex-col items-center gap-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          {/* Driver Seat */}
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="6" y="8" width="12" height="10" rx="2" />
                            <rect x="8" y="10" width="3" height="3" rx="0.5" />
                            <line x1="6" y1="18" x2="5" y2="22" />
                            <line x1="18" y1="18" x2="19" y2="22" />
                            <rect x="4" y="7" width="16" height="2" rx="1" />
                          </svg>
                          {/* Large Realistic Steering Wheel */}
                          <motion.svg
                            animate={{ rotate: [0, -12, 0, 12, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            viewBox="0 0 48 48" className="w-9 h-9 text-slate-800 shrink-0 drop-shadow-sm"
                            fill="none"
                          >
                            {/* Outer rim */}
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" />
                            {/* Inner rim */}
                            <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                            {/* Top spoke */}
                            <line x1="24" y1="4" x2="24" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            {/* Bottom right spoke */}
                            <line x1="24" y1="24" x2="38" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            {/* Bottom left spoke */}
                            <line x1="24" y1="24" x2="10" y2="34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            {/* Center hub */}
                            <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.15" />
                            <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3" />
                            <circle cx="24" cy="24" r="1.5" fill="currentColor" />
                            {/* Grip texture dots on outer rim */}
                            <circle cx="24" cy="5" r="1" fill="currentColor" opacity="0.4" />
                            <circle cx="24" cy="43" r="1" fill="currentColor" opacity="0.4" />
                            <circle cx="5" cy="24" r="1" fill="currentColor" opacity="0.4" />
                            <circle cx="43" cy="24" r="1" fill="currentColor" opacity="0.4" />
                          </motion.svg>
                          {/* Gear Box */}
                          <svg viewBox="0 0 20 24" className="w-4 h-6 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="4" y="2" width="12" height="18" rx="2.5" />
                            <rect x="6" y="4" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <rect x="11" y="4" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <rect x="6" y="8" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <rect x="11" y="8" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <rect x="6" y="12" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <rect x="11" y="12" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.4" />
                            <circle cx="10" cy="17" r="2" fill="currentColor" opacity="0.6" />
                          </svg>
                        </div>
                        <span className="text-[9px] font-black text-slate-600 tracking-wider uppercase">DRIVER</span>
                      </div>
                    </div>
                    
                    {/* Horizontal cabin barrier partition */}
                    <div className="h-[2px] bg-slate-800 rounded-full mb-4 opacity-90" />

                    {/* Seat Rows mapping - 2+3 layout with aisle */}
                    <div className="space-y-1.5">
                      {busRows.map((rowObj) => {
                        const renderSeatButton = (seat: any) => {
                          const isSelected = selectedSeats.includes(seat.seat_number);
                          const isBooked = seat.status === 'booked';
                          const isLocked = seat.status === 'locked';
                          const isAvailable = !isBooked && !isLocked && !isSelected;

                          return (
                            <button
                              type="button"
                              onClick={() => toggleSeat(seat.seat_number)}
                              disabled={isBooked || isLocked}
                              className={cn(
                                "w-8.5 h-8.5 rounded-lg text-[9.5px] font-black transition-all flex items-center justify-center border",
                                isAvailable && "bg-emerald-500 border-emerald-600 text-white hover:scale-105 active:scale-95 cursor-pointer",
                                isSelected && "bg-blue-600 border-blue-700 text-white hover:scale-105 active:scale-95 shadow-md cursor-pointer",
                                isBooked && "bg-red-600 border-red-700 text-white cursor-not-allowed",
                                isLocked && "bg-orange-500 border-orange-600 text-white cursor-not-allowed"
                              )}
                            >
                              {seat.seat_number}
                            </button>
                          );
                        };

                        if (rowObj.isLastRow) {
                          const lastRowSeats = rowObj.lastRowSeats || [];
                          return (
                            <div key={rowObj.rowLabel} className="flex flex-col gap-1.5 mt-2">
                              {/* Dynamic Seats Row */}
                              <div className="flex items-center gap-2">
                                {/* Row Label L */}
                                <span className="w-5 text-[11px] font-black text-slate-400 text-left shrink-0">
                                  {rowObj.rowLabel}
                                </span>
                                <div className="flex gap-1 flex-1 justify-between">
                                  {lastRowSeats.map((seat) => renderSeatButton(seat))}
                                </div>
                              </div>
                              {/* Sub-label underneath */}
                              <div className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {lastRowSeats.length} Seater (Last Row)
                              </div>
                            </div>
                          );
                        }

                        const leftSeats = rowObj.leftSeats || [];
                        const rightSeats = rowObj.rightSeats || [];

                        return (
                          <div key={rowObj.rowLabel} className="flex items-center gap-2">
                            {/* Row Number */}
                            <span className="w-5 text-[11px] font-black text-slate-400 text-left shrink-0">
                              {rowObj.rowLabel}
                            </span>

                            {/* Left Side Seats */}
                            <div className="flex gap-1.5">
                              {leftSeats.map((seat) => renderSeatButton(seat))}
                            </div>
                            
                            {/* Center Aisle space */}
                            <div className="flex-1 min-w-[12px]" />
                            
                            {/* Right Side Seats */}
                            <div className="flex gap-1.5">
                              {rightSeats.map((seat) => renderSeatButton(seat))}
                            </div>
                          </div>
                        );
                      })}
                    </div>



                    {/* Mobile Only: OK and GO Button */}
                    {selectedSeats.length > 0 && (
                      <div className="lg:hidden mt-6 px-2">
                        <button
                          onClick={() => setIsSummaryModalOpen(true)}
                          className=                        "w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 animate-in fade-in zoom-in duration-300"
                        >
                          OK and GO
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Rear Bumper & Taillights */}
                    <div className="absolute left-6 -bottom-0.5 w-4 h-1.5 bg-red-600 rounded-t-sm shadow-md shadow-red-500/50" />
                    <div className="absolute right-6 -bottom-0.5 w-4 h-1.5 bg-red-600 rounded-t-sm shadow-md shadow-red-500/50" />
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-20 h-1 bg-slate-800 rounded-t-sm" />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ═══ FOOTER FEATURES VALUES BAR ═══ */}
      <section className="bg-white border-t border-slate-100 py-6 mt-6 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {[
              { title: "Live Tracking", desc: "Track your bus in real-time", icon: MapPin, col: "text-emerald-500" },
              { title: "On-Time Guarantee", desc: "We value your time", icon: Clock, col: "text-blue-500" },
              { title: "Customer First", desc: "We're here to help you", icon: Headphones, col: "text-purple-500" },
              { title: "Safe & Reliable Travel", desc: "Your safety is our priority", icon: Shield, col: "text-indigo-500" },
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div key={idx} className="flex items-center gap-3 justify-start md:justify-center">
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                    <StatIcon className={cn("w-4.5 h-4.5", stat.col)} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-900 leading-none">{stat.title}</span>
                    <span className="text-[9.5px] font-bold text-slate-400 mt-1 leading-none">{stat.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ BASE COPYRIGHT FOOTER ═══ */}
      <footer className="bg-slate-900 text-slate-400 py-6 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-7 object-contain" />
          </div>
          <div className="text-[10px] text-slate-500 font-semibold flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>© 2026 BusBook.</span>
            <button onClick={() => navigate("/terms")} className="hover:text-white underline underline-offset-2">Terms</button>
            <button onClick={() => navigate("/privacy")} className="hover:text-white underline underline-offset-2">Privacy</button>
            <span>Refund Policy</span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <a href="tel:+918092000025" className="hover:text-white">8092000025</a>
            </span>
            <span className="flex items-center gap-1">
              <a href="tel:+919991600025" className="hover:text-white">9991600025</a>
            </span>
            <span className="flex items-center gap-1">
              <a href="tel:+919996021425" className="hover:text-white">9996021425</a>
            </span>
            <span className="flex items-center gap-1">
              <a href="tel:+918481000025" className="hover:text-white">8481000025</a>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold">
            <Shield className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
            <span>Secure & Verified Checkout</span>
          </div>
        </div>
      </footer>

      {/* ═══ PASSENGER DETAILS FORM MODAL ═══ */}
      <Dialog open={isPassengerModalOpen} onOpenChange={setIsPassengerModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white border border-slate-150 p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Passenger Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-bold mt-1">
              Please enter checkout info for selected seats: {selectedSeats.join(", ")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4 mt-3">
            {/* Customer name */}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="cust_name" className="text-xs font-black text-slate-600">Customer Name</Label>
              <Input
                id="cust_name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter full name"
                className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <Label htmlFor="cust_email" className="text-xs font-black text-slate-600">Email Address</Label>
                <Input
                  id="cust_email"
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cust_phone" className="text-xs font-black text-slate-600">Mobile Number</Label>
                <Input
                  id="cust_phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Unique passenger name for each seat */}
            <div className="border-t border-slate-100 pt-3 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Seat Occupant Names</span>
              
              <div className="max-h-[200px] overflow-y-auto space-y-3 pr-1.5 scrollbar-thin">
                {selectedSeats.map((seatNumber) => (
                  <div key={seatNumber} className="flex items-center gap-2">
                    <span className="w-14 text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1.5 rounded-lg text-center shrink-0">
                      {seatNumber}
                    </span>
                    <Input
                      required
                      placeholder="Passenger name"
                      value={passengerNames[seatNumber] || ""}
                      onChange={(e) => setPassengerNames({ ...passengerNames, [seatNumber]: e.target.value })}
                      className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 flex-1 min-w-0"
                    />
                    <div className="relative w-20 shrink-0">
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        required
                        placeholder="Age"
                        value={passengerAges[seatNumber] || ""}
                        onChange={(e) => setPassengerAges({ ...passengerAges, [seatNumber]: Number(e.target.value) })}
                        className="h-9 text-xs rounded-xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 pl-6"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">Yr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer submit buttons */}
            <DialogFooter className="pt-3 border-t border-slate-100 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPassengerModalOpen(false)}
                className="h-9 text-xs font-bold rounded-xl border-slate-200 text-slate-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBookingMutation.isPending || processingPayment}
                className="h-9 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-100"
              >
                {processingPayment ? "Processing Payment..." : createBookingMutation.isPending ? "Confirming..." : "Confirm & Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ MOBILE JOURNEY DETAILS POPUP ═══ */}
      <Dialog open={isJourneyModalOpen} onOpenChange={setIsJourneyModalOpen}>
        <DialogContent className="max-w-[95%] sm:max-w-[450px] rounded-3xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-200" />
                Journey Details
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-xs font-bold opacity-90">
                Route timeline and boarding points
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div className="relative pl-7 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {journeyStops.map((stop, sIdx) => {
                const isSelected = boardingPoint === stop.name;
                const canSelect = stop.isBoardingOption;

                return (
                  <div key={sIdx} className="relative">
                    <div className={cn(
                      "absolute -left-[20px] top-4 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all z-10",
                      isSelected ? "border-blue-600 bg-blue-600 ring-4 ring-blue-100 scale-110" : stop.dotClass || "border-slate-300"
                    )} />
                    
                    <button
                      type="button"
                      disabled={!canSelect}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (canSelect) {
                          setBoardingPoint(stop.name);
                          toast({
                            title: "Boarding Point Selected",
                            description: `${stop.name} has been set as your boarding point.`,
                          });
                        }
                      }}
                      className={cn(
                        "w-full flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 text-left relative z-20",
                        canSelect
                          ? isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100"
                            : "border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50 cursor-pointer shadow-sm active:bg-blue-50"
                          : "border-slate-50 bg-slate-50/10 opacity-60 cursor-default"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-black truncate", isSelected ? "text-blue-700" : "text-slate-800")}>
                            {stop.name}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                            </div>
                          )}
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0", stop.badgeClass)}>
                          {stop.badge}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold border-t border-slate-100/60 pt-2">
                        <span>{stop.location}</span>
                        <span className={cn("font-black shrink-0", isSelected ? "text-blue-600" : "text-indigo-600")}>
                          {stop.departure !== "—" ? stop.departure : stop.arrival}
                        </span>
                      </div>
                      {stop.isBoardingOption && stop.fare !== undefined && (
                        <div className="flex items-center justify-between text-[10px] mt-1.5">
                          <span className="text-slate-400 font-semibold">Fare from here</span>
                          <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            ₹{Number(stop.fare).toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <Button 
              onClick={() => setIsJourneyModalOpen(false)}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-100"
            >
              Got it, Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ MOBILE BOOKING SUMMARY POPUP ═══ */}
      <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
        <DialogContent className="max-w-[95%] sm:max-w-[450px] rounded-3xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-200" />
                Booking Summary
              </DialogTitle>
              <DialogDescription className="text-emerald-100 text-xs font-bold opacity-90">
                Review your selections before checkout
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Operator Branding */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-orange-100">
                {selectedSchedule.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">{selectedSchedule.name}</h4>
                <p className="text-xs text-emerald-600 font-bold">{selectedSchedule.type}</p>
              </div>
            </div>

            {/* Journey Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Boarding</p>
                <p className="text-sm font-black text-slate-800">{boardingLocation}</p>
                <p className="text-[11px] font-bold text-blue-600">{boardingTime}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dropping</p>
                <p className="text-sm font-black text-slate-800">{selectedSchedule.to}</p>
                <p className="text-[11px] font-bold text-emerald-600">{selectedSchedule.arr}</p>
              </div>
            </div>

            {/* Selection Details */}
            <div className="space-y-3 py-4 border-y border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Date of Journey</span>
                <span className="text-slate-900">{formatDisplayDate(selectedSchedule.date)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Selected Seats</span>
                <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {selectedSeats.join(", ")}
                </span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Base Fare ({selectedSeats.length} Seats)</span>
                <span className="text-slate-800">₹{baseFare}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-200 mt-2">
                <span className="text-sm font-black text-slate-900">Total Payable</span>
                <span className="text-xl font-black text-blue-600">₹{totalFare}</span>
              </div>
            </div>

            <Button
              onClick={() => {
                setIsSummaryModalOpen(false);
                setIsPassengerModalOpen(true);
              }}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group transition-all"
            >
              Continue to Passenger Details
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ BOOKING CONFIRMATION POPUP — ANIMATED TICKET/INVOICE ═══ */}
      <Dialog open={isConfirmOpen} onOpenChange={(open) => { if (!open) setIsConfirmOpen(false); }}>
        <DialogContent className="max-w-[95%] sm:max-w-[520px] max-h-[85vh] sm:max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-0 border-none shadow-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent">
          {confirmData && (
            <>
              {/* TICKET REF — captured for download */}
              <div ref={ticketRef} className="bg-white">
                {/* ── Ticket Header ── */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-6 py-5 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative"
                  >
                    {/* Bhinder Logo */}
                    <div className="flex items-center justify-center gap-2.5 mb-2">
                      <svg viewBox="0 0 40 40" className="w-9 h-9 sm:w-10 sm:h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="10" fill="white" opacity="0.2" />
                        <path d="M12 14h16v12H12z" fill="white" opacity="0.9" />
                        <rect x="14" y="16" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" />
                        <rect x="21" y="16" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" />
                        <rect x="14" y="20" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" />
                        <rect x="21" y="20" width="5" height="3" rx="0.5" fill="#3b82f6" opacity="0.4" />
                        <circle cx="14" cy="26" r="2" fill="white" opacity="0.8" />
                        <circle cx="26" cy="26" r="2" fill="white" opacity="0.8" />
                        <rect x="28" y="16" width="3" height="8" rx="1" fill="white" opacity="0.6" />
                      </svg>
                      <div className="text-left">
                        <p className="text-base sm:text-lg font-black text-white tracking-tight leading-none">Bhinder Bus Service</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-blue-200 tracking-wider mt-0.5">TRAVEL WITH COMFORT</p>
                      </div>
                    </div>
                    <div className="w-12 h-0.5 bg-white/30 rounded-full mx-auto mb-2" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-black tracking-wider"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      BOOKING CONFIRMED
                    </motion.div>
                    <p className="text-[10px] font-bold text-blue-200 mt-1.5">Booking #{confirmData.bookingNumber}</p>
                  </motion.div>
                </div>

                {/* ── Perforated Tear Line ── */}
                <div className="relative">
                  <div className="absolute inset-x-0 top-0 flex justify-between px-2 -translate-y-1/2">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-[#F8FAFC]" />
                    ))}
                  </div>
                  <div className="border-t-2 border-dashed border-slate-300 mx-6" />
                </div>

                {/* ── Ticket Body ── */}
                <div className="px-4 py-3 space-y-3">

                  {/* Journey Route — From → To */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200"
                  >
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">From</p>
                      <p className="text-sm font-black text-slate-800 truncate">{confirmData.routeFrom || confirmData.boardingLocation}</p>
                      <p className="text-[11px] font-bold text-blue-600 mt-0.5">{confirmData.depTime || confirmData.boardingTime}</p>
                    </div>
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-14 h-px border-t border-dashed border-blue-300 relative">
                        <Bus className="w-3 h-3 text-blue-500 absolute -top-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 mt-1">{selectedSchedule?.duration || "—"}</span>
                    </div>
                    <div className="text-right flex-1 min-w-0">
                      <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">To</p>
                      <p className="text-sm font-black text-slate-800 truncate">{confirmData.routeTo || confirmData.destination}</p>
                      <p className="text-[11px] font-bold text-emerald-600 mt-0.5">{confirmData.arrTimeFull || confirmData.arrivalTime}</p>
                    </div>
                  </motion.div>

                  {/* Boarding Point */}
                  {confirmData.boardingPoint && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.33 }}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Boarding Point</p>
                        <p className="text-xs font-black text-slate-800 truncate">{confirmData.boardingPoint}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-bold text-amber-600">{confirmData.boardingTime || ""}</p>
                        <p className="text-[10px] font-bold text-emerald-600">
                          ₹{Number(
                            (confirmData.stops || []).find((s: any) => s.stop_name === confirmData.boardingPoint)?.fare || confirmData.fare || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Date & Bus Info Row */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Journey Date</p>
                        <p className="text-xs font-black text-slate-800">{confirmData.journeyDate ? formatDisplayDate(confirmData.journeyDate) : confirmData.scheduleDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seats</p>
                        <p className="text-xs font-black text-blue-600">{confirmData.seatNumbers.join(", ")}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bus Details */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center shrink-0">
                        <Bus className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-purple-500 uppercase tracking-wider">Bus Details</p>
                        <p className="text-xs font-black text-slate-800 truncate">
                          {confirmData.operator || "BusBook Express"} · {confirmData.busName || confirmData.scheduleName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {confirmData.busNumber ? `#${confirmData.busNumber}` : ""} {confirmData.busType ? `· ${confirmData.busType}` : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Passenger Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Passengers</span>
                      <span className="text-[9px] font-bold text-white bg-blue-500 px-2 py-0.5 rounded-full">{confirmData.passengers.length}</span>
                    </div>
                    <div className="space-y-1.5">
                      {confirmData.passengers.map((p: any, idx: number) => (
                        <motion.div
                          key={p.seat_number}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.06 }}
                          className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-sm"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm">
                            {String(p.name).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">Age: {p.age} yrs</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Seat</p>
                            <p className="text-xs font-black text-white bg-blue-600 px-2 py-0.5 rounded-lg">{p.seat_number}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Customer Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Booked by</p>
                      <p className="text-xs font-black text-slate-800">{confirmData.customerName} · {confirmData.customerPhone}</p>
                      {confirmData.customerEmail && (
                        <p className="text-[10px] font-semibold text-blue-600 mt-0.5">{confirmData.customerEmail}</p>
                      )}
                    </div>
                  </motion.div>

                  {/* Total Amount */}
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-2 border-emerald-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Total Paid</p>
                        <p className="text-xs font-black text-slate-800">Amount</p>
                      </div>
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight drop-shadow-sm">
                      ₹{Number(confirmData.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </motion.div>
                </div>

                {/* ── Ticket Footer ── */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-blue-50/50 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Secure Booking
                    </div>
                    <span>Thank you for travelling with us!</span>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Download Button ── */}
              <div className="px-6 pb-5 pt-3 bg-[#F8FAFC] border-t border-slate-100">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    onClick={handleDownloadTicket}
                    disabled={downloading || sendingEmail}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all group text-sm"
                  >
                    {sendingEmail ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending Email...
                      </>
                    ) : downloading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating Ticket...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Ticket
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
