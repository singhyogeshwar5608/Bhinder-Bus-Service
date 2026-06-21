<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
<div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: #dc2626; padding: 20px; text-align: center;">
        <h2 style="color: #fff; margin: 0;">Bhinder Bus Service</h2>
        <p style="color: #fca5a5; margin: 5px 0 0;">Booking Cancelled Successfully</p>
    </div>
    <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b;">Dear <strong>{{ $booking->customer_name }}</strong>,</p>
        <p style="color: #64748b;">Your booking has been cancelled successfully. Please find the details below:</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Booking Number</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">{{ $booking->booking_number }}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Passenger Name</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">{{ $booking->customer_name }}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Route</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">{{ $booking->schedule?->route?->from_city ?? $booking->from ?? '—' }} → {{ $booking->schedule?->route?->to_city ?? $booking->to ?? '—' }}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Journey Date</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">{{ $booking->schedule?->journey_date ?? $booking->date ?? '—' }}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Seats</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">{{ is_array($booking->seat_numbers) ? implode(', ', $booking->seat_numbers) : $booking->seat_numbers }}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Refund Amount</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px; color: #dc2626;">₹{{ number_format($refundAmount, 2) }}</td></tr>
            <tr><td style="padding: 8px; color: #64748b; font-size: 13px;">Refund Status</td><td style="padding: 8px; font-weight: bold; font-size: 13px; text-transform: capitalize;">{{ $refundStatus }}</td></tr>
        </table>

        <p style="margin-top: 20px; color: #64748b; font-size: 13px;">
            Expected refund time: <strong>2-5 Working Days</strong>
        </p>

        <p style="margin-top: 20px; color: #64748b; font-size: 13px;">
            If you have any questions, please contact us at <strong>8092000025</strong> or email <strong>bhinderbusservice@gmail.com</strong>.
        </p>

        <p style="margin-top: 24px; text-align: center; color: #94a3b8; font-size: 12px;">
            Thank you for travelling with Bhinder Bus Service
        </p>
    </div>
</div>
</body>
</html>
