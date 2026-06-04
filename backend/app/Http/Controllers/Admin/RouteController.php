<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RouteService;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    protected $routeService;

    public function __construct(RouteService $routeService)
    {
        $this->routeService = $routeService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $routes = $this->routeService->getAllRoutes($filters);
        $stats = $this->routeService->getRouteStats();

        return response()->json([
            'data' => $routes->items(),
            'meta' => [
                'current_page' => $routes->currentPage(),
                'last_page' => $routes->lastPage(),
                'per_page' => $routes->perPage(),
                'total' => $routes->total(),
            ],
            'stats' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_city' => 'required|string',
            'from_city_arrival_time' => 'nullable',
            'to_city' => 'required|string',
            'distance' => 'nullable|numeric',
            'duration' => 'nullable|string',
            'total_fare' => 'required|numeric',
            'road_type' => 'nullable|in:Highway,Hilly,Mixed',
            'status' => 'required|in:active,inactive',
            'stops' => 'nullable|array',
            'stops.*.stop_name' => 'required|string',
            'stops.*.arrival_time' => 'nullable',
            'stops.*.departure_time' => 'nullable',
            'stops.*.fare' => 'required|numeric',
        ]);

        $route = $this->routeService->createRoute($validated);
        return response()->json($route, 201);
    }

    public function show($id)
    {
        $route = $this->routeService->getRouteById($id);
        if (!$route) {
            return response()->json(['message' => 'Route not found'], 404);
        }
        return response()->json($route);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'from_city' => 'sometimes|string',
            'from_city_arrival_time' => 'nullable',
            'to_city' => 'sometimes|string',
            'distance' => 'nullable|numeric',
            'duration' => 'nullable|string',
            'total_fare' => 'sometimes|numeric',
            'road_type' => 'nullable|in:Highway,Hilly,Mixed',
            'status' => 'sometimes|in:active,inactive',
            'stops' => 'nullable|array',
            'stops.*.stop_name' => 'required|string',
            'stops.*.arrival_time' => 'nullable',
            'stops.*.departure_time' => 'nullable',
            'stops.*.fare' => 'required|numeric',
        ]);

        $route = $this->routeService->updateRoute($id, $validated);
        if (!$route) {
            return response()->json(['message' => 'Route not found'], 404);
        }
        return response()->json($route);
    }

    public function destroy($id)
    {
        if ($this->routeService->deleteRoute($id)) {
            return response()->json(null, 204);
        }
        return response()->json(['message' => 'Route not found'], 404);
    }
}
