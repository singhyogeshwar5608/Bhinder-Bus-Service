<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RazorpayService
{
    private function headers(): array
    {
        $key = config('services.razorpay.key_id');
        $secret = config('services.razorpay.key_secret');

        if (!$key || !$secret) {
            Log::error('Razorpay config missing for refund');
            throw new \RuntimeException('Razorpay API credentials not configured.');
        }

        return [
            'Authorization' => 'Basic ' . base64_encode("$key:$secret"),
            'Content-Type' => 'application/json',
        ];
    }

    public function processRefund(string $paymentId, float $amount): array
    {
        $amountPaise = intval(round($amount * 100));

        $response = Http::timeout(30)->withHeaders($this->headers())
            ->post("https://api.razorpay.com/v1/payments/{$paymentId}/refund", [
                'amount' => $amountPaise,
                'speed' => 'normal',
            ]);

        if (!$response->successful()) {
            $body = $response->body();
            Log::error('Razorpay refund failed', [
                'payment_id' => $paymentId,
                'status' => $response->status(),
                'body' => $body,
            ]);
            throw new \RuntimeException('Refund failed: ' . ($response->json()['error']['description'] ?? 'Unknown error'));
        }

        $refund = $response->json();

        Log::info('Razorpay refund successful', [
            'payment_id' => $paymentId,
            'refund_id' => $refund['id'],
            'amount' => $refund['amount'] / 100,
            'status' => $refund['status'],
        ]);

        return [
            'refund_id' => $refund['id'],
            'refund_amount' => $refund['amount'] / 100,
            'refund_status' => $refund['status'],
            'response' => $refund,
        ];
    }
}
