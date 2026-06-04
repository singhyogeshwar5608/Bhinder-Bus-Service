<?php

namespace App\Repositories;

use App\Models\Booking;
use App\Models\Passenger;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingRepository
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['schedule.bus', 'schedule.route']);

        if (isset($filters['search'])) {
            $query->where('booking_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_phone', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['status'])) {
            $query->where('booking_status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id): ?Booking
    {
        return Booking::with(['schedule.bus', 'schedule.route', 'passengers', 'payments'])->find($id);
    }

    public function findByBookingNumber(string $bookingNumber): ?Booking
    {
        return Booking::with(['schedule.bus', 'schedule.route', 'passengers', 'payments'])
            ->where('booking_number', $bookingNumber)
            ->first();
    }

    public function createWithPassengers(array $bookingData, array $passengersData): Booking
    {
        return DB::transaction(function () use ($bookingData, $passengersData) {
            $booking = Booking::create($bookingData);

            foreach ($passengersData as $passenger) {
                $booking->passengers()->create($passenger);
            }

            return $booking;
        });
    }

    public function update(Booking $booking, array $data): bool
    {
        return $booking->update($data);
    }
}
