<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class CancellationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Booking $booking;
    public string $refundStatus;
    public float $refundAmount;
    public ?string $pdfPath;

    public function __construct(Booking $booking, string $refundStatus, float $refundAmount, ?string $pdfPath = null)
    {
        $this->booking = $booking;
        $this->refundStatus = $refundStatus;
        $this->refundAmount = $refundAmount;
        $this->pdfPath = $pdfPath;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking Cancelled Successfully - ' . $this->booking->booking_number . ' | Bhinder Bus Service',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cancellation',
        );
    }

    public function attachments(): array
    {
        if ($this->pdfPath && file_exists($this->pdfPath)) {
            return [
                Attachment::fromPath($this->pdfPath)
                    ->as('cancellation-receipt-' . $this->booking->booking_number . '.pdf')
                    ->withMime('application/pdf'),
            ];
        }
        return [];
    }
}
