<?php

namespace App\Console\Commands;

use App\Support\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * Génère les versions réduites (WebP) des images déjà présentes sur S3.
 * Les nouveaux uploads les génèrent eux-mêmes (Media::storeImage) ; cette commande
 * sert à rattraper l'existant. Idempotente : une image déjà traitée est ignorée.
 */
class GenererVariantesImages extends Command
{
    protected $signature = 'media:variantes
                            {--dossier= : Ne traiter qu\'un dossier du bucket (ex. hotels)}
                            {--force : Régénérer même si les versions existent déjà}';

    protected $description = 'Génère les versions réduites (WebP) des images stockées sur S3';

    private const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    public function handle(): int
    {
        ini_set('memory_limit', '1024M');

        $disk = Storage::disk('s3');
        $fichiers = $disk->allFiles((string) $this->option('dossier'));
        $existants = array_flip($fichiers);

        $images = array_values(array_filter($fichiers, fn (string $path) =>
            in_array(strtolower(pathinfo($path, PATHINFO_EXTENSION)), self::EXTENSIONS, true)
            && ! Media::isVariant($path)
        ));

        $aTraiter = $this->option('force')
            ? $images
            : array_values(array_filter($images, function (string $path) use ($existants) {
                foreach (array_keys(Media::VARIANTS) as $variant) {
                    if (! isset($existants[Media::variantPath($path, $variant)])) {
                        return true;
                    }
                }

                return false;
            }));

        $this->info(count($images) . ' image(s) trouvée(s), ' . count($aTraiter) . ' à traiter.');

        $echecs = 0;
        $this->withProgressBar($aTraiter, function (string $path) use (&$echecs) {
            if (! Media::makeVariants($path)) {
                $echecs++;
            }
        });
        $this->newLine();

        if ($echecs > 0) {
            $this->warn("{$echecs} image(s) n'ont pas pu être traitées (voir les logs).");
        }

        return self::SUCCESS;
    }
}
