<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Passenger;
use Illuminate\Http\Request;

class TravelerController extends Controller
{
    /**
     * Display a listing of unique travelers (passengers).
     */
    public function index(Request $request)
    {
        $query = Passenger::query()
            ->select('name', 'age', 'gender')
            ->distinct();

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return $query->latest()->paginate($request->get('per_page', 10));
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
