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
            $table->date('dob')->nullable()->after('driver_name');
            $table->string('gender')->nullable()->after('dob');
            $table->string('city')->nullable()->after('address');
            $table->string('state')->nullable()->after('city');
            $table->string('pincode')->nullable()->after('state');
            $table->string('license_type')->nullable()->after('license_number');
            $table->date('license_issue_date')->nullable()->after('license_type');
            $table->date('license_expiry_date')->nullable()->after('license_issue_date');
            $table->string('aadhar_number')->nullable()->after('license_expiry_date');
            $table->string('pan_number')->nullable()->after('aadhar_number');
            $table->string('license_copy')->nullable()->after('profile_image');
            $table->string('aadhar_copy')->nullable()->after('license_copy');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'dob',
                'gender',
                'city',
                'state',
                'pincode',
                'license_type',
                'license_issue_date',
                'license_expiry_date',
                'aadhar_number',
                'pan_number',
                'license_copy',
                'aadhar_copy'
            ]);
        });
    }
};
