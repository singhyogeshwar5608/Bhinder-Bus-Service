<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Repositories\SeatLockRepository;
use App\Models\Booking;
use App\Models\Schedule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Exception;

class BookingService
{
    protected $bookingRepository;
    protected $seatLockRepository;

    public function __construct(
        BookingRepository $bookingRepository,
        SeatLockRepository $seatLockRepository
    ) {
        $this->bookingRepository = $bookingRepository;
        $this->seatLockRepository = $seatLockRepository;
    }

    public function createBooking(array $data): Booking
    {
        $schedule = Schedule::findOrFail($data['schedule_id']);
        $seatNumbers = $data['seat_numbers'];

        return DB::transaction(function () use ($data, $schedule, $seatNumbers) {
            // 1. Verify seats are not already booked
            // In a real app, you'd check the 'bookings' table for this schedule
            // and these seat numbers.

            // 2. Generate booking number
            $data['booking_number'] = $data['booking_number'] ?? 'BUS-' . strtoupper(Str::random(8));
            $data['payment_status'] = $data['payment_status'] ?? 'pending';
            $data['booking_status'] = $data['booking_status'] ?? 'pending';
            $data['passenger_count'] = count($data['passengers']);

            // 3. Create booking with passengers
            $booking = $this->bookingRepository->createWithPassengers($data, $data['passengers']);

            // 4. Release seat locks
            $this->seatLockRepository->unlockSeats($data['schedule_id'], $seatNumbers);

            // 5. Update available seats in schedule
            $schedule->decrement('available_seats', count($seatNumbers));

            return $booking;
        });
    }

    public function getBookingByNumber(string $bookingNumber): ?Booking
    {
        return $this->bookingRepository->findByBookingNumber($bookingNumber);
    }

    public function lockSeats(int $scheduleId, array $seatNumbers, string $sessionId): bool
    {
        return $this->seatLockRepository->lockSeats($scheduleId, $seatNumbers, $sessionId);
    }

    public function getBookingsByPhone(string $phone): array
    {
        return $this->bookingRepository->findByPhone($phone);
    }

    public function cancelBooking(string $bookingNumber): bool
    {
        $booking = $this->bookingRepository->findByBookingNumber($bookingNumber);
        if (!$booking || $booking->booking_status === 'cancelled') {
            return false;
        }

        return DB::transaction(function () use ($booking) {
            $booking->update(['booking_status' => 'cancelled']);
            $booking->schedule->increment('available_seats', $booking->passenger_count);
            return true;
        });
    }
}
