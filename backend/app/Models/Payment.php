<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'transaction_id',
        'gateway',
        'amount',
        'status',
        'response',
        'refund_id',
        'refund_amount',
        'refund_status',
        'refund_initiated_at',
        'refunded_at',
    ];

    protected $casts = [
        'response' => 'array',
        'refund_initiated_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}