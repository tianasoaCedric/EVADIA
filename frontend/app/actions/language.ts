'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function changeLanguage(locale: string, currentPath: string) {
  const cookieStore = await cookies();
  
  // Définir le cookie avec la nouvelle langue
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  
  // Rediriger vers la même page
  redirect(currentPath);
}