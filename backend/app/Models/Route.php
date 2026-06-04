<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    protected $fillable = [
        'from_city',
        'from_city_arrival_time',
        'to_city',
        'distance',
        'duration',
        'total_fare',
        'road_type',
        'status',
    ];

    public function stops(): HasMany
    {
        return $this->hasMany(RouteStop::class)->orderBy('order');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }
}