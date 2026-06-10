<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use App\Repositories\BookingRepository;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    protected $bookingService;
    protected $bookingRepository;

    public function __construct(
        BookingService $bookingService,
        BookingRepository $bookingRepository
    ) {
        $this->bookingService = $bookingService;
        $this->bookingRepository = $bookingRepository;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'per_page', 'date_from', 'date_to']);
        $bookings = $this->bookingRepository->getAll($filters);
        $stats = $this->bookingRepository->getStats();

        return response()->json([
            'data' => $bookings->items(),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
                'from' => $bookings->firstItem(),
                'to' => $bookings->lastItem(),
            ],
            'stats' => $stats,
        ]);
    }

    public function stats()
    {
        return response()->json($this->bookingRepository->getStats());
    }

    public function show($id)
    {
        $booking = $this->bookingRepository->findById($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }
        return response()->json($booking);
    }

    public function update(Request $request, $id)
    {
        $booking = $this->bookingRepository->findById($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $validated = $request->validate([
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded',
            'booking_status' => 'sometimes|in:confirmed,cancelled,pending',
        ]);

        $this->bookingRepository->update($booking, $validated);
        return response()->json($booking->fresh());
    }

    public function destroy($id)
    {
        $booking = $this->bookingRepository->findById($id);
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }
        
        $booking->delete();
        return response()->json(null, 204);
    }
}
