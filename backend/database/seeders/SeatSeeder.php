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
            $totalSeats = $bus->total_seats;
            
            for ($i = 1; $i <= $totalSeats; $i++) {
                $seatNumber = $this->getSeatNumber($i);
                Seat::create([
                    'bus_id' => $bus->id,
                    'seat_number' => $seatNumber,
                    'seat_type' => ($bus->bus_type === 'AC Sleeper') ? 'sleeper' : 'seater',
                    'is_booked' => false,
                ]);
            }
        }
    }

    private function getSeatNumber($index)
    {
        $row = chr(65 + floor(($index - 1) / 4)); // A, B, C...
        $col = (($index - 1) % 4) + 1;
        return $row . $col;
    }
}