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
            $query->where(function ($q) use ($filters) {
                $q->where('booking_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customer_phone', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('booking_status', $filters['status']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function getStats(): array
    {
        $total = Booking::count();
        $confirmed = Booking::where('booking_status', 'confirmed')->count();
        $pending = Booking::where('booking_status', 'pending')->count();
        $cancelled = Booking::where('booking_status', 'cancelled')->count();
        $refunded = Booking::where('booking_status', 'refunded')->count();

        return [
            'total' => $total,
            'confirmed' => $confirmed,
            'pending' => $pending,
            'cancelled' => $cancelled,
            'refunded' => $refunded,
        ];
    }

    public function findById(int $id): ?Booking
    {
        return Booking::with(['schedule.bus', 'schedule.route', 'passengers', 'payment'])->find($id);
    }

    public function findByPhone(string $phone): array
    {
        return Booking::with(['schedule.bus', 'schedule.route', 'passengers'])
            ->where('customer_phone', $phone)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function findByBookingNumber(string $bookingNumber): ?Booking
    {
        return Booking::with(['schedule.bus', 'schedule.route.stops', 'passengers', 'payment'])
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
