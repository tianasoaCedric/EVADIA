<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\HotelPhotoController;
use App\Http\Controllers\Admin\AbonnementController;
use App\Http\Controllers\Admin\OffreController;
use App\Http\Controllers\Admin\MessageController;
use Illuminate\Support\Facades\Route;

// ────────────────────────────────────────────────────────
// Public / Home
// ────────────────────────────────────────────────────────
Route::get('/', function () {
    return view('welcome');
});

// ────────────────────────────────────────────────────────
// Auth Routes (hors groupe admin)
// ────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');

// ────────────────────────────────────────────────────────
// Admin Routes
// ────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:super_admin,admin_evadia'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Users
        Route::resource('users', UserController::class)->only(['index', 'show', 'edit', 'update']);
        Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

        // Hotels
        Route::resource('hotels', HotelController::class);
        Route::patch('hotels/{hotel}/status', [HotelController::class, 'updateStatus'])->name('hotels.update-status');

        // Hotel Photos (nested resource)
        Route::post('hotels/{hotel}/photos', [HotelPhotoController::class, 'store'])->name('hotels.photos.store');
        Route::delete('hotels/{hotel}/photos/{photo}', [HotelPhotoController::class, 'destroy'])->name('hotels.photos.destroy');

        // Subscriptions (Abonnements)
        Route::resource('subscriptions', AbonnementController::class)->parameters([
            'subscriptions' => 'subscription',
        ]);

        // Offers (Offres)
        Route::resource('offers', OffreController::class)->parameters([
            'offers' => 'offer',
        ]);
        Route::patch('offers/{offer}/toggle', [OffreController::class, 'toggle'])->name('offers.toggle');
        Route::get('offers/generate-promo-code', [OffreController::class, 'generatePromoCode'])->name('offers.generate-promo');

        // Messages
        Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
        Route::get('messages/create', [MessageController::class, 'create'])->name('messages.create');
        Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
        Route::get('messages/conversation/{user}', [MessageController::class, 'conversation'])->name('messages.conversation');
        Route::patch('messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.mark-read');
    });
