<?php

use App\Http\Controllers\Api\Admin\HotelController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])
        ->middleware('throttle:register');
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:login');
});

// Routes authentifiées
Route::middleware('auth:sanctum')->group(function () {

    // Gestion de l'authentification
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [LoginController::class, 'logout']);
        Route::post('/logout-all', [LoginController::class, 'logoutAll']);
        Route::get('/me', [LoginController::class, 'me']);
    });

    // Routes admin Evadia (niveau <= 2)
    Route::middleware('level:2')->prefix('admin')->group(function () {
        // Routes de gestion de la plateforme
        Route::apiResource('hotels', HotelController::class);
    });

    // Routes admin hôtel (niveau <= 3)
    Route::middleware('level:3')->prefix('hotel')->group(function () {
        // Routes de gestion hôtelière
    });

    // Routes super admin uniquement
    Route::middleware('role:super_admin')->prefix('super')->group(function () {
        // Routes système
    });
});
