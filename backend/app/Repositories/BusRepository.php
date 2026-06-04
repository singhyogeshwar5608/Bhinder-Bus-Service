<?php

namespace App\Repositories;

use App\Models\Bus;
use Illuminate\Pagination\LengthAwarePaginator;

class BusRepository
{
    public function getAll(array $filters = [])
    {
        $query = Bus::with('driver');

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('bus_name', 'like', '%' . $search . '%')
                  ->orWhere('bus_number', 'like', '%' . $search . '%')
                  ->orWhere('operator', 'like', '%' . $search . '%')
                  ->orWhere('manufacturer', 'like', '%' . $search . '%');
            });
        }

        if (isset($filters['status']) && $filters['status'] !== 'all' && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['export']) && $filters['export'] === 'true') {
            return $query->latest()->get();
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id): ?Bus
    {
        return Bus::with('driver')->find($id);
    }

    public function create(array $data): Bus
    {
        return Bus::create($data);
    }

    public function update(Bus $bus, array $data): bool
    {
        return $bus->update($data);
    }

    public function delete(Bus $bus): bool
    {
        return $bus->delete();
    }
}
