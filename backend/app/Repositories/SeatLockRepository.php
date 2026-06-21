<?php

namespace App\Repositories;

use App\Models\SeatLock;
use Carbon\Carbon;

class SeatLockRepository
{
    public function lockSeats(int $scheduleId, array $seatNumbers, string $sessionId): bool
    {
        // Check if any seat is already locked by another session
        $existingLocks = SeatLock::where('schedule_id', $scheduleId)
            ->whereIn('seat_number', $seatNumbers)
            ->where('expires_at', '>', Carbon::now())
            ->where('session_id', '!=', $sessionId)
            ->exists();

        if ($existingLocks) {
            return false;
        }

        // Lock seats
        foreach ($seatNumbers as $seatNumber) {
            SeatLock::updateOrCreate(
                ['schedule_id' => $scheduleId, 'seat_number' => $seatNumber],
                ['session_id' => $sessionId, 'expires_at' => Carbon::now()->addMinutes(15)]
            );
        }

        return true;
    }

    public function unlockSeats(int $scheduleId, array $seatNumbers): void
    {
        SeatLock::where('schedule_id', $scheduleId)
            ->whereIn('seat_number', $seatNumbers)
            ->delete();
    }

    public function isSeatLocked(int $scheduleId, string $seatNumber): bool
    {
        return SeatLock::where('schedule_id', $scheduleId)
            ->where('seat_number', $seatNumber)
            ->where('expires_at', '>', Carbon::now())
            ->exists();
    }
}
