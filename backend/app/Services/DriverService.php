<?php

namespace App\Services;

use App\Repositories\DriverRepository;
use App\Models\Driver;
use Illuminate\Pagination\LengthAwarePaginator;

class DriverService
{
    protected $driverRepository;

    public function __construct(DriverRepository $driverRepository)
    {
        $this->driverRepository = $driverRepository;
    }

    public function getAllDrivers(array $filters = []): LengthAwarePaginator
    {
        return $this->driverRepository->getAll($filters);
    }

    public function getDriverById(int $id): ?Driver
    {
        return $this->driverRepository->findById($id);
    }

    public function createDriver(array $data): Driver
    {
        return $this->driverRepository->create($data);
    }

    public function updateDriver(int $id, array $data): ?Driver
    {
        $driver = $this->driverRepository->findById($id);
        if ($driver) {
            $this->driverRepository->update($driver, $data);
            return $driver->fresh();
        }
        return null;
    }

    public function deleteDriver(int $id): bool
    {
        $driver = $this->driverRepository->findById($id);
        if ($driver) {
            return $this->driverRepository->delete($driver);
        }
        return false;
    }
}
