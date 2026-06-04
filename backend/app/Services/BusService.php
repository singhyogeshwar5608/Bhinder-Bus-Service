<?php

namespace App\Services;

use App\Repositories\BusRepository;
use App\Models\Bus;
use Illuminate\Pagination\LengthAwarePaginator;

class BusService
{
    protected $busRepository;

    public function __construct(BusRepository $busRepository)
    {
        $this->busRepository = $busRepository;
    }

    public function getAllBuses(array $filters = [])
    {
        return $this->busRepository->getAll($filters);
    }

    public function getBusById(int $id): ?Bus
    {
        return $this->busRepository->findById($id);
    }

    public function createBus(array $data): Bus
    {
        return $this->busRepository->create($data);
    }

    public function updateBus(int $id, array $data): ?Bus
    {
        $bus = $this->busRepository->findById($id);
        if ($bus) {
            $this->busRepository->update($bus, $data);
            return $bus->fresh();
        }
        return null;
    }

    public function deleteBus(int $id): bool
    {
        $bus = $this->busRepository->findById($id);
        if ($bus) {
            return $this->busRepository->delete($bus);
        }
        return false;
    }
}
