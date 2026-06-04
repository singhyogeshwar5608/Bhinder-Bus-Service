<?php

namespace App\Repositories;

use App\Models\Driver;
use Illuminate\Pagination\LengthAwarePaginator;

class DriverRepository
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Driver::query();

        if (isset($filters['search'])) {
            $query->where('driver_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('license_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('driver_phone', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id): ?Driver
    {
        return Driver::with('buses')->find($id);
    }

    public function create(array $data): Driver
    {
        return Driver::create($data);
    }

    public function update(Driver $driver, array $data): bool
    {
        return $driver->update($data);
    }

    public function delete(Driver $driver): bool
    {
        return $driver->delete();
    }
}
