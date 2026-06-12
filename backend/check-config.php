<?php
/**
 * Check Laravel config values (alternative to php artisan tinker when shell_exec is disabled)
 * Run: php check-config.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Razorpay Config ===\n";
echo "key_id:     " . (config('services.razorpay.key_id') ?: 'NOT SET') . "\n";
echo "key_secret: " . (config('services.razorpay.key_secret') ? '***SET***' : 'NOT SET') . "\n";

echo "\n=== App Config ===\n";
echo "APP_URL:    " . (config('app.url') ?: 'NOT SET') . "\n";
echo "APP_ENV:    " . (config('app.env') ?: 'NOT SET') . "\n";

echo "\n=== Filesystem Config ===\n";
echo "Storage URL: " . (config('filesystems.disks.public.url') ?: 'NOT SET') . "\n";
