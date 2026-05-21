<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\HotelPhotoController;
use App\Http\Controllers\Admin\AbonnementController;
use App\Http\Controllers\Admin\VilleDecouverteController;
use App\Http\Controllers\Admin\LieuDecouverteController;
use App\Http\Controllers\Admin\MessageController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Hotel\PasswordController;
use App\Http\Controllers\Hotel\AuthController as HotelAuthController;
use App\Http\Controllers\Hotel\DashboardController as HotelDashboardController;
use App\Http\Controllers\Hotel\ProfileController as HotelProfileController;
use App\Http\Controllers\Hotel\HotelContentController;
use App\Http\Controllers\Hotel\RoomController;
use App\Http\Controllers\Hotel\RoomPhotoController;
use App\Http\Controllers\Hotel\ReservationController;
use App\Http\Controllers\Hotel\CalendarController;
use App\Http\Controllers\Hotel\PricingController;
use App\Http\Controllers\Hotel\HotelOffreController;
use App\Http\Controllers\Hotel\OffrePhotoController;
use App\Http\Controllers\Hotel\MessageController as HotelMessageController;
use App\Http\Controllers\Hotel\NotificationController as HotelNotificationController;
use App\Http\Controllers\Hotel\PaymentController;
use App\Http\Controllers\Hotel\SubscriptionController as HotelSubscriptionController;
use Illuminate\Support\Facades\Route;

// ────────────────────────────────────────────────────────
// Public / Home
// ────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────
// Auth Routes (hors groupe admin)
// ────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/', [AuthController::class, 'login']);
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

        // Contenu Découverte
        Route::resource('decouverte/villes', VilleDecouverteController::class)->parameters([
            'villes' => 'ville',
        ])->names('decouverte.villes');
        Route::patch('decouverte/villes/{ville}/toggle', [VilleDecouverteController::class, 'toggle'])->name('decouverte.villes.toggle');

        Route::resource('decouverte/villes/{ville}/lieux', LieuDecouverteController::class)->parameters([
            'lieux' => 'lieu',
        ])->names('decouverte.villes.lieux');
        Route::patch('decouverte/villes/{ville}/lieux/{lieu}/toggle', [LieuDecouverteController::class, 'toggle'])->name('decouverte.villes.lieux.toggle');

        // Messages
        Route::get('messages', [MessageController::class, 'index'])->name('messages.index');
        Route::get('messages/create', [MessageController::class, 'create'])->name('messages.create');
        Route::post('messages', [MessageController::class, 'store'])->name('messages.store');
        Route::get('messages/conversation/{user}', [MessageController::class, 'conversation'])->name('messages.conversation');
        Route::patch('messages/{message}/read', [MessageController::class, 'markAsRead'])->name('messages.mark-read');

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('notifications/recent', [NotificationController::class, 'recent'])->name('notifications.recent');
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    });

// ────────────────────────────────────────────────────────
// Hotel Auth Routes (hors middleware groupe)
// ────────────────────────────────────────────────────────
Route::prefix('hotel')->name('hotel.')->group(function () {
    Route::get('login', [HotelAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [HotelAuthController::class, 'login']);
    Route::post('logout', [HotelAuthController::class, 'logout'])->name('logout');
    Route::get('forgot-password', [HotelAuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('forgot-password', [HotelAuthController::class, 'sendResetLink'])->name('password.email');
    Route::get('reset-password/{token}', [HotelAuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('reset-password', [HotelAuthController::class, 'resetPassword'])->name('password.update.reset');
});

// ────────────────────────────────────────────────────────
// Hotel Routes (back-office hôtelier protégé)
// ────────────────────────────────────────────────────────
Route::middleware(['auth:hotel', 'role:admin_hotel,gestionnaire_hotel', 'password.change'])
    ->prefix('hotel')->name('hotel.')->group(function () {

        // Password change (exempt from ForcePasswordChange middleware)
        Route::get('password/change', [PasswordController::class, 'showChangeForm'])->name('password.change')->withoutMiddleware('password.change');
        Route::post('password/change', [PasswordController::class, 'change'])->name('password.update')->withoutMiddleware('password.change');

        // Dashboard
        Route::get('dashboard', [HotelDashboardController::class, 'index'])->name('dashboard');

        // Profile
        Route::get('profile', [HotelProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [HotelProfileController::class, 'update'])->name('profile.update');
        Route::put('profile/password', [HotelProfileController::class, 'updatePassword'])->name('profile.password');

        // Hotel Content
        Route::get('content', [HotelContentController::class, 'show'])->name('content.show');
        Route::get('content/edit', [HotelContentController::class, 'edit'])->name('content.edit');
        Route::put('content', [HotelContentController::class, 'update'])->name('content.update');
        Route::post('content/photos', [HotelContentController::class, 'uploadPhotos'])->name('content.photos.store');
        Route::delete('content/photos/{photo}', [HotelContentController::class, 'deletePhoto'])->name('content.photos.destroy');
        Route::patch('content/photos/reorder', [HotelContentController::class, 'reorderPhotos'])->name('content.photos.reorder');
        Route::post('content/services', [HotelContentController::class, 'storeService'])->name('content.services.store');
        Route::put('content/services/{service}', [HotelContentController::class, 'updateService'])->name('content.services.update');
        Route::delete('content/services/{service}', [HotelContentController::class, 'deleteService'])->name('content.services.destroy');

        // Rooms (Chambres)
        Route::resource('rooms', RoomController::class);
        Route::patch('rooms/{propriete}/status', [RoomController::class, 'updateStatus'])->name('rooms.update-status');
        Route::post('rooms/{propriete}/photos', [RoomPhotoController::class, 'store'])->name('rooms.photos.store');
        Route::delete('rooms/{propriete}/photos/{photo}', [RoomPhotoController::class, 'destroy'])->name('rooms.photos.destroy');
        Route::patch('rooms/{propriete}/photos/reorder', [RoomPhotoController::class, 'reorder'])->name('rooms.photos.reorder');

        // Reservations
        Route::get('reservations', [ReservationController::class, 'index'])->name('reservations.index');
        Route::get('reservations/{reservation}', [ReservationController::class, 'show'])->name('reservations.show');
        Route::patch('reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])->name('reservations.update-status');

        // Calendar
        Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
        Route::get('calendar/data', [CalendarController::class, 'getData'])->name('calendar.data');
        Route::post('calendar/disponibilite', [CalendarController::class, 'updateDisponibilite'])->name('calendar.update');
        Route::post('calendar/bulk', [CalendarController::class, 'bulkUpdate'])->name('calendar.bulk');

        // Pricing & Offers
        Route::get('pricing', [PricingController::class, 'index'])->name('pricing.index');
        Route::post('pricing/{propriete}/price', [PricingController::class, 'updatePrice'])->name('pricing.update');
        Route::resource('offers', HotelOffreController::class)->except(['show', 'destroy']);
        Route::patch('offers/{offre}/toggle', [HotelOffreController::class, 'toggle'])->name('offers.toggle');
        Route::post('offers/{offre}/photo', [OffrePhotoController::class, 'store'])->name('offers.photo.store');
        Route::delete('offers/{offre}/photo/{photo}', [OffrePhotoController::class, 'destroy'])->name('offers.photo.destroy');

        // Messaging
        Route::get('messages', [HotelMessageController::class, 'index'])->name('messages.index');
        Route::get('messages/conversation/{user}', [HotelMessageController::class, 'conversation'])->name('messages.conversation');
        Route::post('messages', [HotelMessageController::class, 'store'])->name('messages.store');
        Route::post('messages/reply', [HotelMessageController::class, 'reply'])->name('messages.reply');
        Route::patch('messages/{message}/read', [HotelMessageController::class, 'markAsRead'])->name('messages.mark-read');

        // Payments
        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('payments/export', [PaymentController::class, 'export'])->name('payments.export');
        Route::get('payments/{paiement}', [PaymentController::class, 'show'])->name('payments.show');

        // Subscription
        Route::get('subscription', [HotelSubscriptionController::class, 'index'])->name('subscription.index');

        // Notifications
        Route::get('notifications', [HotelNotificationController::class, 'index'])->name('notifications.index');
        Route::get('notifications/recent', [HotelNotificationController::class, 'recent'])->name('notifications.recent');
        Route::patch('notifications/{notification}/read', [HotelNotificationController::class, 'markAsRead'])->name('notifications.mark-read');
        Route::post('notifications/mark-all-read', [HotelNotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    });
