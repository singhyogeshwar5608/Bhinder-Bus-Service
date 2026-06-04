<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
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
        ]);

        try {
            $booking = $this->bookingService->createBooking($validated);
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

    public function cancel(Request $request)
    {
        $request->validate(['booking_number' => 'required|string']);

        if ($this->bookingService->cancelBooking($request->booking_number)) {
            return response()->json(['message' => 'Booking cancelled successfully']);
        }

        return response()->json(['message' => 'Unable to cancel booking'], 400);
    }

    public function lockSeats(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'seat_numbers' => 'required|array',
            'session_id' => 'required|string',
        ]);

        $success = $this->bookingService->lockSeats(
            $request->schedule_id,
            $request->seat_numbers,
            $request->session_id
        );

        if ($success) {
            return response()->json(['message' => 'Seats locked successfully']);
        }

        return response()->json(['message' => 'Some seats are already locked or booked'], 400);
    }
}
