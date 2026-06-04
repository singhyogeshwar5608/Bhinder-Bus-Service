<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use Illuminate\Http\JsonResponse;

class BusStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'total' => Bus::count(),
            'active' => Bus::where('status', 'Active')->count(),
            'maintenance' => Bus::where('status', 'Maintenance')->count(),
            'inactive' => Bus::where('status', 'Inactive')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
