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
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('blood_group')->nullable()->after('pan_number');
            $table->string('emergency_contact_name')->nullable()->after('blood_group');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
            $table->text('remarks')->nullable()->after('emergency_contact_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'blood_group',
                'emergency_contact_name',
                'emergency_contact_number',
                'remarks'
            ]);
        });
    }
};
