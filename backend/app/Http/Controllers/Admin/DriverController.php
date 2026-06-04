<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DriverService;
use App\Http\Resources\DriverResource;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    protected $driverService;

    public function __construct(DriverService $driverService)
    {
        $this->driverService = $driverService;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status', 'per_page']);
        $drivers = $this->driverService->getAllDrivers($filters);
        return DriverResource::collection($drivers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'driver_name' => 'required|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string',
            'driver_phone' => 'required|string',
            'driver_email' => 'nullable|email',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string',
            'license_number' => 'required|string|unique:drivers',
            'license_type' => 'nullable|string',
            'license_issue_date' => 'nullable|date',
            'license_expiry_date' => 'nullable|date',
            'aadhar_number' => 'nullable|string',
            'pan_number' => 'nullable|string',
            'blood_group' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_number' => 'nullable|string',
            'remarks' => 'nullable|string',
            'experience_years' => 'nullable|numeric',
            'status' => 'required|string',
            'joining_date' => 'nullable|date',
            'profile_image' => 'nullable|image|max:5120',
            'license_copy' => 'nullable|file|max:5120',
            'aadhar_copy' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('profile_image')) {
            $validated['profile_image'] = $request->file('profile_image')->store('drivers/profiles', 'public');
        }
        if ($request->hasFile('license_copy')) {
            $validated['license_copy'] = $request->file('license_copy')->store('drivers/documents', 'public');
        }
        if ($request->hasFile('aadhar_copy')) {
            $validated['aadhar_copy'] = $request->file('aadhar_copy')->store('drivers/documents', 'public');
        }

        $driver = $this->driverService->createDriver($validated);
        return new DriverResource($driver);
    }

    public function show($id)
    {
        $driver = $this->driverService->getDriverById($id);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }
        return new DriverResource($driver);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'driver_name' => 'sometimes|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string',
            'driver_phone' => 'sometimes|string',
            'driver_email' => 'nullable|email',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string',
            'license_number' => 'sometimes|string|unique:drivers,license_number,' . $id,
            'license_type' => 'nullable|string',
            'license_issue_date' => 'nullable|date',
            'license_expiry_date' => 'nullable|date',
            'aadhar_number' => 'nullable|string',
            'pan_number' => 'nullable|string',
            'blood_group' => 'nullable|string',
            'emergency_contact_name' => 'nullable|string',
            'emergency_contact_number' => 'nullable|string',
            'remarks' => 'nullable|string',
            'experience_years' => 'nullable|numeric',
            'status' => 'sometimes|string',
            'joining_date' => 'nullable|date',
            'profile_image' => 'nullable|image|max:5120',
            'license_copy' => 'nullable|file|max:5120',
            'aadhar_copy' => 'nullable|file|max:5120',
        ]);

        if ($request->hasFile('profile_image')) {
            $validated['profile_image'] = $request->file('profile_image')->store('drivers/profiles', 'public');
        } else {
            unset($validated['profile_image']);
        }
        if ($request->hasFile('license_copy')) {
            $validated['license_copy'] = $request->file('license_copy')->store('drivers/documents', 'public');
        } else {
            unset($validated['license_copy']);
        }
        if ($request->hasFile('aadhar_copy')) {
            $validated['aadhar_copy'] = $request->file('aadhar_copy')->store('drivers/documents', 'public');
        } else {
            unset($validated['aadhar_copy']);
        }

        $driver = $this->driverService->updateDriver($id, $validated);
        if (!$driver) {
            return response()->json(['message' => 'Driver not found'], 404);
        }
        return new DriverResource($driver);
    }

    public function destroy($id)
    {
        if ($this->driverService->deleteDriver($id)) {
            return response()->json(null, 204);
        }
        return response()->json(['message' => 'Driver not found'], 404);
    }
}
