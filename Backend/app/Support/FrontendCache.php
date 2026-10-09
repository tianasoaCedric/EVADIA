<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Vide les caches qui gardent l'ancienne version du contenu public
 * (photos de villes / destinations…) après une modification en back office :
 *  - cache Redis de l'API publique ;
 *  - cache de données / pages de Next.js (route interne /api/revalidate).
 */
class FrontendCache
{
    /** Clés Redis dérivées des villes / destinations. */
    private const CLES_REDIS = ['villes:popular', 'decouverte:villes'];

    public static function purgerDestinationsEtVilles(): void
    {
        foreach (self::CLES_REDIS as $cle) {
            Cache::forget($cle);
        }

        self::revaliderNext();
    }

    /**
     * Après une réservation créée ou changeant de statut : classement des
     * destinations populaires. La revalidation Next part après la réponse HTTP.
     */
    public static function purgerVillesPopulaires(): void
    {
        Cache::forget('villes:popular');

        dispatch(fn () => self::revaliderNext())->afterResponse();
    }

    /** Après un changement de visibilité d'un hôtel (suspension, réactivation). */
    public static function purgerHotels(): void
    {
        \App\Models\Hotel::flushSearchCache();
        self::purgerDestinationsEtVilles();
    }

    private static function revaliderNext(): void
    {
        $url = config('services.frontend.internal_url');
        $secret = config('services.frontend.revalidate_secret');

        if (!$url || !$secret) {
            return;
        }

        try {
            Http::timeout(3)
                ->withHeaders(['x-revalidate-secret' => $secret])
                ->post(rtrim($url, '/') . '/api/revalidate');
        } catch (Throwable $e) {
            // Le site se mettra à jour à l'expiration normale de son cache.
            Log::warning('Revalidation Next.js impossible', ['error' => $e->getMessage()]);
        }
    }
}
