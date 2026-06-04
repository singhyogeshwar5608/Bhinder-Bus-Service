<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Schedule;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $schedules = Schedule::all();

        foreach ($schedules->take(5) as $schedule) {
            $booking = Booking::create([
                'booking_number' => 'BUS-' . strtoupper(Str::random(8)),
                'schedule_id' => $schedule->id,
                'customer_name' => 'John Doe',
                'customer_phone' => '9999999999',
                'customer_email' => 'john@example.com',
                'seat_numbers' => ['A1', 'A2'],
                'passenger_count' => 2,
                'total_amount' => $schedule->fare * 2,
                'payment_status' => 'paid',
                'booking_status' => 'confirmed',
            ]);

            $booking->passengers()->createMany([
                ['name' => 'John Doe', 'age' => 30, 'gender' => 'male', 'seat_number' => 'A1'],
                ['name' => 'Jane Doe', 'age' => 28, 'gender' => 'female', 'seat_number' => 'A2'],
            ]);

            $booking->payment()->create([
                'transaction_id' => 'pay_' . Str::random(10),
                'gateway' => 'razorpay',
                'amount' => $booking->total_amount,
                'status' => 'success',
            ]);
        }
    }
}