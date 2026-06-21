<?php

namespace App\Services;

use App\Repositories\BookingRepository;
use App\Repositories\SeatLockRepository;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Schedule;
use App\Mail\CancellationMail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

if (!class_exists('\\Dompdf\\Dompdf', false)) {
    require_once __DIR__ . '/../../vendor/dompdf/dompdf/src/Dompdf.php';
}

class BookingService
{
    protected $bookingRepository;
    protected $seatLockRepository;
    protected $razorpayService;

    public function __construct(
        BookingRepository $bookingRepository,
        SeatLockRepository $seatLockRepository,
        RazorpayService $razorpayService
    ) {
        $this->bookingRepository = $bookingRepository;
        $this->seatLockRepository = $seatLockRepository;
        $this->razorpayService = $razorpayService;
    }

    public function createBooking(array $data): Booking
    {
        $schedule = Schedule::findOrFail($data['schedule_id']);
        $seatNumbers = $data['seat_numbers'];

        return DB::transaction(function () use ($data, $schedule, $seatNumbers) {
            $data['booking_number'] = $data['booking_number'] ?? 'BUS-' . strtoupper(Str::random(8));
            $data['payment_status'] = $data['payment_status'] ?? 'pending';
            $data['booking_status'] = $data['booking_status'] ?? 'pending';
            $data['passenger_count'] = count($data['passengers']);

            $booking = $this->bookingRepository->createWithPassengers($data, $data['passengers']);

            return $booking;
        });
    }

    public function confirmBookingSeats(Booking $booking): void
    {
        $schedule = $booking->schedule;
        $seatNumbers = $booking->seat_numbers ?? [];

        DB::transaction(function () use ($booking, $schedule, $seatNumbers) {
            $booking->update([
                'payment_status' => 'paid',
                'booking_status' => 'confirmed',
            ]);

            $schedule->decrement('available_seats', $booking->passenger_count);
        });
    }

    public function getBookingByNumber(string $bookingNumber): ?Booking
    {
        return $this->bookingRepository->findByBookingNumber($bookingNumber);
    }

    public function lockSeats(int $scheduleId, array $seatNumbers, string $sessionId): bool
    {
        return $this->seatLockRepository->lockSeats($scheduleId, $seatNumbers, $sessionId);
    }

    public function getBookingsByPhone(string $phone): array
    {
        return $this->bookingRepository->findByPhone($phone);
    }

    public function cancelBooking(string $bookingNumber): array
    {
        Log::info('[CANCELLATION] Started', ['booking_number' => $bookingNumber]);

        $booking = $this->bookingRepository->findByBookingNumber($bookingNumber);

        if (!$booking) {
            throw new Exception('Booking not found.');
        }

        if ($booking->booking_status === 'cancelled') {
            throw new Exception('Booking already cancelled.');
        }

        if ($booking->booking_status !== 'confirmed') {
            throw new Exception('Booking is not eligible for cancellation.');
        }

        if ($booking->payment_status !== 'paid') {
            throw new Exception('Payment has not been completed for this booking.');
        }

        $payment = $booking->payment;
        if (!$payment) {
            throw new Exception('Payment record not found.');
        }

        if ($payment->refund_id && $payment->refund_status === 'processed') {
            throw new Exception('Booking already cancelled and refund already processed.');
        }

        if (!$payment->transaction_id) {
            throw new Exception('Payment transaction ID not found.');
        }

        Log::info('[CANCELLATION] Calling Razorpay refund', [
            'booking' => $bookingNumber,
            'transaction_id' => $payment->transaction_id,
            'amount' => $booking->total_amount,
        ]);

        $refundData = null;
        try {
            $refundData = $this->razorpayService->processRefund(
                $payment->transaction_id,
                $booking->total_amount
            );
            Log::info('[CANCELLATION] Refund Success', [
                'refund_id' => $refundData['refund_id'],
                'status' => $refundData['refund_status'],
            ]);
        } catch (\Exception $e) {
            $msg = $e->getMessage();
            if (str_contains($msg, 'fully refunded already') || str_contains($msg, 'already been refunded')) {
                Log::info('[CANCELLATION] Payment already refunded by Razorpay, proceeding', [
                    'booking' => $bookingNumber,
                ]);
                $refundData = [
                    'refund_id' => $payment->refund_id ?? 'already_refunded',
                    'refund_amount' => $booking->total_amount,
                    'refund_status' => 'processed',
                    'response' => [],
                ];
            } else {
                throw $e;
            }
        }

        $now = now();

        DB::transaction(function () use ($booking, $payment, $refundData, $now) {
            $booking->update([
                'booking_status' => 'cancelled',
                'payment_status' => 'refunded',
                'cancelled_at' => $now,
                'expected_refund_days' => 5,
            ]);
            Log::info('[CANCELLATION] Booking Updated');

            $payment->update([
                'status' => 'refunded',
                'refund_id' => $refundData['refund_id'],
                'refund_amount' => $refundData['refund_amount'],
                'refund_status' => $refundData['refund_status'],
                'refund_initiated_at' => $now,
                'refunded_at' => $now,
                'response' => $payment->response
                    ? array_merge($payment->response, ['refund' => $refundData['response'] ?? []])
                    : ['refund' => $refundData['response'] ?? []],
            ]);
            Log::info('[CANCELLATION] Payment Updated');

            $booking->schedule->increment('available_seats', $booking->passenger_count);
            Log::info('[CANCELLATION] Seats Released');

            Log::info('[CANCELLATION] Transaction Committed');
        });

        $booking->refresh();
        $booking->load(['schedule.bus', 'schedule.route', 'passengers', 'payment']);

        $pdfPath = null;
        if ($booking->customer_email) {
            try {
                $this->generateCancellationReceiptPdf($booking, $refundData);
                $pdfPath = storage_path('app/cancellation-receipt-' . $booking->booking_number . '.pdf');
                Log::info('[CANCELLATION] PDF Generated');
            } catch (Exception $e) {
                Log::error('[CANCELLATION] PDF Failed', [
                    'booking' => $booking->booking_number,
                    'error' => $e->getMessage(),
                ]);
            }

            try {
                $this->sendCancellationEmail($booking, $refundData, $pdfPath);
                Log::info('[CANCELLATION] Email Sent');
            } catch (Exception $e) {
                Log::error('[CANCELLATION] Email Failed', [
                    'booking' => $booking->booking_number,
                    'error' => $e->getMessage(),
                ]);
            }

            if ($pdfPath && file_exists($pdfPath)) {
                @unlink($pdfPath);
            }
        }

        return [
            'success' => true,
            'message' => 'Booking cancelled successfully. Refund has been initiated.',
            'booking' => $booking->toArray(),
            'refund' => [
                'refund_id' => $refundData['refund_id'],
                'refund_amount' => $refundData['refund_amount'],
                'refund_status' => $refundData['refund_status'],
                'cancelled_at' => $now,
                'expected_refund_days' => 5,
                'expected_refund_date' => $now->copy()->addDays(5)->format('d/m/Y'),
            ],
        ];
    }

    protected function sendCancellationEmail(Booking $booking, array $refundData, ?string $pdfPath = null): void
    {
        Mail::to($booking->customer_email)->send(new CancellationMail(
            $booking,
            (string) ($refundData['refund_status'] ?? 'Initiated'),
            (float) ($refundData['refund_amount'] ?? $booking->total_amount),
            $pdfPath
        ));
    }

    protected function generateCancellationReceiptPdf(Booking $booking, array $refundData): void
    {
        $from = $booking->schedule?->route?->from_city ?? $booking->from ?? '—';
        $to = $booking->schedule?->route?->to_city ?? $booking->to ?? '—';
        $journeyDate = $booking->schedule?->journey_date ?? $booking->date ?? '—';
        $formattedDate = $journeyDate !== '—' ? \Carbon\Carbon::parse($journeyDate)->format('d M Y, l') : '—';
        $seats = is_array($booking->seat_numbers) ? implode(', ', $booking->seat_numbers) : ($booking->seat_numbers ?? '—');
        $cancelledAt = $booking->cancelled_at ? \Carbon\Carbon::parse($booking->cancelled_at)->format('d/m/Y') : now()->format('d/m/Y');
        $expectedRefundDate = $booking->cancelled_at
            ? \Carbon\Carbon::parse($booking->cancelled_at)->addDays(5)->format('d/m/Y')
            : now()->addDays(5)->format('d/m/Y');
        $refundStatus = ucfirst($refundData['refund_status'] ?? 'Initiated');
        $busName = $booking->schedule?->bus?->bus_name ?? '—';
        $busNumber = $booking->schedule?->bus?->bus_number ?? '—';
        $busType = $booking->schedule?->bus?->bus_type ?? '—';
        $operator = $booking->schedule?->bus?->operator ?? '—';
        $depTime = $booking->schedule?->departure_time ?? '—';
        $arrTime = $booking->schedule?->arrival_time ?? '—';
        $distance = $booking->schedule?->route?->distance ?? '—';
        $duration = $booking->schedule?->route?->duration ?? $booking->schedule?->duration ?? '—';
        $totalAmount = number_format($refundData['refund_amount'] ?? $booking->total_amount, 2);
        $passengers = $booking->passengers ?? [];
        $passengers = is_array($passengers) ? $passengers : ($passengers instanceof \Illuminate\Support\Collection ? $passengers->toArray() : []);
        $stopsRaw = $booking->schedule?->route?->stops ?? [];
        $stops = is_array($stopsRaw) ? $stopsRaw : ($stopsRaw instanceof \Illuminate\Support\Collection ? $stopsRaw->toArray() : []);
        $passengerRows = '';
        foreach ($passengers as $p) {
            $name = $p['name'] ?? '—';
            $age = $p['age'] ?? '—';
            $gender = $p['gender'] ?? '—';
            $seat = $p['seat_number'] ?? '—';
            $passengerRows .= "<tr><td style='padding:4px 8px;border:1px solid #e2e8f0;font-size:12px;color:#2563eb;font-weight:bold;'>{$seat}</td><td style='padding:4px 8px;border:1px solid #e2e8f0;font-size:12px;'>{$name}</td><td style='padding:4px 8px;border:1px solid #e2e8f0;font-size:12px;color:#22c55e;font-weight:bold;text-align:right;'>{$age}</td></tr>";
        }
        $stopTimeline = '';
        $bp = $booking->boarding_point ?? '';
        if (!empty($stops)) {
            $bpIdx = -1;
            foreach ($stops as $i => $s) {
                if (($s['stop_name'] ?? '') === $bp) { $bpIdx = $i; break; }
            }
            $boardIdx = $bpIdx >= 0 ? $bpIdx : 0;
            $stopTimeline .= '<div style="margin:8px 0 0 16px;border-left:2px solid #e2e8f0;padding-left:20px;">';
            foreach ($stops as $i => $s) {
                $isBefore = $i < $boardIdx;
                $isSel = ($s['stop_name'] ?? '') === $bp;
                $sn = $s['stop_name'] ?? '—';
                $time = $s['departure_time'] ?? $s['arrival_time'] ?? '';
                $snColor = $isBefore ? '#94a3b8' : ($isSel ? '#f59e0b' : '#2563eb');
                $snWeight = $isSel ? 'bold' : 'normal';
                $timeColor = $isBefore ? '#cbd5e1' : '#64748b';
                $dotBg = $isSel ? '#f59e0b' : '#94a3b8';
                $dotDisplay = $isBefore ? 'none' : 'block';
                $label = $isSel ? ' <span style="color:#f59e0b;font-size:10px;">· Boarding Point</span>' : '';
                $stopTimeline .= '<div style="position:relative;margin-bottom:10px;">';
                $stopTimeline .= '<div style="position:absolute;left:-28px;top:4px;width:10px;height:10px;border-radius:50%;background:' . ($isSel ? '#f59e0b' : ($isBefore ? 'transparent' : '#94a3b8')) . ';' . ($isSel ? 'border:2px solid #fff;' : '') . 'display:' . $dotDisplay . ';"></div>';
                $stopTimeline .= '<div style="font-size:12px;font-weight:' . $snWeight . ';color:' . $snColor . ';">' . $sn . $label . '</div>';
                if ($time) {
                    $stopTimeline .= '<div style="font-size:11px;color:' . $timeColor . ';">' . $time . '</div>';
                }
                $stopTimeline .= '</div>';
            }
            $stopTimeline .= '</div>';
        }

        $skyblue = '#4A90D9';
        $skyblueDark = '#3A7BC8';
        $accent = '#f59e0b';
        $success = '#22c55e';
        $red = '#dc2626';

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
            @page { margin: 12mm 10mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #1e293b; font-size: 12px; line-height: 1.5; }
            .page { width: 100%; position: relative; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg);
                         font-size: 80px; font-weight: bold; color: rgba(74, 144, 217, 0.10);
                         border: 6px solid rgba(74, 144, 217, 0.10); padding: 16px 40px; border-radius: 10px;
                         z-index: -1; text-transform: uppercase; letter-spacing: 8px; pointer-events: none; }
            .header-bar { background: linear-gradient(135deg, ' . $skyblue . ', ' . $skyblueDark . '); color: white; padding: 16px 20px; text-align: center; border-radius: 6px 6px 0 0; }
            .header-bar .main-title { margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 1px; }
            .header-bar .sub-title { margin: 2px 0 0; font-size: 12px; opacity: 0.9; font-weight: bold; }
            .header-bar .booking-info { margin-top: 6px; font-size: 11px; opacity: 0.8; }
            .columns { display: flex; gap: 10px; margin-top: 12px; }
            .col-left { flex: 0 0 58%; }
            .col-right { flex: 0 0 40%; }
            .card { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 10px; overflow: hidden; }
            .card-header { background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 12px; font-size: 12px; font-weight: bold; color: #1e293b; border-left: 3px solid ' . $accent . '; }
            .card-body { padding: 10px 12px; }
            .route-row { display: flex; align-items: center; justify-content: space-between; position: relative; padding: 8px 0; }
            .route-row .from-to { font-size: 13px; font-weight: bold; }
            .route-row .from-to .from { color: ' . $skyblue . '; }
            .route-row .from-to .to { color: ' . $success . '; }
            .route-line { flex: 1; height: 2px; background: ' . $accent . '; margin: 0 12px; position: relative; }
            .route-line .dot { width: 8px; height: 8px; border-radius: 50%; background: ' . $accent . '; position: absolute; top: -3px; }
            .route-line .dot-left { left: 0; }
            .route-line .dot-right { right: 0; }
            .route-line .distance { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: bold; color: ' . $accent . '; }
            .time-row { display: flex; justify-content: space-between; font-size: 12px; margin-top: 2px; }
            .time-row .dep { color: ' . $skyblue . '; }
            .time-row .arr { color: ' . $success . '; }
            .info-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
            .info-row .label { color: #64748b; }
            .info-row .value { font-weight: bold; color: #1e293b; }
            .info-row .value.accent { color: ' . $accent . '; }
            .info-row .value.blue { color: ' . $skyblue . '; }
            .info-row .value.green { color: ' . $success . '; }
            .info-row .value.red { color: ' . $red . '; }
            table { width: 100%; border-collapse: collapse; }
            th { border: 1px solid #e2e8f0; padding: 6px 8px; font-size: 11px; color: #94a3b8; font-weight: normal; text-align: left; }
            .status-badge { display: inline-block; background: ' . $red . '; color: white; padding: 4px 14px; border-radius: 4px; font-size: 12px; font-weight: bold; letter-spacing: 1px; }
            .divider { border-top: 1px solid #e2e8f0; margin: 8px 0; }
            .footer { text-align: center; padding: 12px 0; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; margin-top: 12px; }
            .footer strong { color: #64748b; }
            .disclaimer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 6px; }
        </style></head><body>
        <div class="page">
            <div class="watermark">CANCELLED</div>

            <div class="header-bar">
                <div class="main-title">BHINDER BUS SERVICE</div>
                <div class="sub-title">CANCELLATION RECEIPT</div>
                <div class="booking-info">Booking: ' . $booking->booking_number . '  |  ' . $formattedDate . '</div>
            </div>

            <div class="columns">
                <!-- LEFT COLUMN -->
                <div class="col-left">
                    <!-- Route Details -->
                    <div class="card">
                        <div class="card-header">ROUTE DETAILS</div>
                        <div class="card-body">
                            <div class="route-row">
                                <div class="from-to"><span class="from">' . $from . '</span></div>
                                <div class="route-line">
                                    <span class="dot dot-left"></span>
                                    <span class="distance">' . $distance . ' KM</span>
                                    <span class="dot dot-right"></span>
                                </div>
                                <div class="from-to"><span class="to">' . $to . '</span></div>
                            </div>
                            <div class="time-row">
                                <span class="dep">' . $depTime . '</span>
                                <span class="arr">' . $arrTime . '</span>
                            </div>
                            <div style="margin-top:6px;font-size:12px;color:#64748b;">Duration: ' . $duration . '</div>
                        </div>
                    </div>

                    <!-- Passenger Details -->
                    <div class="card">
                        <div class="card-header">PASSENGER DETAILS</div>
                        <div class="card-body">
                            <div class="info-row"><span class="label">Booked By</span><span class="value">' . $booking->customer_name . '</span></div>
                            <div class="info-row"><span class="label">Mobile</span><span class="value">' . $booking->customer_phone . '</span></div>
                            <div class="info-row"><span class="label">Email</span><span class="value">' . $booking->customer_email . '</span></div>
                            <div class="info-row"><span class="label">Journey Date</span><span class="value">' . $formattedDate . '</span></div>
                            <div class="divider"></div>
                            <table>
                                <tr><th>SEAT</th><th>NAME</th><th style="text-align:right;">AGE</th></tr>
                                ' . $passengerRows . '
                            </table>
                        </div>
                    </div>

                    <!-- Boarding Details -->
                    <div class="card">
                        <div class="card-header">BOARDING DETAILS</div>
                        <div class="card-body">
                            <div style="font-size:12px;color:#f59e0b;font-weight:bold;">' . $from . ' <span style="color:#94a3b8;">→</span> <span style="color:#22c55e;font-weight:bold;">' . $to . '</span></div>
                            ' . $stopTimeline . '
                        </div>
                    </div>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="col-right">
                    <!-- Bus Details -->
                    <div class="card">
                        <div class="card-header">BUS DETAILS</div>
                        <div class="card-body">
                            <div class="info-row"><span class="label">Bus Name</span><span class="value accent">' . $busName . '</span></div>
                            <div class="info-row"><span class="label">Bus Type</span><span class="value blue">' . $busType . '</span></div>
                            <div class="info-row"><span class="label">Bus Number</span><span class="value">' . $busNumber . '</span></div>
                            <div class="info-row"><span class="label">Operator</span><span class="value">' . $operator . '</span></div>
                        </div>
                    </div>

                    <!-- Refund Summary -->
                    <div class="card">
                        <div class="card-header">REFUND SUMMARY</div>
                        <div class="card-body">
                            <div class="info-row"><span class="label">Total Fare</span><span class="value">₹' . $totalAmount . '</span></div>
                            <div class="info-row"><span class="label">Refund Amount</span><span class="value green">₹' . $totalAmount . '</span></div>
                            <div class="info-row"><span class="label">Refund Status</span><span class="value red">' . $refundStatus . '</span></div>
                            <div class="info-row"><span class="label">Refund ID</span><span class="value" style="font-size:11px;">' . ($refundData['refund_id'] ?? '—') . '</span></div>
                            <div class="info-row"><span class="label">Initiated Date</span><span class="value">' . $cancelledAt . '</span></div>
                            <div class="info-row"><span class="label">Expected By</span><span class="value">' . $expectedRefundDate . '</span></div>
                        </div>
                    </div>

                    <!-- Status -->
                    <div class="card">
                        <div class="card-header">BOOKING STATUS</div>
                        <div class="card-body">
                            <span class="status-badge">✕ CANCELLED</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <strong>Bhinder Bus Service</strong><br>
                Email: bhinderbusservice@gmail.com &nbsp;|&nbsp; Phone: 8092000025<br>
                Thank you for travelling with Bhinder Bus Service
            </div>
            <div class="disclaimer">
                Please note that bus, route, driver, boarding/drop points, and travel<br>
                schedules may be modified due to operational requirements or unforeseen circumstances.
            </div>
        </div>
        </body></html>';

        try {
            if (class_exists('\\Dompdf\\Dompdf')) {
                $dompdf = new \Dompdf\Dompdf();
                $dompdf->loadHtml($html);
                $dompdf->setPaper('A4', 'portrait');
                $dompdf->render();
                $filename = storage_path('app/cancellation-receipt-' . $booking->booking_number . '.pdf');
                file_put_contents($filename, $dompdf->output());
            }
        } catch (Exception $e) {
            Log::error('[CANCELLATION] PDF Generation failed', [
                'booking' => $booking->booking_number,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function generateCancellationReceipt(Booking $booking, array $refundData): string
    {
        $this->generateCancellationReceiptPdf($booking, $refundData);
        $filename = storage_path('app/cancellation-receipt-' . $booking->booking_number . '.pdf');
        if (file_exists($filename)) {
            $content = file_get_contents($filename);
            @unlink($filename);
            return $content;
        }
        throw new Exception('Failed to generate cancellation receipt PDF.');
    }
}
