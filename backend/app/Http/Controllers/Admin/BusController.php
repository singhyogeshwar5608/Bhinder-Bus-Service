<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\BusService;
use App\Http\Resources\BusResource;
use Illuminate\Http\Request;

class BusController extends Controller
{
    protected $busService;

    public function __construct(BusService $busService)
    {
        $this->busService = $busService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'per_page', 'export']);
        $buses = $this->busService->getAllBuses($filters);
        return BusResource::collection($buses);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bus_name' => 'required|string',
            'bus_number' => 'required|string|unique:buses',
            'bus_type' => 'required|string',
            'total_seats' => 'required|integer',
            'layout_type' => 'required|string',
            'last_row_seats' => 'required|integer',
            'left_seats_per_row' => 'nullable|integer',
            'right_seats_per_row' => 'nullable|integer',
            'bus_category' => 'nullable|string',
            'amenities' => 'nullable|array',
            'chassis_number' => 'nullable|string',
            'registration_date' => 'nullable|date',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'manufacturing_year' => 'nullable|integer',
            'fuel_type' => 'nullable|string',
            'engine_number' => 'nullable|string',
            'emission_norms' => 'nullable|string',
            'body_type' => 'nullable|string',
            'transmission_type' => 'nullable|string',
            'operator' => 'nullable|string',
            'status' => 'required|string',
            'insurance_number' => 'nullable|string',
            'insurance_valid_till' => 'nullable|date',
            'fitness_certificate_number' => 'nullable|string',
            'fitness_valid_till' => 'nullable|date',
            'puc_number' => 'nullable|string',
            'puc_valid_till' => 'nullable|date',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'driver_id' => 'nullable|exists:drivers,id',
        ]);

        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $path = $image->store('buses', 'public');
                $imagePaths[] = $path;
            }
            $validated['images'] = $imagePaths;
        }

        $bus = $this->busService->createBus($validated);
        return new BusResource($bus);
    }

    public function show($id)
    {
        $bus = $this->busService->getBusById($id);
        if (!$bus) {
            return response()->json(['message' => 'Bus not found'], 404);
        }
        return new BusResource($bus);
    }

    public function update(Request $request, $id)
    {
        $bus = $this->busService->getBusById($id);
        if (!$bus) {
            return response()->json(['message' => 'Bus not found'], 404);
        }

        $validated = $request->validate([
            'bus_name' => 'sometimes|string',
            'bus_number' => 'sometimes|string|unique:buses,bus_number,' . $id,
            'bus_type' => 'sometimes|string',
            'total_seats' => 'sometimes|integer',
            'layout_type' => 'sometimes|string',
            'last_row_seats' => 'sometimes|integer',
            'left_seats_per_row' => 'nullable|integer',
            'right_seats_per_row' => 'nullable|integer',
            'bus_category' => 'nullable|string',
            'amenities' => 'nullable|array',
            'chassis_number' => 'nullable|string',
            'registration_date' => 'nullable|date',
            'manufacturer' => 'nullable|string',
            'model' => 'nullable|string',
            'manufacturing_year' => 'nullable|integer',
            'fuel_type' => 'nullable|string',
            'engine_number' => 'nullable|string',
            'emission_norms' => 'nullable|string',
            'body_type' => 'nullable|string',
            'transmission_type' => 'nullable|string',
            'operator' => 'nullable|string',
            'status' => 'sometimes|string',
            'insurance_number' => 'nullable|string',
            'insurance_valid_till' => 'nullable|date',
            'fitness_certificate_number' => 'nullable|string',
            'fitness_valid_till' => 'nullable|date',
            'puc_number' => 'nullable|string',
            'puc_valid_till' => 'nullable|date',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'driver_id' => 'nullable|exists:drivers,id',
        ]);

        if ($request->has('keep_images') || $request->hasFile('images')) {
            $imagePaths = [];
            if ($request->has('keep_images')) {
                $imagePaths = $request->input('keep_images');
                if (!is_array($imagePaths)) {
                    $imagePaths = [$imagePaths];
                }
            }
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('buses', 'public');
                    $imagePaths[] = $path;
                }
            }
            $validated['images'] = $imagePaths;
        }

        $updated = $this->busService->updateBus($id, $validated);
        return new BusResource($updated->fresh());
    }

    public function destroy($id)
    {
        if ($this->busService->deleteBus($id)) {
            return response()->json(null, 204);
        }
        return response()->json(['message' => 'Bus not found'], 404);
    }
}
