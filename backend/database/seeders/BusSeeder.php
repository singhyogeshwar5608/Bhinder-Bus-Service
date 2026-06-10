<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bus;
use App\Models\Driver;

class BusSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = Driver::all();
        
        $buses = [
            [
                'bus_name' => 'Volvo AC Seater',
                'bus_number' => 'RJ 14 PA 1234',
                'bus_type' => 'AC Seater',
                'total_seats' => 56,
                'layout_type' => '2+3 Sleeper',
                'last_row_seats' => 6,
                'amenities' => ['A/C', 'Charging Point', 'Water Bottle'],
                'operator' => 'Bhinder Bus Service',
                'status' => 'active',
                'driver_id' => $drivers[0]->id ?? null,
            ],
            [
                'bus_name' => 'Bharat Benz Sleeper',
                'bus_number' => 'GJ 01 AB 5678',
                'bus_type' => 'AC Sleeper',
                'total_seats' => 52,
                'layout_type' => '2+3 Sleeper',
                'last_row_seats' => 7,
                'amenities' => ['A/C', 'Blanket', 'Pillow', 'Charging Point'],
                'operator' => 'Bhinder Bus Service',
                'status' => 'active',
                'driver_id' => $drivers[1]->id ?? null,
            ],
            [
                'bus_name' => 'Scania Multi Axle',
                'bus_number' => 'KA 51 ZZ 2222',
                'bus_type' => 'AC Sleeper',
                'total_seats' => 60,
                'layout_type' => '2+3 Sleeper',
                'last_row_seats' => 5,
                'amenities' => ['A/C', 'Wifi', 'Blanket', 'Water Bottle'],
                'operator' => 'Bhinder Bus Service',
                'status' => 'active',
                'driver_id' => $drivers[2]->id ?? null,
            ],
            [
                'bus_name' => 'Ashok Leyland Seater',
                'bus_number' => 'UP 78 DT 3333',
                'bus_type' => 'Non AC Seater',
                'total_seats' => 56,
                'layout_type' => '2+3 Sleeper',
                'last_row_seats' => 6,
                'amenities' => ['Charging Point'],
                'operator' => 'Bhinder Bus Service',
                'status' => 'active',
                'driver_id' => $drivers[3]->id ?? null,
            ],
            [
                'bus_name' => 'Volvo B11R Sleeper',
                'bus_number' => 'MH 12 KL 4444',
                'bus_type' => 'AC Sleeper',
                'total_seats' => 52,
                'layout_type' => '2+3 Sleeper',
                'last_row_seats' => 7,
                'amenities' => ['A/C', 'Personal TV', 'Blanket', 'Water Bottle'],
                'operator' => 'Bhinder Bus Service',
                'status' => 'active',
                'driver_id' => $drivers[4]->id ?? null,
            ],
        ];

        foreach ($buses as $bus) {
            Bus::create($bus);
        }
    }
}