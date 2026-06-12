<?php
$link = __DIR__ . '/public/storage';
$target = __DIR__ . '/storage/app/public';

echo "=== Checking Symlink ===\n";
echo "Link path:   $link\n";
echo "Target path: $target\n\n";

if (!file_exists($link)) {
    echo "❌ public/storage does NOT exist.\n";
} elseif (is_link($link)) {
    $readTarget = readlink($link);
    echo "✅ Symlink exists!\n";
    echo "   Points to: $readTarget\n";
    if (realpath($readTarget) === realpath($target)) {
        echo "✅ Target matches: $target\n";
    } else {
        echo "❌ Target MISMATCH:\n";
        echo "   Expected: $target\n";
        echo "   Actual:   $readTarget\n";
    }
} elseif (is_dir($link)) {
    echo "❌ public/storage is a DIRECTORY, not a symlink.\n";
    echo "   Remove it: rm -rf $link\n";
    echo "   Then re-run: php link-storage.php\n";
} else {
    echo "❌ public/storage exists but is unknown type.\n";
}

echo "\n=== Testing PHP symlink() function ===\n";
echo "symlink function exists: " . (function_exists('symlink') ? 'YES' : 'NO') . "\n";

echo "\n=== Testing file access ===\n";
$testFile = $target . '/buses/bus-1.png';
if (file_exists($testFile)) {
    echo "✅ Sample image exists: $testFile\n";
} else {
    echo "❌ Sample image NOT found: $testFile\n";
    echo "   Listing target dir:\n";
    $dir = $target . '/buses';
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $f) {
            if ($f !== '.' && $f !== '..') {
                echo "   - $f\n";
            }
        }
    } else {
        echo "   Directory does not exist: $dir\n";
    }
}
