<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        // Here you would normally call Razorpay API to create an order
        // $order = $razorpay->order->create([...]);

        return response()->json([
            'booking' => $booking,
            'razorpay_order_id' => 'order_' . bin2hex(random_bytes(8)),
            'amount' => $booking->total_amount * 100, // in paise
            'currency' => 'INR',
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'razorpay_payment_id' => 'required',
            'razorpay_order_id' => 'required',
            'razorpay_signature' => 'required',
        ]);

        // Normally verify signature here
        // $attributes = [...];
        // $api->utility->verifyPaymentSignature($attributes);

        return DB::transaction(function () use ($request) {
            $booking = Booking::findOrFail($request->booking_id);
            
            $booking->update([
                'payment_status' => 'paid',
                'booking_status' => 'confirmed',
            ]);

            Payment::create([
                'booking_id' => $booking->id,
                'transaction_id' => $request->razorpay_payment_id,
                'gateway' => 'razorpay',
                'amount' => $booking->total_amount,
                'status' => 'success',
                'response' => $request->all(),
            ]);

            return response()->json(['message' => 'Payment verified and booking confirmed']);
        });
    }
}