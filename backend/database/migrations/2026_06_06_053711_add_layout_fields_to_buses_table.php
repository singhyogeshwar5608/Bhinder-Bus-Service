<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->string('layout_type')->default('2+3 Sleeper')->after('total_seats');
            $table->integer('last_row_seats')->default(6)->after('layout_type');
            $table->integer('left_seats_per_row')->nullable()->after('last_row_seats');
            $table->integer('right_seats_per_row')->nullable()->after('left_seats_per_row');
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn(['layout_type', 'last_row_seats', 'left_seats_per_row', 'right_seats_per_row']);
        });
    }
};
