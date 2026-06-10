<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    private function razorpayHeaders(): array
    {
        $key = config('services.razorpay.key_id');
        $secret = config('services.razorpay.key_secret');
        return [
            'Authorization' => 'Basic ' . base64_encode("$key:$secret"),
            'Content-Type' => 'application/json',
        ];
    }

    public function initiate(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($request->booking_id);
        $amountPaise = intval(round($booking->total_amount * 100));

        try {
            $response = Http::withHeaders($this->razorpayHeaders())
                ->post('https://api.razorpay.com/v1/orders', [
                    'amount' => $amountPaise,
                    'currency' => 'INR',
                    'receipt' => 'booking_' . $booking->id . '_' . time(),
                    'notes' => [
                        'booking_id' => $booking->id,
                        'booking_number' => $booking->booking_number,
                    ],
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Failed to create Razorpay order',
                    'error' => $response->body(),
                ], 500);
            }

            $order = $response->json();

            return response()->json([
                'booking_id' => $booking->id,
                'razorpay_order_id' => $order['id'],
                'amount' => $amountPaise,
                'currency' => 'INR',
                'key_id' => config('services.razorpay.key_id'),
                'customer_name' => $booking->customer_name,
                'customer_email' => $booking->customer_email,
                'customer_phone' => $booking->customer_phone,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Razorpay order creation failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'razorpay_payment_id' => 'required',
            'razorpay_order_id' => 'required',
            'razorpay_signature' => 'required',
        ]);

        // Verify signature
        $secret = config('services.razorpay.key_secret');
        $expectedSignature = hash_hmac(
            'sha256',
            $request->razorpay_order_id . '|' . $request->razorpay_payment_id,
            $secret
        );

        if ($expectedSignature !== $request->razorpay_signature) {
            return response()->json(['message' => 'Invalid payment signature'], 400);
        }

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

            return response()->json([
                'message' => 'Payment verified and booking confirmed',
                'booking' => $booking->load('schedule.bus', 'passengers', 'payment'),
            ]);
        });
    }
}