<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    protected $fillable = [
        'driver_name',
        'dob',
        'gender',
        'driver_phone',
        'driver_email',
        'address',
        'city',
        'state',
        'pincode',
        'license_number',
        'license_type',
        'license_issue_date',
        'license_expiry_date',
        'aadhar_number',
        'pan_number',
        'blood_group',
        'emergency_contact_name',
        'emergency_contact_number',
        'remarks',
        'experience_years',
        'profile_image',
        'license_copy',
        'aadhar_copy',
        'status',
        'joining_date',
    ];

    protected $casts = [
        'dob' => 'date',
        'license_issue_date' => 'date',
        'license_expiry_date' => 'date',
        'joining_date' => 'date',
    ];

    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class);
    }
}