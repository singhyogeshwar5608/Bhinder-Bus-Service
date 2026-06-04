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
        Schema::table('buses', function (Blueprint $table) {
            $table->string('bus_category')->nullable()->after('total_seats');
            $table->string('chassis_number')->nullable()->after('amenities');
            $table->date('registration_date')->nullable()->after('chassis_number');
            $table->string('manufacturer')->nullable()->after('registration_date');
            $table->string('model')->nullable()->after('manufacturer');
            $table->year('manufacturing_year')->nullable()->after('model');
            $table->string('fuel_type')->nullable()->after('manufacturing_year');
            $table->string('engine_number')->nullable()->after('fuel_type');
            $table->string('emission_norms')->nullable()->after('engine_number');
            $table->string('body_type')->nullable()->after('emission_norms');
            $table->string('transmission_type')->nullable()->after('body_type');
            $table->string('operator')->default('Bhinder Bus Service')->after('transmission_type');
            $table->string('insurance_number')->nullable()->after('status');
            $table->date('insurance_valid_till')->nullable()->after('insurance_number');
            $table->string('fitness_certificate_number')->nullable()->after('insurance_valid_till');
            $table->date('fitness_valid_till')->nullable()->after('fitness_certificate_number');
            $table->string('puc_number')->nullable()->after('fitness_valid_till');
            $table->date('puc_valid_till')->nullable()->after('puc_number');
            $table->json('images')->nullable()->after('puc_valid_till');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn([
                'bus_category',
                'chassis_number',
                'registration_date',
                'manufacturer',
                'model',
                'manufacturing_year',
                'fuel_type',
                'engine_number',
                'emission_norms',
                'body_type',
                'transmission_type',
                'operator',
                'insurance_number',
                'insurance_valid_till',
                'fitness_certificate_number',
                'fitness_valid_till',
                'puc_number',
                'puc_valid_till',
                'images'
            ]);
        });
    }
};
