<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use App\Models\Schedule;
use App\Models\Seat;
use App\Models\SeatLock;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function getSeatsBySchedule($id, Request $request)
    {
        $schedule = Schedule::with('bus')->findOrFail($id);
        $sessionId = $request->query('session_id');

        $seats = Seat::where('bus_id', $schedule->bus_id)->get();

        if ($seats->isEmpty() && $schedule->bus) {
            for ($i = 1; $i <= $schedule->bus->total_seats; $i++) {
                Seat::create([
                    'bus_id' => $schedule->bus_id,
                    'seat_number' => (string) $i,
                    'seat_type' => 'seater',
                    'is_booked' => false,
                ]);
            }
            $seats = Seat::where('bus_id', $schedule->bus_id)->get();
        }

        $locks = SeatLock::where('schedule_id', $id)
            ->where('expires_at', '>', Carbon::now())
            ->get()
            ->keyBy('seat_number');

        $bookedSeats = Booking::where('schedule_id', $id)
            ->where('booking_status', 'confirmed')
            ->get()
            ->pluck('seat_numbers')
            ->flatten()
            ->unique()
            ->toArray();

        $seatStatuses = $seats->map(function ($seat) use ($locks, $bookedSeats, $sessionId) {
            $seatNumber = $seat->seat_number;
            $status = 'available';

            if (in_array($seatNumber, $bookedSeats)) {
                $status = 'booked';
            } elseif ($locks->has($seatNumber)) {
                $lock = $locks->get($seatNumber);
                if ($sessionId && $lock->session_id === $sessionId) {
                    $status = 'selected';
                } else {
                    $status = 'locked';
                }
            }

            return [
                'id' => $seat->id,
                'seat_number' => $seatNumber,
                'seat_type' => $seat->seat_type,
                'is_booked' => $status === 'booked',
                'is_locked' => $status === 'locked' || $status === 'selected',
                'status' => $status,
            ];
        });

        return response()->json([
            'schedule' => $schedule,
            'seats' => $seatStatuses
        ]);
    }

    public function lockSeats(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'seat_numbers' => 'required|array',
            'session_id' => 'required|string',
        ]);

        $scheduleId = $request->schedule_id;
        $seatNumbers = $request->seat_numbers;
        $sessionId = $request->session_id;

        try {
            return DB::transaction(function () use ($scheduleId, $seatNumbers, $sessionId) {
                $bookedSeats = Booking::where('schedule_id', $scheduleId)
                    ->where('booking_status', 'confirmed')
                    ->get()
                    ->pluck('seat_numbers')
                    ->flatten()
                    ->toArray();

                foreach ($seatNumbers as $seatNumber) {
                    if (in_array($seatNumber, $bookedSeats)) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Seat already selected by another user'
                        ], 400);
                    }
                }

                $existingLocks = SeatLock::where('schedule_id', $scheduleId)
                    ->whereIn('seat_number', $seatNumbers)
                    ->where('expires_at', '>', Carbon::now())
                    ->where('session_id', '!=', $sessionId)
                    ->exists();

                if ($existingLocks) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Seat already selected by another user'
                    ], 400);
                }

                foreach ($seatNumbers as $seatNumber) {
                    SeatLock::updateOrCreate(
                        ['schedule_id' => $scheduleId, 'seat_number' => $seatNumber],
                        [
                            'session_id' => $sessionId,
                            'expires_at' => Carbon::now()->addMinutes(15)
                        ]
                    );
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Seats locked successfully'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Seat already selected by another user'
            ], 400);
        }
    }

    public function unlockSeats(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'seat_numbers' => 'required|array',
            'session_id' => 'required|string',
        ]);

        SeatLock::where('schedule_id', $request->schedule_id)
            ->whereIn('seat_number', $request->seat_numbers)
            ->where('session_id', $request->session_id)
            ->delete();

        return response()->json(['success' => true, 'message' => 'Seats unlocked successfully']);
    }

    public function getSeatsStatus(Request $request)
    {
        $request->validate(['schedule_id' => 'required|exists:schedules,id']);

        $scheduleId = $request->schedule_id;
        $sessionId = $request->query('session_id');

        $seats = Seat::where('bus_id', function ($query) use ($scheduleId) {
            $query->select('bus_id')->from('schedules')->where('id', $scheduleId);
        })->get();

        $locks = SeatLock::where('schedule_id', $scheduleId)
            ->where('expires_at', '>', Carbon::now())
            ->get()
            ->keyBy('seat_number');

        $bookedSeats = Booking::where('schedule_id', $scheduleId)
            ->where('booking_status', 'confirmed')
            ->get()
            ->pluck('seat_numbers')
            ->flatten()
            ->unique()
            ->toArray();

        $seatStatuses = $seats->map(function ($seat) use ($locks, $bookedSeats, $sessionId) {
            $seatNumber = $seat->seat_number;
            $status = 'available';

            if (in_array($seatNumber, $bookedSeats)) {
                $status = 'booked';
            } elseif ($locks->has($seatNumber)) {
                $lock = $locks->get($seatNumber);
                if ($sessionId && $lock->session_id === $sessionId) {
                    $status = 'selected';
                } else {
                    $status = 'locked';
                }
            }

            return ['seat_number' => $seatNumber, 'status' => $status];
        });

        return response()->json(['seats' => $seatStatuses]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_email' => 'required|email',
            'seat_numbers' => 'required|array',
            'total_amount' => 'required|numeric',
            'passengers' => 'required|array',
            'passengers.*.name' => 'required|string',
            'passengers.*.age' => 'required|integer',
            'passengers.*.gender' => 'required|in:male,female,other',
            'passengers.*.seat_number' => 'required|string',
            'session_id' => 'required|string',
        ]);

        try {
            $booking = DB::transaction(function () use ($validated) {
                $scheduleId = $validated['schedule_id'];
                $seatNumbers = $validated['seat_numbers'];
                $sessionId = $validated['session_id'];

                $locksCount = SeatLock::where('schedule_id', $scheduleId)
                    ->whereIn('seat_number', $seatNumbers)
                    ->where('session_id', $sessionId)
                    ->where('expires_at', '>', Carbon::now())
                    ->count();

                if ($locksCount !== count($seatNumbers)) {
                    $bookedSeats = Booking::where('schedule_id', $scheduleId)
                        ->where('booking_status', 'confirmed')
                        ->get()
                        ->pluck('seat_numbers')
                        ->flatten()
                        ->toArray();

                    foreach ($seatNumbers as $sn) {
                        if (in_array($sn, $bookedSeats)) {
                            throw new \Exception("Seat $sn is already booked. Please select another seat.");
                        }
                    }

                    foreach ($seatNumbers as $sn) {
                        SeatLock::updateOrCreate(
                            ['schedule_id' => $scheduleId, 'seat_number' => $sn],
                            ['session_id' => $sessionId, 'expires_at' => Carbon::now()->addMinutes(15)]
                        );
                    }
                }

                $validated['booking_number'] = 'BBS' . date('Y') . strtoupper(Str::random(6));
                $validated['payment_status'] = 'pending';
                $validated['booking_status'] = 'pending';
                $validated['passenger_count'] = count($validated['passengers']);

                $booking = $this->bookingService->createBooking($validated);

                SeatLock::where('schedule_id', $scheduleId)
                    ->whereIn('seat_number', $seatNumbers)
                    ->where('session_id', $sessionId)
                    ->delete();

                return $booking;
            });

            return response()->json($booking->load('passengers'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function getBooking($booking_number)
    {
        $booking = $this->bookingService->getBookingByNumber($booking_number);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }
        return response()->json($booking);
    }

    public function trackByPhone(string $phone)
    {
        $bookings = $this->bookingService->getBookingsByPhone($phone);
        return response()->json($bookings);
    }

    public function cancel(Request $request)
    {
        $request->validate(['booking_number' => 'required|string']);

        try {
            $result = $this->bookingService->cancelBooking($request->booking_number);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function cancellationReceipt(Request $request, $booking_number)
    {
        $booking = $this->bookingService->getBookingByNumber($booking_number);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->booking_status !== 'cancelled') {
            return response()->json(['message' => 'Booking is not cancelled'], 400);
        }

        $payment = $booking->payment;

        $refundData = [
            'refund_id' => $payment?->refund_id ?? '—',
            'refund_amount' => $payment?->refund_amount ?? $booking->total_amount,
            'refund_status' => $payment?->refund_status ?? 'initiated',
        ];

        try {
            $pdfContent = $this->bookingService->generateCancellationReceipt($booking, $refundData);

            return response($pdfContent, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="cancellation-receipt-' . $booking->booking_number . '.pdf"',
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate receipt: ' . $e->getMessage()], 500);
        }
    }

    public function emailTicket(Request $request, $booking_number)
    {
        $request->validate([
            'email' => 'required|email',
            'ticket_pdf' => 'nullable|file|max:10240',
        ]);

        $booking = $this->bookingService->getBookingByNumber($booking_number);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        try {
            Mail::raw('Your bus ticket is attached below. Thank you for travelling with Bhinder Bus Service.', function ($message) use ($request, $booking) {
                $message->to($request->email)
                    ->subject('Your Ticket - ' . $booking['booking_number'] . ' | Bhinder Bus Service')
                    ->from(config('mail.from.address'), config('mail.from.name'));

                if ($request->hasFile('ticket_pdf')) {
                    $file = $request->file('ticket_pdf');
                    $message->attach($file->getRealPath(), [
                        'as' => $file->getClientOriginalName(),
                        'mime' => 'application/pdf',
                    ]);
                }
            });

            return response()->json(['message' => 'Ticket sent successfully to ' . $request->email]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
