<?php

namespace App\Repositories;

use App\Models\Schedule;
use Illuminate\Pagination\LengthAwarePaginator;

class ScheduleRepository
{
    public function getAll(array $filters = [])
    {
        $query = Schedule::with(['bus', 'route', 'route.stops', 'driver']);

        if (isset($filters['bus_id'])) {
            $query->where('bus_id', $filters['bus_id']);
        }

        if (isset($filters['route_id'])) {
            $query->where('route_id', $filters['route_id']);
        }

        if (isset($filters['journey_date']) && $filters['journey_date'] !== '') {
            $query->whereDate('journey_date', $filters['journey_date']);
        }

        if (isset($filters['today_trips']) && $filters['today_trips'] === 'true') {
            $query->whereDate('journey_date', date('Y-m-d'));
        }

        if (isset($filters['status']) && $filters['status'] !== 'all' && $filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['export']) && $filters['export'] === 'true') {
            return $query->latest()->get();
        }

        return $query->latest()->paginate($filters['per_page'] ?? 10);
    }

    public function findById(int $id): ?Schedule
    {
        return Schedule::with(['bus', 'route', 'route.stops', 'driver'])->find($id);
    }

    public function create(array $data): Schedule
    {
        return Schedule::create($data);
    }

    public function update(Schedule $schedule, array $data): bool
    {
        return $schedule->update($data);
    }

    public function delete(Schedule $schedule): bool
    {
        return $schedule->delete();
    }
}
