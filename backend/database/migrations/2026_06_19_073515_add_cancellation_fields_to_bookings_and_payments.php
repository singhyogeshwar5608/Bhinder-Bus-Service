<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('cancelled_at')->nullable()->after('booking_status');
            $table->string('cancellation_reason')->nullable()->after('cancelled_at');
            $table->integer('expected_refund_days')->default(5)->after('cancellation_reason');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->string('refund_id')->nullable()->after('response');
            $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_id');
            $table->string('refund_status')->nullable()->after('refund_amount');
            $table->timestamp('refund_initiated_at')->nullable()->after('refund_status');
            $table->timestamp('refunded_at')->nullable()->after('refund_initiated_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['cancelled_at', 'cancellation_reason', 'expected_refund_days']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['refund_id', 'refund_amount', 'refund_status', 'refund_initiated_at', 'refunded_at']);
        });
    }
};
