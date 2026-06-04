<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Route;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $routes = [
            [
                'from_city' => 'Delhi',
                'to_city' => 'Jaipur',
                'distance' => 270,
                'duration' => '5h 30m',
            ],
            [
                'from_city' => 'Mumbai',
                'to_city' => 'Pune',
                'distance' => 150,
                'duration' => '3h 00m',
            ],
            [
                'from_city' => 'Bangalore',
                'to_city' => 'Chennai',
                'distance' => 350,
                'duration' => '6h 30m',
            ],
            [
                'from_city' => 'Hyderabad',
                'to_city' => 'Vijayawada',
                'distance' => 280,
                'duration' => '5h 00m',
            ],
            [
                'from_city' => 'Ahmedabad',
                'to_city' => 'Surat',
                'distance' => 260,
                'duration' => '4h 30m',
            ],
        ];

        foreach ($routes as $route) {
            Route::create($route);
        }
    }
}