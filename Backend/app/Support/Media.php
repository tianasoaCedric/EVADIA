<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class Media
{
    /**
     * Build a public URL for a stored media path without ever instantiating
     * the S3 client (which throws when AWS config is incomplete, e.g. a fresh
     * clone with no credentials in .env). Falls back gracefully.
     *
     * @param  string|null  $path  Stored path (e.g. "villes/abc.jpg") or a full URL.
     * @param  string|null  $placeholder  Returned when $path is empty.
     */
    public static function url(?string $path, ?string $placeholder = null): ?string
    {
        $path = $path !== null ? trim($path) : '';

        if ($path === '') {
            return $placeholder;
        }

        // Already a full URL — optionally rewrite legacy S3 hosts to the CDN.
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $cdn = rtrim((string) config('filesystems.disks.s3.url', ''), '/');
            if ($cdn !== '' && ! str_starts_with($path, $cdn)) {
                $parsed = parse_url($path, PHP_URL_PATH);
                if (is_string($parsed) && $parsed !== '') {
                    return $cdn . $parsed;
                }
            }

            return $path;
        }

        // Preferred: build from the configured CDN / public base URL (no S3 client).
        $base = rtrim((string) config('filesystems.disks.s3.url', ''), '/');
        if ($base !== '') {
            return $base . '/' . ltrim($path, '/');
        }

        // Last resort: ask the disk, but never let a misconfigured client 500 the page.
        try {
            return Storage::disk('s3')->url($path);
        } catch (\Throwable) {
            return $placeholder;
        }
    }

    /**
     * Map an array of stored paths to public URLs, dropping any that resolve to null.
     *
     * @param  iterable<int, string|null>|null  $paths
     * @return array<int, string>
     */
    public static function urls(?iterable $paths): array
    {
        $out = [];
        foreach ($paths ?? [] as $path) {
            $url = self::url($path);
            if ($url !== null) {
                $out[] = $url;
            }
        }

        return $out;
    }
}
