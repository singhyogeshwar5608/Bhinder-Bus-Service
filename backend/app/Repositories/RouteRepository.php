<?php

namespace App\Repositories;

use App\Models\Route;
use Illuminate\Pagination\LengthAwarePaginator;

class RouteRepository
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Route::with('stops');

        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('from_city', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('to_city', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function getStats(): array
    {
        return [
            'total' => Route::count(),
            'active' => Route::where('status', 'active')->count(),
            'inactive' => Route::where('status', 'inactive')->count(),
        ];
    }

    public function findById(int $id): ?Route
    {
        return Route::with('stops')->find($id);
    }

    public function create(array $data): Route
    {
        $stops = $data['stops'] ?? [];
        unset($data['stops']);
        
        // Auto-calculate total_fare from the maximum fare in stops if stops are provided
        if (!empty($stops)) {
            $maxFare = 0;
            foreach ($stops as $stop) {
                if (isset($stop['fare']) && $stop['fare'] > $maxFare) {
                    $maxFare = $stop['fare'];
                }
            }
            // Use max fare if total_fare is not provided or is 0
            if (!isset($data['total_fare']) || $data['total_fare'] == 0) {
                $data['total_fare'] = $maxFare;
            }
        }

        $route = Route::create($data);

        foreach ($stops as $index => $stop) {
            $route->stops()->create([
                'stop_name' => $stop['stop_name'],
                'arrival_time' => $stop['arrival_time'],
                'departure_time' => $stop['departure_time'] ?? null,
                'fare' => $stop['fare'],
                'order' => $index,
            ]);
        }

        return $route->load('stops');
    }

    public function update(Route $route, array $data): bool
    {
        $stops = $data['stops'] ?? [];
        unset($data['stops']);

        // Auto-calculate total_fare from the maximum fare in stops if stops are provided
        if (!empty($stops)) {
            $maxFare = 0;
            foreach ($stops as $stop) {
                if (isset($stop['fare']) && $stop['fare'] > $maxFare) {
                    $maxFare = $stop['fare'];
                }
            }
            // Use max fare if total_fare is not provided or is 0
            if (!isset($data['total_fare']) || $data['total_fare'] == 0) {
                $data['total_fare'] = $maxFare;
            }
        }

        $updated = $route->update($data);

        if (isset($stops)) {
            $route->stops()->delete();
            foreach ($stops as $index => $stop) {
                $route->stops()->create([
                    'stop_name' => $stop['stop_name'],
                    'arrival_time' => $stop['arrival_time'],
                    'departure_time' => $stop['departure_time'] ?? null,
                    'fare' => $stop['fare'],
                    'order' => $index,
                ]);
            }
        }

        return $updated;
    }

    public function delete(Route $route): bool
    {
        return $route->delete();
    }
}
