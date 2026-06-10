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

        // Fetch all seats for the schedule's bus
        $seats = Seat::where('bus_id', $schedule->bus_id)->get();

        // Fetch active locks for this schedule
        $locks = SeatLock::where('schedule_id', $id)
            ->where('expires_at', '>', Carbon::now())
            ->get()
            ->keyBy('seat_number');

        // Fetch booked seats for this schedule
        $bookedSeats = Booking::where('schedule_id', $id)
            ->where('booking_status', '!=', 'cancelled')
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
                // 1. Check if any seat is already booked
                $bookedSeats = Booking::where('schedule_id', $scheduleId)
                    ->where('booking_status', '!=', 'cancelled')
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

                // 2. Check if any seat is already locked by another session
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

                // 3. Create or update locks (expires in 5 minutes)
                foreach ($seatNumbers as $seatNumber) {
                    SeatLock::updateOrCreate(
                        ['schedule_id' => $scheduleId, 'seat_number' => $seatNumber],
                        [
                            'session_id' => $sessionId,
                            'expires_at' => Carbon::now()->addMinutes(5)
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

        $scheduleId = $request->schedule_id;
        $seatNumbers = $request->seat_numbers;
        $sessionId = $request->session_id;

        SeatLock::where('schedule_id', $scheduleId)
            ->whereIn('seat_number', $seatNumbers)
            ->where('session_id', $sessionId)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Seats unlocked successfully'
        ]);
    }

    public function getSeatsStatus(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
        ]);

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
            ->where('booking_status', '!=', 'cancelled')
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
                'seat_number' => $seatNumber,
                'status' => $status,
            ];
        });

        return response()->json([
            'seats' => $seatStatuses
        ]);
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

        $scheduleId = $validated['schedule_id'];
        $seatNumbers = $validated['seat_numbers'];
        $sessionId = $validated['session_id'];

        try {
            $booking = DB::transaction(function () use ($validated, $scheduleId, $seatNumbers, $sessionId) {
                // 1. Verify locks exist, belong to current session, and are not expired
                $locksCount = SeatLock::where('schedule_id', $scheduleId)
                    ->whereIn('seat_number', $seatNumbers)
                    ->where('session_id', $sessionId)
                    ->where('expires_at', '>', Carbon::now())
                    ->count();

                if ($locksCount !== count($seatNumbers)) {
                    throw new \Exception("Lock expired or invalid. Please select seats again.");
                }

                // 2. Setup values for creation (Service will override with default repository config)
                $validated['booking_number'] = 'BBS' . date('Y') . strtoupper(Str::random(6));
                $validated['payment_status'] = 'pending';
                $validated['booking_status'] = 'pending';
                $validated['passenger_count'] = count($validated['passengers']);

                // 3. Create booking with passengers using service
                $booking = $this->bookingService->createBooking($validated);

                // 4. Release seat locks
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

        if ($this->bookingService->cancelBooking($request->booking_number)) {
            return response()->json(['message' => 'Booking cancelled successfully']);
        }

        return response()->json(['message' => 'Unable to cancel booking'], 400);
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

        $email = $request->email;

        try {
            Mail::raw('Your bus ticket is attached below. Thank you for travelling with Bhinder Bus Service.', function ($message) use ($email, $booking, $request) {
                $message->to($email)
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

            return response()->json(['message' => 'Ticket sent successfully to ' . $email]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send email',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
