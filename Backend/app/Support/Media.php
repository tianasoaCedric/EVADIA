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

        // Already a full URL — optionally rewrite to the current S3 base if it changed.
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $base = rtrim((string) config('filesystems.disks.s3.url', ''), '/');
            if ($base !== '' && ! str_starts_with($path, $base)) {
                $parsed = parse_url($path, PHP_URL_PATH);
                if (is_string($parsed) && $parsed !== '') {
                    return $base . $parsed;
                }
            }

            return $path;
        }

        // Preferred: build from the configured S3 public base URL (no S3 client).
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
     * Delete stored media from S3, unless disabled via MEDIA_DELETE_FILES=false.
     * In dev the demo bucket is shared: deleting a file would break the seeders
     * (and the databases) of every other developer pointing at it.
     *
     * @param  string|array<int, string|null>|null  $paths
     */
    public static function delete(string|array|null $paths): void
    {
        $paths = array_values(array_filter((array) $paths));

        if ($paths === [] || ! config('filesystems.media_delete', true)) {
            return;
        }

        Storage::disk('s3')->delete($paths);
    }

    /**
     * True when the value is empty or points to at least one file no longer on S3.
     * If S3 can't be queried, assume the files are there (never overwrite blindly).
     *
     * @param  string|array<int, string|null>|null  $paths
     */
    public static function missing(string|array|null $paths): bool
    {
        $paths = array_values(array_filter((array) $paths));

        if ($paths === []) {
            return true;
        }

        try {
            $disk = Storage::disk('s3');
            foreach ($paths as $path) {
                if (! $disk->exists($path)) {
                    return true;
                }
            }
        } catch (\Throwable) {
            return false;
        }

        return false;
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
