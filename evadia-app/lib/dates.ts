/**
 * Date locale au format AAAA-MM-JJ (même règle que frontend/lib/dates.ts).
 * À préférer à toISOString(), qui convertit en UTC : à Madagascar (UTC+3),
 * minuit local devient la veille à 21 h et la date est décalée d'un jour.
 */
export const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Nombre de nuits entre deux dates locales (arrivée incluse, départ exclu). */
export const nightsBetween = (checkIn: Date, checkOut: Date): number =>
  Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

/** Aujourd'hui à minuit, heure locale. */
export const startOfToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
