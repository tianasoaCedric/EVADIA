import { useEffect, useState } from 'react';
import { Image, ImageProps } from 'expo-image';

/** Fond affiché pendant le chargement (même gris que les placeholders existants). */
export const IMAGE_PLACEHOLDER_COLOR = '#e5e7eb';

/**
 * Versions réduites générées par le backend à côté de chaque image S3
 * (voir Backend/app/Support/Media.php) : "<url>.sm.webp" (640 px) et "<url>.md.webp" (1280 px).
 * - sm : vignettes et cartes (≈ 30-60 Ko)
 * - md : images plein écran (≈ 100-200 Ko)
 * - original : fichier tel qu'uploadé (souvent 1 à 3 Mo)
 */
export type ImageVariant = 'sm' | 'md' | 'original';

const S3_IMAGE = /^https:\/\/[^/]+\.amazonaws\.com\/.+\.(jpe?g|png|webp|gif)$/i;

/** URL de la version réduite pour une image S3 ; les autres URLs (Unsplash…) sont renvoyées telles quelles. */
export function variantUrl(url: string, variant: ImageVariant): string {
  if (variant === 'original' || !S3_IMAGE.test(url) || /\.(sm|md)\.webp$/.test(url)) return url;
  return `${url}.${variant}.webp`;
}

type AppImageProps = Omit<ImageProps, 'source'> & {
  /** URL distante (S3, Unsplash…) ou ressource locale (require). */
  source: string | number | null | undefined;
  /** Taille à télécharger pour une image S3 (défaut : md). */
  variant?: ImageVariant;
};

/**
 * Image de l'app, basée sur expo-image au lieu de l'Image de React Native :
 * - télécharge une version réduite (WebP) au lieu de l'original, et retombe sur
 *   l'original si cette version n'existe pas encore ;
 * - cache mémoire + disque : une photo déjà vue s'affiche instantanément, même après
 *   un redémarrage, et la même URL (carte → fiche hôtel) n'est téléchargée qu'une fois ;
 * - décodage à la taille affichée (pas l'original 2 Mo en mémoire pour une vignette) ;
 * - fond gris pendant le chargement puis fondu, au lieu d'un blanc qui « saute ».
 *
 * Pour une image dans une liste qui recycle ses cellules (FlatList), passer `recyclingKey`.
 */
export function AppImage({ source, style, variant = 'md', onError, ...rest }: AppImageProps) {
  const [fallback, setFallback] = useState(false);
  useEffect(() => setFallback(false), [source]);

  const uri = typeof source === 'string' ? (fallback ? source : variantUrl(source, variant)) : null;

  return (
    <Image
      source={uri !== null ? { uri } : source ?? undefined}
      cachePolicy="memory-disk"
      contentFit="cover"
      transition={200}
      style={[{ backgroundColor: IMAGE_PLACEHOLDER_COLOR }, style]}
      onError={(e) => {
        if (typeof source === 'string' && uri !== source) setFallback(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
}

/**
 * Télécharge à l'avance des images (ex. photos des hôtels de l'accueil) dans le cache disque,
 * pour qu'elles soient prêtes quand l'utilisateur ouvre la fiche. Sans effet si déjà en cache.
 * Utiliser le même `variant` que l'AppImage qui les affichera, sinon le cache ne sert pas.
 */
export function prefetchImages(urls: (string | null | undefined)[], variant: ImageVariant = 'md'): void {
  const unique = Array.from(
    new Set(urls.filter((u): u is string => !!u && u.startsWith('http')).map((u) => variantUrl(u, variant))),
  );
  if (unique.length === 0) return;
  Image.prefetch(unique, 'memory-disk').catch(() => {});
}
