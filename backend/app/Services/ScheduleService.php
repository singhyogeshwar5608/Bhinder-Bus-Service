<?php

namespace App\Services;

use App\Repositories\ScheduleRepository;
use App\Models\Schedule;
use Illuminate\Pagination\LengthAwarePaginator;

class ScheduleService
{
    protected $scheduleRepository;

    public function __construct(ScheduleRepository $scheduleRepository)
    {
        $this->scheduleRepository = $scheduleRepository;
    }

    public function getAllSchedules(array $filters = [])
    {
        return $this->scheduleRepository->getAll($filters);
    }

    public function getScheduleById(int $id): ?Schedule
    {
        return $this->scheduleRepository->findById($id);
    }

    public function createSchedule(array $data): Schedule
    {
        return $this->scheduleRepository->create($data);
    }

    public function updateSchedule(int $id, array $data): ?Schedule
    {
        $schedule = $this->scheduleRepository->findById($id);
        if ($schedule) {
            $this->scheduleRepository->update($schedule, $data);
            return $schedule->fresh();
        }
        return null;
    }

    public function deleteSchedule(int $id): bool
    {
        $schedule = $this->scheduleRepository->findById($id);
        if ($schedule) {
            return $this->scheduleRepository->delete($schedule);
        }
        return false;
    }
}
