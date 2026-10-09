<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class Media
{
    /**
     * Versions réduites (WebP) générées à côté de chaque image : "<chemin>.<nom>.webp".
     * Les apps les demandent à la place de l'original (souvent 1 à 3 Mo) et
     * retombent sur l'original si la version n'existe pas.
     *
     * @var array<string, int> nom => largeur max en px
     */
    public const VARIANTS = ['sm' => 640, 'md' => 1280];

    private const VARIANT_QUALITY = 75;

    /** Stocke une image uploadée sur S3 et génère ses versions réduites. Retourne le chemin de l'original. */
    public static function storeImage(UploadedFile $file, string $dir): string
    {
        $path = $file->store($dir, 's3');
        self::makeVariants($path, (string) file_get_contents($file->getRealPath()));

        return $path;
    }

    public static function variantPath(string $path, string $variant): string
    {
        return "{$path}.{$variant}.webp";
    }

    public static function isVariant(string $path): bool
    {
        return (bool) preg_match('/\.(' . implode('|', array_keys(self::VARIANTS)) . ')\.webp$/', $path);
    }

    /**
     * Génère les versions réduites d'une image déjà stockée. Ne lève jamais d'exception :
     * en cas d'échec (format non supporté, GD absent…), les apps afficheront l'original.
     *
     * @param  string|null  $contents  Contenu de l'original s'il est déjà en mémoire (évite un téléchargement S3).
     */
    public static function makeVariants(string $path, ?string $contents = null): bool
    {
        if (! function_exists('imagewebp')) {
            Log::warning('Media: GD sans support WebP, versions réduites non générées.');

            return false;
        }

        try {
            $disk = Storage::disk('s3');
            $contents ??= $disk->get($path);
            $source = $contents ? @imagecreatefromstring($contents) : false;
            if (! $source) {
                return false;
            }

            $source = self::applyExifOrientation($source, $contents);
            $width = imagesx($source);
            $height = imagesy($source);

            foreach (self::VARIANTS as $variant => $maxWidth) {
                $targetWidth = min($maxWidth, $width);
                $targetHeight = (int) round($height * $targetWidth / $width);

                $resized = imagecreatetruecolor($targetWidth, $targetHeight);
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

                ob_start();
                imagewebp($resized, null, self::VARIANT_QUALITY);
                $webp = (string) ob_get_clean();
                imagedestroy($resized);

                $disk->put(self::variantPath($path, $variant), $webp, [
                    'ContentType' => 'image/webp',
                    'CacheControl' => 'public, max-age=31536000, immutable',
                ]);
            }

            imagedestroy($source);

            return true;
        } catch (\Throwable $e) {
            Log::warning("Media: versions réduites non générées pour {$path}", ['error' => $e->getMessage()]);

            return false;
        }
    }

    /** Les photos de téléphone sont souvent stockées « couchées » avec une orientation EXIF que GD ignore. */
    private static function applyExifOrientation(\GdImage $image, string $contents): \GdImage
    {
        if (! function_exists('exif_read_data') || ! str_starts_with($contents, "\xFF\xD8")) {
            return $image;
        }

        $exif = @exif_read_data('data://image/jpeg;base64,' . base64_encode($contents));
        $angle = match ($exif['Orientation'] ?? 1) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);
        imagedestroy($image);

        return $rotated;
    }
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

        $withVariants = [];
        foreach ($paths as $path) {
            $withVariants[] = $path;
            foreach (array_keys(self::VARIANTS) as $variant) {
                $withVariants[] = self::variantPath($path, $variant);
            }
        }

        Storage::disk('s3')->delete($withVariants);
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
