<?php
/**
 * Creates the storage symlink: public/storage → storage/app/public
 * Run: php link-storage.php
 * Use this if php artisan storage:link fails due to disabled exec()
 */

$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

if (file_exists($link)) {
    if (is_link($link)) {
        echo "Symlink already exists: $link\n";
        exit(0);
    }
    echo "Path exists but is not a symlink. Remove it first: rm -rf $link\n";
    exit(1);
}

if (!is_dir($target)) {
    echo "Target directory does not exist: $target\n";
    exit(1);
}

$result = @symlink($target, $link);
if ($result) {
    echo "Storage symlink created successfully!\n";
    echo "  Target: $target\n";
    echo "  Link:   $link\n";
} else {
    $error = error_get_last();
    echo "Failed to create symlink.\n";
    echo "Error: " . ($error['message'] ?? 'Unknown error') . "\n";
    echo "\nTry manual approach via SSH:\n";
    echo "  ln -s $target $link\n";
    exit(1);
}
