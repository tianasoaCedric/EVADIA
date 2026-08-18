<?php

use App\Http\Controllers\Api\Mobile\MobileAuthController;
use App\Http\Controllers\Api\Admin\AbonnementController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\HotelController;
use App\Http\Controllers\Api\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Api\Admin\OffreController as AdminOffreController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Client\AvisController;
use App\Http\Controllers\Api\Client\BroadcastingTokenController;
use App\Http\Controllers\Api\Client\FavoriController;
use App\Http\Controllers\Api\Client\HotelController as ClientHotelController;
use App\Http\Controllers\Api\Client\NotificationController as ClientNotificationController;
use App\Http\Controllers\Api\Client\ProfileController;
use App\Http\Controllers\Api\Client\ReservationController as ClientReservationController;
use App\Http\Controllers\Api\Public\DecouverteController;
use App\Http\Controllers\Api\Public\OffreController as PublicOffreController;
use App\Http\Controllers\Api\Public\ContactController;
use App\Http\Controllers\Api\Public\DestinationController;
use App\Http\Controllers\Api\Public\ProprieteController as PublicProprieteController;
use App\Http\Controllers\Api\Public\SearchController;
use App\Http\Controllers\Api\Public\TypeHotelController;
use App\Http\Controllers\Api\Public\VilleController;
use App\Http\Controllers\Api\Hotel\CalendarController;
use App\Http\Controllers\Api\Hotel\DashboardController as HotelDashboardController;
use App\Http\Controllers\Api\Hotel\MessageController as HotelMessageController;
use App\Http\Controllers\Api\Hotel\OffreController as HotelOffreController;
use App\Http\Controllers\Api\Hotel\ReservationController as HotelReservationController;
use App\Http\Controllers\Api\Hotel\ReservationMessageController as HotelReservationMessageController;
use App\Http\Controllers\Api\Hotel\RoomController;
use App\Http\Controllers\Api\Client\ReservationMessageController as ClientReservationMessageController;
use Illuminate\Broadcasting\BroadcastController;
use Illuminate\Support\Facades\Route;

// ============================================================
// Routes Mobile (Bearer token, API key requis)
// ============================================================
Route::prefix('mobile')->middleware(['mobile.validate'])->group(function () {
    // Auth publique mobile
    Route::post('/auth/login',    [MobileAuthController::class, 'login'])->middleware('throttle:login');
    Route::post('/auth/register', [MobileAuthController::class, 'register'])->middleware('throttle:register');

    // Auth privée mobile
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me',         [MobileAuthController::class, 'me']);
        Route::post('/auth/logout',    [MobileAuthController::class, 'logout']);
        Route::post('/auth/logout-all',[MobileAuthController::class, 'logoutAll']);
    });
});

// ============================================================
// Routes publiques (pas d'authentification requise)
// ============================================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register'])
        ->middleware('throttle:register');
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:login');
    Route::get('/google', [GoogleAuthController::class, 'redirect']);
    Route::get('/google/callback', [GoogleAuthController::class, 'callback']);

    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
        ->middleware('throttle:6,1');
    Route::post('/verify-reset-code', [PasswordResetController::class, 'verifyCode'])
        ->middleware('throttle:10,1');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->middleware('throttle:6,1');
});

// Navigation / discovery — accessibles sans compte (booking.com style)
Route::get('/hotels', [ClientHotelController::class, 'index']);
Route::get('/hotels/{id}', [ClientHotelController::class, 'show']);
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/villes/popular', [VilleController::class, 'popular']);
Route::get('/villes/search', [VilleController::class, 'search']);
Route::get('/destinations/{id}/villes', [VilleController::class, 'byDestination']);
Route::get('/destinations/{id}/hotels', [VilleController::class, 'hotels']);
Route::get('/villes/{id}/hotels', [VilleController::class, 'hotelsByVille']);
Route::get('/offres', [PublicOffreController::class, 'index']);
Route::get('/offres/{id}', [PublicOffreController::class, 'show']);
Route::get('/types-hotels', [TypeHotelController::class, 'index']);
Route::get('/proprietes/{id}', [PublicProprieteController::class, 'show']);
Route::get('/hotels/{id}/reviews', [AvisController::class, 'byHotel']);
Route::get('/search', SearchController::class)->middleware('throttle:60,1');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');
Route::get('/decouverte/villes', [DecouverteController::class, 'villes']);
Route::get('/decouverte/villes/{slug}/lieux', [DecouverteController::class, 'lieux']);

// ============================================================
// Routes authentifiées (token Sanctum requis)
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Authentification des canaux WebSocket privés (Reverb) pour les clients mobile,
    // distincte de /broadcasting/auth (session web) utilisée par le dashboard hôtel.
    Route::match(['get', 'post'], '/broadcasting/auth', [BroadcastController::class, 'authenticate'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class])
        ->middleware('broadcasting.ability');

    // ----------------------------------------------------------
    // Auth : gestion de session
    // ----------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [LoginController::class, 'logout']);
        Route::post('/logout-all', [LoginController::class, 'logoutAll']);
        Route::get('/me', [LoginController::class, 'me']);
    });

    // ----------------------------------------------------------
    // Admin EVADIA (niveau <= 2 : super_admin, admin_evadia)
    // ----------------------------------------------------------
    Route::middleware('level:2')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('dashboard', [AdminDashboardController::class, 'index']);

        // Hôtels
        Route::apiResource('hotels', HotelController::class);

        // Utilisateurs
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::patch('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);

        // Abonnements
        Route::get('subscriptions', [AbonnementController::class, 'index']);
        Route::post('subscriptions', [AbonnementController::class, 'store']);
        Route::get('subscriptions/{id}', [AbonnementController::class, 'show']);

        // Offres
        Route::get('offers', [AdminOffreController::class, 'index']);
        Route::post('offers', [AdminOffreController::class, 'store']);
        Route::patch('offers/{id}/toggle', [AdminOffreController::class, 'toggle']);

        // Messagerie
        Route::get('messages', [AdminMessageController::class, 'index']);
        Route::get('messages/conversation/{userId}', [AdminMessageController::class, 'conversation']);
        Route::post('messages', [AdminMessageController::class, 'store']);
    });

    // ----------------------------------------------------------
    // Back-Office Hôtel (niveau <= 3 : admin_hotel, gestionnaire_hotel)
    // ----------------------------------------------------------
    Route::middleware('level:3')->prefix('hotel')->group(function () {
        // Dashboard
        Route::get('dashboard', [HotelDashboardController::class, 'index']);

        // Chambres
        Route::get('rooms', [RoomController::class, 'index']);
        Route::post('rooms', [RoomController::class, 'store']);
        Route::get('rooms/{id}', [RoomController::class, 'show']);
        Route::put('rooms/{id}', [RoomController::class, 'update']);
        Route::delete('rooms/{id}', [RoomController::class, 'destroy']);

        // Réservations
        Route::get('reservations', [HotelReservationController::class, 'index']);
        Route::get('reservations/{id}', [HotelReservationController::class, 'show']);
        Route::patch('reservations/{id}/accept', [HotelReservationController::class, 'accept']);
        Route::patch('reservations/{id}/reject', [HotelReservationController::class, 'reject']);
        Route::patch('reservations/{id}/mark-deposit-paid', [HotelReservationController::class, 'markDepositPaid']);
        Route::get('reservations/{id}/messages', [HotelReservationMessageController::class, 'index']);
        Route::post('reservations/{id}/messages', [HotelReservationMessageController::class, 'store']);

        // Calendrier & Disponibilités
        Route::get('calendar', [CalendarController::class, 'index']);
        Route::post('calendar/disponibilite', [CalendarController::class, 'update']);
        Route::post('calendar/bulk', [CalendarController::class, 'bulk']);

        // Offres
        Route::get('offers', [HotelOffreController::class, 'index']);
        Route::post('offers', [HotelOffreController::class, 'store']);
        Route::patch('offers/{id}/toggle', [HotelOffreController::class, 'toggle']);

        // Messagerie
        Route::get('messages', [HotelMessageController::class, 'index']);
        Route::get('messages/conversation/{userId}', [HotelMessageController::class, 'conversation']);
        Route::post('messages', [HotelMessageController::class, 'store']);
    });

    // ----------------------------------------------------------
    // Client (tout utilisateur authentifié)
    // ----------------------------------------------------------
    Route::prefix('client')->group(function () {
        // Recherche hôtels
        Route::get('hotels', [ClientHotelController::class, 'index']);
        Route::get('hotels/{id}', [ClientHotelController::class, 'show']);

        // Réservations
        Route::get('reservations', [ClientReservationController::class, 'index']);
        Route::post('reservations', [ClientReservationController::class, 'store']);
        Route::get('reservations/{id}', [ClientReservationController::class, 'show']);
        Route::patch('reservations/{id}/cancel', [ClientReservationController::class, 'cancel']);
        Route::get('reservations/{id}/invoice', [ClientReservationController::class, 'invoice']);
        Route::get('reservations/{id}/messages', [ClientReservationMessageController::class, 'index']);
        Route::post('reservations/{id}/messages', [ClientReservationMessageController::class, 'store']);
        Route::post('reservations/{id}/messages/paiement', [ClientReservationMessageController::class, 'choisirPaiement']);
        Route::post('broadcasting-token', [BroadcastingTokenController::class, 'store']);
        Route::get('promo/{code}', [ClientReservationController::class, 'verifierPromo']);

        // Favoris
        Route::get('favorites', [FavoriController::class, 'index']);
        Route::post('favorites', [FavoriController::class, 'store']);
        Route::delete('favorites/{hotelId}', [FavoriController::class, 'destroy']);

        // Avis
        Route::get('reviews', [AvisController::class, 'index']);
        Route::post('reviews', [AvisController::class, 'store']);

        // Notifications
        Route::get('notifications', [ClientNotificationController::class, 'index']);
        Route::get('notifications/unread-count', [ClientNotificationController::class, 'unreadCount']);
        Route::patch('notifications/{id}/read', [ClientNotificationController::class, 'markRead']);
        Route::patch('notifications/read-all', [ClientNotificationController::class, 'markAllRead']);
        Route::post('notifications/device-token', [ClientNotificationController::class, 'registerDeviceToken']);
        Route::delete('notifications/device-token', [ClientNotificationController::class, 'unregisterDeviceToken']);

        // Profil
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::put('profile/password', [ProfileController::class, 'updatePassword']);
    });

    // ----------------------------------------------------------
    // Super Admin (réservé aux opérations système)
    // ----------------------------------------------------------
    Route::middleware('role:super_admin')->prefix('super')->group(function () {
        // Routes système à définir
    });
});
