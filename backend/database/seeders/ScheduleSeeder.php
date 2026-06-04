<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Bus;
use App\Models\Route;
use Carbon\Carbon;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();
        $routes = Route::all();
        
        $today = Carbon::today();

        foreach ($routes as $index => $route) {
            $bus = $buses[$index % $buses->count()];
            
            Schedule::create([
                'bus_id' => $bus->id,
                'route_id' => $route->id,
                'journey_date' => $today->format('Y-m-d'),
                'departure_time' => '08:00:00',
                'arrival_time' => '13:30:00',
                'fare' => 650.00,
                'available_seats' => $bus->total_seats,
                'status' => 'scheduled',
            ]);

            // Add another for tomorrow
            Schedule::create([
                'bus_id' => $bus->id,
                'route_id' => $route->id,
                'journey_date' => $today->copy()->addDay()->format('Y-m-d'),
                'departure_time' => '21:00:00',
                'arrival_time' => '03:00:00',
                'fare' => 850.00,
                'available_seats' => $bus->total_seats,
                'status' => 'scheduled',
            ]);
        }
    }
}