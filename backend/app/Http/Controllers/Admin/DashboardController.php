<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Booking;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        $totalBuses = Bus::count();
        $activeBuses = Bus::where('status', 'active')->count();
        $maintenanceBuses = Bus::where('status', 'maintenance')->count();
        $inactiveBuses = Bus::where('status', 'inactive')->count();

        $totalDrivers = Driver::count();
        $activeDrivers = Driver::where('status', 'active')->count();

        $totalBookings = Booking::count();
        $todayBookings = Booking::whereDate('created_at', Carbon::today())->count();
        $totalRevenue = Booking::where('payment_status', 'paid')->sum('total_amount');

        $activeSchedules = Schedule::where('status', 'scheduled')
            ->where('journey_date', '>=', Carbon::today())
            ->count();

        return response()->json([
            'buses' => [
                'total' => $totalBuses,
                'active' => $activeBuses,
                'maintenance' => $maintenanceBuses,
                'inactive' => $inactiveBuses,
            ],
            'drivers' => [
                'total' => $totalDrivers,
                'active' => $activeDrivers,
            ],
            'bookings' => [
                'total' => $totalBookings,
                'today' => $todayBookings,
                'revenue' => $totalRevenue,
            ],
            'schedules' => [
                'active' => $activeSchedules,
            ],
            'recent_bookings' => Booking::with('schedule.route')->latest()->limit(5)->get(),
        ]);
    }
}
