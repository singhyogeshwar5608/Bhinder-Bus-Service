<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bus extends Model
{
    protected $fillable = [
        'bus_name',
        'bus_number',
        'bus_type',
        'total_seats',
        'bus_category',
        'amenities',
        'chassis_number',
        'registration_date',
        'manufacturer',
        'model',
        'manufacturing_year',
        'fuel_type',
        'engine_number',
        'emission_norms',
        'body_type',
        'transmission_type',
        'operator',
        'status',
        'insurance_number',
        'insurance_valid_till',
        'fitness_certificate_number',
        'fitness_valid_till',
        'puc_number',
        'puc_valid_till',
        'images',
        'driver_id',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'registration_date' => 'date',
        'insurance_valid_till' => 'date',
        'fitness_valid_till' => 'date',
        'puc_valid_till' => 'date',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }
}