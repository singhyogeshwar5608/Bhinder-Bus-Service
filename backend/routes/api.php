<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\BusController;
use App\Http\Controllers\Admin\BusStatsController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Public\SearchController;
use App\Http\Controllers\Public\BookingController as PublicBookingController;
use App\Http\Controllers\Public\PaymentController;

/*
|--------------------------------------------------------------------------
| Public APIs
|--------------------------------------------------------------------------
*/
Route::get('/search-buses', [SearchController::class, 'search']);
Route::get('/cities', [SearchController::class, 'getCities']);
Route::get('/popular-routes', [SearchController::class, 'getPopularRoutes']);
Route::get('/top-buses', [SearchController::class, 'getTopBuses']);
Route::get('/public-buses', [SearchController::class, 'getPublicBuses']);
Route::get('/seats/{schedule_id}', [SearchController::class, 'getSeats']);
Route::get('/schedules/{id}', [SearchController::class, 'getSchedule']);

Route::prefix('bookings')->group(function () {
    Route::post('/create', [PublicBookingController::class, 'create']);
    Route::post('/lock-seats', [PublicBookingController::class, 'lockSeats']);
    Route::get('/{booking_number}', [PublicBookingController::class, 'getBooking']);
    Route::post('/cancel', [PublicBookingController::class, 'cancel']);
});

Route::prefix('payments')->group(function () {
    Route::post('/initiate', [PaymentController::class, 'initiate']);
    Route::post('/verify', [PaymentController::class, 'verify']);
});

/*
|--------------------------------------------------------------------------
| Admin APIs
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'getStats']);
        Route::get('/buses/stats', [BusStatsController::class, 'index']);

        Route::apiResource('buses', BusController::class);
        Route::apiResource('drivers', DriverController::class);
        Route::apiResource('routes', RouteController::class);
        Route::get('/schedules/stats', [ScheduleController::class, 'getStats']);
        Route::apiResource('schedules', ScheduleController::class);
        Route::apiResource('bookings', AdminBookingController::class);
        Route::apiResource('coupons', CouponController::class);
        Route::get('/travelers', [\App\Http\Controllers\Admin\TravelerController::class, 'index']);
        Route::get('/travelers/{name}', [\App\Http\Controllers\Admin\TravelerController::class, 'show']);
    });
});
