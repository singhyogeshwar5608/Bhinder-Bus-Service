<?php

namespace App\Services;

use App\Repositories\RouteRepository;
use App\Models\Route;
use Illuminate\Pagination\LengthAwarePaginator;

class RouteService
{
    protected $routeRepository;

    public function __construct(RouteRepository $routeRepository)
    {
        $this->routeRepository = $routeRepository;
    }

    public function getAllRoutes(array $filters = []): LengthAwarePaginator
    {
        return $this->routeRepository->getAll($filters);
    }

    public function getRouteStats(): array
    {
        return $this->routeRepository->getStats();
    }

    public function getRouteById(int $id): ?Route
    {
        return $this->routeRepository->findById($id);
    }

    public function createRoute(array $data): Route
    {
        return $this->routeRepository->create($data);
    }

    public function updateRoute(int $id, array $data): ?Route
    {
        $route = $this->routeRepository->findById($id);
        if ($route) {
            $this->routeRepository->update($route, $data);
            return $route->fresh();
        }
        return null;
    }

    public function deleteRoute(int $id): bool
    {
        $route = $this->routeRepository->findById($id);
        if ($route) {
            return $this->routeRepository->delete($route);
        }
        return false;
    }
}
