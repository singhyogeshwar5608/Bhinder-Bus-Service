<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DriverResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'driver_name' => $this->driver_name,
            'dob' => $this->dob,
            'gender' => $this->gender,
            'driver_phone' => $this->driver_phone,
            'driver_email' => $this->driver_email,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'pincode' => $this->pincode,
            'license_number' => $this->license_number,
            'license_type' => $this->license_type,
            'license_issue_date' => $this->license_issue_date,
            'license_expiry_date' => $this->license_expiry_date,
            'aadhar_number' => $this->aadhar_number,
            'pan_number' => $this->pan_number,
            'blood_group' => $this->blood_group,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_number' => $this->emergency_contact_number,
            'remarks' => $this->remarks,
            'experience_years' => $this->experience_years,
            'profile_image' => $this->profile_image ? asset('storage/' . $this->profile_image) : null,
            'license_copy' => $this->license_copy ? asset('storage/' . $this->license_copy) : null,
            'aadhar_copy' => $this->aadhar_copy ? asset('storage/' . $this->aadhar_copy) : null,
            'status' => $this->status,
            'joining_date' => $this->joining_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
