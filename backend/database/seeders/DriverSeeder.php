<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Driver;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        $drivers = [
            [
                'driver_name' => 'Rajesh Kumar',
                'driver_phone' => '9876543210',
                'driver_email' => 'rajesh@example.com',
                'license_number' => 'DL1420210001234',
                'experience_years' => 10,
                'status' => 'active',
                'joining_date' => '2020-01-15',
            ],
            [
                'driver_name' => 'Amit Sharma',
                'driver_phone' => '9876543211',
                'driver_email' => 'amit@example.com',
                'license_number' => 'UP7820190005678',
                'experience_years' => 8,
                'status' => 'active',
                'joining_date' => '2021-03-20',
            ],
            [
                'driver_name' => 'Sandeep Singh',
                'driver_phone' => '9876543212',
                'driver_email' => 'sandeep@example.com',
                'license_number' => 'PB0820180009101',
                'experience_years' => 12,
                'status' => 'active',
                'joining_date' => '2019-11-10',
            ],
            [
                'driver_name' => 'Mohit Verma',
                'driver_phone' => '9876543213',
                'driver_email' => 'mohit@example.com',
                'license_number' => 'HR2620220002222',
                'experience_years' => 5,
                'status' => 'active',
                'joining_date' => '2022-05-05',
            ],
            [
                'driver_name' => 'Ravi Chauhan',
                'driver_phone' => '9876543214',
                'driver_email' => 'ravi@example.com',
                'license_number' => 'RJ1420170003333',
                'experience_years' => 15,
                'status' => 'active',
                'joining_date' => '2018-08-12',
            ],
        ];

        foreach ($drivers as $driver) {
            Driver::create($driver);
        }
    }
}