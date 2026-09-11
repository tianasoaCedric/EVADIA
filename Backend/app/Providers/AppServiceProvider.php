<?php

namespace App\Providers;

use App\Models\Avis;
use App\Observers\AvisObserver;
use App\Support\Media;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Avis::observe(AvisObserver::class);

        // Safe media URL — never instantiates the S3 client, so a missing/incomplete
        // AWS config (e.g. a fresh clone) can't 500 a page that displays an image.
        Blade::directive('mediaUrl', fn ($expr) => "<?php echo e(\App\Support\Media::url({$expr})); ?>");

        RateLimiter::for('login', function (Request $request) {
            $key = $request->input('email', '') . '|' . $request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });
    }
}
