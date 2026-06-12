<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private function razorpayHeaders(): array
    {
        $key = config('services.razorpay.key_id');
        $secret = config('services.razorpay.key_secret');

        if (!$key || !$secret) {
            Log::error('Razorpay config missing. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env and ensure config:cache is cleared.');
            throw new \RuntimeException('Razorpay API credentials not configured. Please contact support.');
        }

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
            $response = Http::timeout(30)->withHeaders($this->razorpayHeaders())
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
                Log::error('Razorpay order creation failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'booking_id' => $booking->id,
                ]);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        } catch (\Exception $e) {
            Log::error('Razorpay initiate exception', [
                'message' => $e->getMessage(),
                'booking_id' => $booking->id,
            ]);
            return response()->json([
                'message' => 'Payment service unavailable. Please try again later.',
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

        $bookingId = $request->booking_id;
        $razorpayPaymentId = $request->razorpay_payment_id;
        $razorpayOrderId = $request->razorpay_order_id;
        $razorpaySignature = $request->razorpay_signature;

        Log::info('[PAYMENT VERIFY] Starting verification', [
            'booking_id' => $bookingId,
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_order_id' => $razorpayOrderId,
        ]);

        $secret = config('services.razorpay.key_secret');
        if (!$secret) {
            Log::error('[PAYMENT VERIFY] Razorpay secret missing');
            return response()->json(['message' => 'Payment verification configuration error'], 500);
        }

        // Check if this payment was already verified (idempotency)
        $existingPayment = Payment::where('transaction_id', $razorpayPaymentId)->first();
        if ($existingPayment) {
            Log::info('[PAYMENT VERIFY] Payment already verified, returning existing booking', [
                'booking_id' => $bookingId,
                'payment_id' => $existingPayment->id,
            ]);
            $existingBooking = Booking::with('schedule.bus', 'passengers', 'payment')->find($bookingId);
            return response()->json([
                'message' => 'Payment already verified',
                'booking' => $existingBooking,
            ]);
        }

        $expectedSignature = hash_hmac(
            'sha256',
            $razorpayOrderId . '|' . $razorpayPaymentId,
            $secret
        );

        if ($expectedSignature !== $razorpaySignature) {
            Log::warning('[PAYMENT VERIFY] Invalid signature', [
                'booking_id' => $bookingId,
                'razorpay_order_id' => $razorpayOrderId,
            ]);
            return response()->json(['message' => 'Invalid payment signature'], 400);
        }

        Log::info('[PAYMENT VERIFY] Signature valid, updating booking', ['booking_id' => $bookingId]);

        return DB::transaction(function () use ($bookingId, $razorpayPaymentId, $razorpayOrderId, $request) {
            $booking = Booking::findOrFail($bookingId);

            // Double-check inside transaction to prevent race condition
            $alreadyPaid = Payment::where('transaction_id', $razorpayPaymentId)->exists();
            if ($alreadyPaid) {
                Log::info('[PAYMENT VERIFY] Race condition: payment already recorded in transaction');
                $existingBooking = Booking::with('schedule.bus', 'passengers', 'payment')->find($bookingId);
                return response()->json([
                    'message' => 'Payment already verified',
                    'booking' => $existingBooking,
                ]);
            }

            $booking->update([
                'payment_status' => 'paid',
                'booking_status' => 'confirmed',
            ]);

            Payment::create([
                'booking_id' => $booking->id,
                'transaction_id' => $razorpayPaymentId,
                'gateway' => 'razorpay',
                'amount' => $booking->total_amount,
                'status' => 'success',
                'response' => $request->all(),
            ]);

            Log::info('[PAYMENT VERIFY] Booking confirmed successfully', [
                'booking_id' => $bookingId,
                'booking_number' => $booking->booking_number,
            ]);

            return response()->json([
                'message' => 'Payment verified and booking confirmed',
                'booking' => $booking->load('schedule.bus', 'passengers', 'payment'),
            ]);
        });
    }

    public function orderStatus($razorpayOrderId)
    {
        Log::info('[PAYMENT] Checking Razorpay order status', ['order_id' => $razorpayOrderId]);

        try {
            $response = Http::timeout(15)->withHeaders($this->razorpayHeaders())
                ->get("https://api.razorpay.com/v1/orders/{$razorpayOrderId}");

            if (!$response->successful()) {
                Log::warning('[PAYMENT] Razorpay order status check failed', [
                    'order_id' => $razorpayOrderId,
                    'status' => $response->status(),
                ]);
                return response()->json([
                    'paid' => false,
                    'error' => 'Could not fetch order status',
                ], 500);
            }

            $order = $response->json();
            $amountPaid = $order['amount_paid'] ?? 0;
            $status = $order['status'] ?? '';

            Log::info('[PAYMENT] Razorpay order status result', [
                'order_id' => $razorpayOrderId,
                'status' => $status,
                'amount_paid' => $amountPaid,
            ]);

            return response()->json([
                'paid' => $amountPaid > 0 && $status === 'paid',
                'status' => $status,
                'amount_paid' => $amountPaid,
            ]);
        } catch (\Exception $e) {
            Log::error('[PAYMENT] Razorpay order status exception', [
                'order_id' => $razorpayOrderId,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['paid' => false, 'error' => $e->getMessage()], 500);
        }
    }
}