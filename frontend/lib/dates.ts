/**
 * Date locale au format AAAA-MM-JJ.
 * À préférer à toISOString(), qui convertit en UTC : à Madagascar (UTC+3),
 * minuit local devient la veille à 21 h et la date est décalée d'un jour.
 */
export const toIsoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
