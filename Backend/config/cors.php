<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS)
    |--------------------------------------------------------------------------
    | Autorise le frontend Next.js à appeler l'API Laravel.
    | En production, remplacez '*' par l'URL exacte du frontend.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // React Native / Expo — le mobile ne passe pas par un navigateur,
        // les requêtes n'ont pas d'Origin header, donc '*' est sans risque ici.
        '*',
    ],

    // En production, retirez '*' et listez uniquement vos domaines exacts.

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // false = compatible avec '*' dans allowed_origins (Bearer token, pas cookies).
    // Le frontend web Next.js utilise withCredentials — gérer séparément si besoin.
    'supports_credentials' => false,

];
