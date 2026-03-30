import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  // Récupérer la langue depuis les cookies
  const cookieStore = await cookies();
  let locale = cookieStore.get('NEXT_LOCALE')?.value || 'fr';
  
  // Vérifier que la langue est valide
  if (locale !== 'fr' && locale !== 'en') {
    locale = 'fr';
  }
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});