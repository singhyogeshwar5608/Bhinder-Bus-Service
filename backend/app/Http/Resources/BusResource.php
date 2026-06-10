<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'bus_name' => $this->bus_name,
            'bus_number' => $this->bus_number,
            'bus_type' => $this->bus_type,
            'total_seats' => $this->total_seats,
            'layout_type' => $this->layout_type,
            'last_row_seats' => $this->last_row_seats,
            'left_seats_per_row' => $this->left_seats_per_row,
            'right_seats_per_row' => $this->right_seats_per_row,
            'bus_category' => $this->bus_category,
            'amenities' => $this->amenities,
            'chassis_number' => $this->chassis_number,
            'registration_date' => $this->registration_date,
            'manufacturer' => $this->manufacturer,
            'model' => $this->model,
            'manufacturing_year' => $this->manufacturing_year,
            'fuel_type' => $this->fuel_type,
            'engine_number' => $this->engine_number,
            'emission_norms' => $this->emission_norms,
            'body_type' => $this->body_type,
            'transmission_type' => $this->transmission_type,
            'operator' => $this->operator,
            'status' => $this->status,
            'insurance_number' => $this->insurance_number,
            'insurance_valid_till' => $this->insurance_valid_till,
            'fitness_certificate_number' => $this->fitness_certificate_number,
            'fitness_valid_till' => $this->fitness_valid_till,
            'puc_number' => $this->puc_number,
            'puc_valid_till' => $this->puc_valid_till,
            'images' => $this->images ? collect($this->images)->map(function ($img) {
                return url('storage/' . $img);
            })->toArray() : null,
            'driver' => new DriverResource($this->whenLoaded('driver')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
