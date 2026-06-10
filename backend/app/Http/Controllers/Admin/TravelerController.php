<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Passenger;
use Illuminate\Http\Request;

class TravelerController extends Controller
{
    /**
     * Display a listing of unique travelers (passengers).
     */
    public function index(Request $request)
    {
        $query = Passenger::with('booking.schedule.bus', 'booking.schedule.route')
            ->select('passengers.*')
            ->latest('passengers.created_at');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('passengers.name', 'like', '%' . $search . '%')
                  ->orWhereHas('booking', function ($bq) use ($search) {
                      $bq->where('customer_name', 'like', '%' . $search . '%')
                         ->orWhere('booking_number', 'like', '%' . $search . '%');
                  });
            });
        }

        $travelers = $query->paginate($request->get('per_page', 10));

        $activeTravelers = Passenger::whereHas('booking', function ($q) {
            $q->where('booking_status', 'confirmed');
        })->count();

        return response()->json([
            'data' => $travelers->items(),
            'meta' => [
                'current_page' => $travelers->currentPage(),
                'last_page' => $travelers->lastPage(),
                'per_page' => $travelers->perPage(),
                'total' => $travelers->total(),
                'from' => $travelers->firstItem(),
                'to' => $travelers->lastItem(),
            ],
            'stats' => [
                'total_travelers' => Passenger::count(),
                'active_travelers' => $activeTravelers,
                'inactive_travelers' => Passenger::count() - $activeTravelers,
                'total_bookings' => Booking::count(),
            ],
        ]);
    }

    /**
     * Display the specified traveler details.
     */
    public function show($name)
    {
        // For simplicity, we find bookings associated with this passenger name
        $traveler = Passenger::with('booking.schedule.bus', 'booking.schedule.route')
            ->where('name', $name)
            ->get();

        if ($traveler->isEmpty()) {
            return response()->json(['message' => 'Traveler not found'], 404);
        }

        return response()->json($traveler);
    }
}
