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
                'from_city_arrival_time' => '08:00:00',
                'to_city' => 'Jaipur',
                'distance' => 270,
                'duration' => '5h 30m',
                'total_fare' => 600,
                'road_type' => 'Highway',
                'status' => 'active',
                'stops' => [
                    ['stop_name' => 'Gurgaon (Rajiv Chowk)', 'arrival_time' => '08:45:00', 'departure_time' => '08:50:00', 'fare' => 520],
                    ['stop_name' => 'Dharuhera Toll', 'arrival_time' => '09:40:00', 'departure_time' => '09:45:00', 'fare' => 450],
                    ['stop_name' => 'Behror Midway', 'arrival_time' => '10:55:00', 'departure_time' => '11:15:00', 'fare' => 350],
                    ['stop_name' => 'Kotputli Stand', 'arrival_time' => '12:05:00', 'departure_time' => '12:10:00', 'fare' => 200],
                    ['stop_name' => 'Shahpura Bypass', 'arrival_time' => '12:55:00', 'departure_time' => '13:00:00', 'fare' => 100],
                ]
            ],
            [
                'from_city' => 'Mumbai',
                'from_city_arrival_time' => '08:00:00',
                'to_city' => 'Pune',
                'distance' => 150,
                'duration' => '3h 00m',
                'total_fare' => 350,
                'road_type' => 'Highway',
                'status' => 'active',
                'stops' => [
                    ['stop_name' => 'Vashi Plaza', 'arrival_time' => '08:35:00', 'departure_time' => '08:40:00', 'fare' => 270],
                    ['stop_name' => 'Panvel Kalamboli', 'arrival_time' => '09:10:00', 'departure_time' => '09:15:00', 'fare' => 230],
                    ['stop_name' => 'Lonavala (Khalapur)', 'arrival_time' => '10:15:00', 'departure_time' => '10:30:00', 'fare' => 110],
                ]
            ],
            [
                'from_city' => 'Bangalore',
                'from_city_arrival_time' => '08:00:00',
                'to_city' => 'Chennai',
                'distance' => 350,
                'duration' => '6h 30m',
                'total_fare' => 750,
                'road_type' => 'Mixed',
                'status' => 'active',
                'stops' => [
                    ['stop_name' => 'Hosur Bus Stand', 'arrival_time' => '08:50:00', 'departure_time' => '08:55:00', 'fare' => 650],
                    ['stop_name' => 'Krishnagiri Toll', 'arrival_time' => '10:05:00', 'departure_time' => '10:10:00', 'fare' => 550],
                    ['stop_name' => 'Ambur Food Mall', 'arrival_time' => '11:45:00', 'departure_time' => '12:00:00', 'fare' => 330],
                    ['stop_name' => 'Vellore Bypass', 'arrival_time' => '12:45:00', 'departure_time' => '12:50:00', 'fare' => 200],
                    ['stop_name' => 'Kanchipuram Cut', 'arrival_time' => '13:55:00', 'departure_time' => '14:00:00', 'fare' => 70],
                ]
            ],
            [
                'from_city' => 'Hyderabad',
                'from_city_arrival_time' => '08:00:00',
                'to_city' => 'Vijayawada',
                'distance' => 280,
                'duration' => '5h 00m',
                'total_fare' => 550,
                'road_type' => 'Highway',
                'status' => 'active',
                'stops' => [
                    ['stop_name' => 'Nakrekal Bypass', 'arrival_time' => '09:30:00', 'departure_time' => '09:35:00', 'fare' => 400],
                    ['stop_name' => 'Suryapet Food Court', 'arrival_time' => '10:30:00', 'departure_time' => '10:45:00', 'fare' => 270],
                    ['stop_name' => 'Kodad Town', 'arrival_time' => '11:30:00', 'departure_time' => '11:35:00', 'fare' => 170],
                    ['stop_name' => 'Nandigama Station', 'arrival_time' => '12:15:00', 'departure_time' => '12:20:00', 'fare' => 70],
                ]
            ],
            [
                'from_city' => 'Ahmedabad',
                'from_city_arrival_time' => '08:00:00',
                'to_city' => 'Surat',
                'distance' => 260,
                'duration' => '4h 30m',
                'total_fare' => 500,
                'road_type' => 'Mixed',
                'status' => 'active',
                'stops' => [
                    ['stop_name' => 'Nadiad Express Highway', 'arrival_time' => '08:35:00', 'departure_time' => '08:40:00', 'fare' => 420],
                    ['stop_name' => 'Anand Bypass', 'arrival_time' => '09:05:00', 'departure_time' => '09:10:00', 'fare' => 380],
                    ['stop_name' => 'Vadodara (Golden Quadrilateral)', 'arrival_time' => '10:00:00', 'departure_time' => '10:15:00', 'fare' => 260],
                    ['stop_name' => 'Bharuch Narmada Bridge', 'arrival_time' => '11:30:00', 'departure_time' => '11:35:00', 'fare' => 120],
                ]
            ],
        ];

        foreach ($routes as $routeData) {
            $stops = $routeData['stops'];
            unset($routeData['stops']);
            $route = Route::create($routeData);
            foreach ($stops as $index => $stop) {
                $route->stops()->create([
                    'stop_name' => $stop['stop_name'],
                    'arrival_time' => $stop['arrival_time'],
                    'departure_time' => $stop['departure_time'],
                    'fare' => $stop['fare'],
                    'order' => $index,
                ]);
            }
        }
    }
}