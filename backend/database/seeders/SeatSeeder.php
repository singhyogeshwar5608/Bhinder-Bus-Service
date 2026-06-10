<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bus;
use App\Models\Seat;

class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();

        foreach ($buses as $bus) {
            for ($i = 1; $i <= $bus->total_seats; $i++) {
                Seat::create([
                    'bus_id' => $bus->id,
                    'seat_number' => (string) $i,
                    'seat_type' => 'seater',
                    'is_booked' => false,
                ]);
            }
        }
    }
}