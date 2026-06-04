<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteStop extends Model
{
    protected $fillable = [
        'route_id',
        'stop_name',
        'arrival_time',
        'departure_time',
        'fare',
        'order',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }
}
