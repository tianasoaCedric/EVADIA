<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateMobileRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-Mobile-Api-Key');
        $expected = config('mobile.api_key');

        if (! $apiKey || ! hash_equals($expected, $apiKey)) {
            return response()->json(['message' => 'Accès non autorisé.'], 401);
        }

        return $next($request);
    }
}
