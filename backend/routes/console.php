<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\SeatLock;
use Carbon\Carbon;

Schedule::call(function () {
    SeatLock::where('expires_at', '<', Carbon::now())->delete();
})->everyMinute();
