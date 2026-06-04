<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ScheduleService;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    protected $scheduleService;

    public function __construct(ScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['bus_id', 'route_id', 'journey_date', 'status', 'per_page', 'export', 'today_trips']);
        return $this->scheduleService->getAllSchedules($filters);
    }

    public function getStats()
    {
        $stats = [
            'total' => \App\Models\Schedule::count(),
            'active' => \App\Models\Schedule::where('status', 'scheduled')->count(),
            'inactive' => \App\Models\Schedule::where('status', '!=', 'scheduled')->count(),
            'today' => \App\Models\Schedule::whereDate('journey_date', date('Y-m-d'))->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'route_id' => 'required|exists:routes,id',
            'driver_id' => 'nullable|exists:drivers,id',
            'journey_date' => 'required|date',
            'departure_time' => 'required',
            'arrival_time' => 'required',
            'fare' => 'required|numeric',
            'available_seats' => 'required|integer',
            'status' => 'required|in:scheduled,completed,cancelled',
        ]);

        $schedule = $this->scheduleService->createSchedule($validated);
        return response()->json($schedule, 201);
    }

    public function show($id)
    {
        $schedule = $this->scheduleService->getScheduleById($id);
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }
        return response()->json($schedule);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'bus_id' => 'sometimes|exists:buses,id',
            'route_id' => 'sometimes|exists:routes,id',
            'driver_id' => 'sometimes|nullable|exists:drivers,id',
            'journey_date' => 'sometimes|date',
            'departure_time' => 'sometimes',
            'arrival_time' => 'sometimes',
            'fare' => 'sometimes|numeric',
            'available_seats' => 'sometimes|integer',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
        ]);

        $schedule = $this->scheduleService->updateSchedule($id, $validated);
        if (!$schedule) {
            return response()->json(['message' => 'Schedule not found'], 404);
        }
        return response()->json($schedule);
    }

    public function destroy($id)
    {
        if ($this->scheduleService->deleteSchedule($id)) {
            return response()->json(null, 204);
        }
        return response()->json(['message' => 'Schedule not found'], 404);
    }
}
