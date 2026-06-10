<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeatLock extends Model
{
    protected $fillable = [
        'schedule_id',
        'seat_number',
        'session_id',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
