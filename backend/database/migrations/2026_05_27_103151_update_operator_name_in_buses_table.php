<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('buses')->where('operator', 'bhinder')->update(['operator' => 'Bhinder Bus Service']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('buses')->where('operator', 'Bhinder Bus Service')->update(['operator' => 'bhinder']);
    }
};
