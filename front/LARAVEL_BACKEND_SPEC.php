<?php
// Laravel Backend - Models, Migrations, Controllers 
// This file contains the complete backend specification
// To set up: Extract to /backend directory

return [
    'structure' => [
        'directories' => [
            'app/Models',
            'app/Http/Controllers/Api/Admin',
            'app/Http/Requests/Admin',
            'app/Http/Resources',
            'app/Services',
            'app/Repositories',
            'app/Traits',
            'app/Helpers',
            'database/migrations',
            'database/seeders',
            'routes',
            'storage/logs',
            'public',
            'config',
        ],
        'files' => [
            '.env.example',
            'composer.json',
            'artisan',
            'routes/api.php',
            'config/database.php',
        ]
    ],
    'documentation' => 'See BACKEND_SETUP.md for complete setup instructions'
];
?>
