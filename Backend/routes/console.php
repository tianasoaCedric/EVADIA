<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Échéances d'abonnement : rappels, retards, suspensions pour impayé.
// Exécuté par le conteneur « scheduler » (php artisan schedule:work).
Schedule::command('abonnements:echeances')->dailyAt('06:00')->withoutOverlapping();
