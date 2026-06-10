<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 20px; }
        .ticket { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; text-align: center; color: #fff; }
        .header h1 { font-size: 20px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
        .header p { font-size: 11px; opacity: 0.8; margin: 4px 0 0; }
        .header .badge { display: inline-block; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 1px; margin-top: 8px; }
        .header .booking-number { font-size: 12px; opacity: 0.7; margin-top: 6px; }
        .body { padding: 20px 24px; }
        .route { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
        .route .loc { text-align: left; }
        .route .loc-right { text-align: right; }
        .route .loc-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
        .route .loc-name { font-size: 14px; font-weight: 900; color: #1e293b; margin: 2px 0; }
        .route .loc-time { font-size: 11px; font-weight: 700; color: #2563eb; }
        .route .divider { text-align: center; }
        .route .divider .line { width: 60px; height: 1px; border-top: 1px dashed #93c5fd; margin: 4px 0; }
        .route .divider .bus-icon { font-size: 16px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
        .info-card .label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
        .info-card .value { font-size: 12px; font-weight: 900; color: #1e293b; margin-top: 2px; }
        .bus-card { background: linear-gradient(135deg, #f5f3ff, #ede9fe); border: 1px solid #c4b5fd; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px; }
        .bus-card .label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #7c3aed; }
        .bus-card .value { font-size: 12px; font-weight: 900; color: #1e293b; margin-top: 2px; }
        .passengers { margin-bottom: 12px; }
        .passengers .title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 6px; }
        .passenger { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 6px; }
        .passenger .avatar { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 900; }
        .passenger .name { font-size: 12px; font-weight: 900; color: #1e293b; flex: 1; }
        .passenger .seat { font-size: 10px; font-weight: 900; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 6px; }
        .total { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0; }
        .total .label { font-size: 11px; font-weight: 900; color: #059669; }
        .total .amount { font-size: 20px; font-weight: 900; color: #059669; }
        .footer { padding: 12px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>🚍 Bhinder Bus Service</h1>
            <p>Travel with Comfort</p>
            <div class="badge">✓ BOOKING CONFIRMED</div>
            <div class="booking-number">Booking #{{ $booking['booking_number'] ?? 'N/A' }}</div>
        </div>
        <div class="body">
            <div class="route">
                <div class="loc">
                    <div class="loc-label">From</div>
                    <div class="loc-name">{{ $booking['from'] ?? ($booking['route']['from_city'] ?? '—') }}</div>
                    <div class="loc-time">{{ $booking['schedule']['departure_time'] ?? '—' }}</div>
                </div>
                <div class="divider">
                    <div class="line"></div>
                    <div class="bus-icon">🚌</div>
                    <div style="font-size:9px;color:#94a3b8;font-weight:700;">{{ $booking['schedule']['route']['duration'] ?? $booking['duration'] ?? '—' }}</div>
                </div>
                <div class="loc-right">
                    <div class="loc-label">To</div>
                    <div class="loc-name">{{ $booking['to'] ?? ($booking['route']['to_city'] ?? '—') }}</div>
                    <div class="loc-time" style="color:#059669;">{{ $booking['schedule']['arrival_time'] ?? '—' }}</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <div class="label">Journey Date</div>
                    <div class="value">{{ $booking['schedule']['journey_date'] ?? $booking['date'] ?? '—' }}</div>
                </div>
                <div class="info-card">
                    <div class="label">Seats</div>
                    <div class="value" style="color:#2563eb;">
                        @if(is_array($booking['seat_numbers']))
                            {{ implode(', ', $booking['seat_numbers']) }}
                        @else
                            {{ $booking['seat_numbers'] ?? '—' }}
                        @endif
                    </div>
                </div>
            </div>

            @if(isset($booking['schedule']['bus']))
            <div class="bus-card">
                <div class="label">Bus Details</div>
                <div class="value">
                    {{ $booking['schedule']['bus']['operator'] ?? 'BusBook Express' }} ·
                    {{ $booking['schedule']['bus']['bus_name'] ?? ($booking['schedule']['bus']['bus_number'] ?? '') }}
                </div>
                <div style="font-size:10px;color:#64748b;font-weight:700;margin-top:2px;">
                    #{{ $booking['schedule']['bus']['bus_number'] ?? '' }}
                    {{ isset($booking['schedule']['bus']['bus_type']) ? '· ' . $booking['schedule']['bus']['bus_type'] : '' }}
                </div>
            </div>
            @endif

            @if(isset($booking['passengers']) && count($booking['passengers']) > 0)
            <div class="passengers">
                <div class="title">Passengers ({{ count($booking['passengers']) }})</div>
                @foreach($booking['passengers'] as $p)
                <div class="passenger">
                    <div class="avatar">{{ strtoupper(substr($p['name'], 0, 1)) }}</div>
                    <div class="name">{{ $p['name'] }} <span style="font-weight:600;color:#94a3b8;font-size:10px;">Age: {{ $p['age'] }}</span></div>
                    <div class="seat">{{ $p['seat_number'] }}</div>
                </div>
                @endforeach
            </div>
            @endif

            <div class="total">
                <div class="label">Total Paid</div>
                <div class="amount">₹{{ number_format($booking['total_amount'] ?? 0) }}</div>
            </div>
        </div>
        <div class="footer">
            Thank you for travelling with Bhinder Bus Service! · Secure Booking
        </div>
    </div>
</body>
</html>
