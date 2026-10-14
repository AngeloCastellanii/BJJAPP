import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDateTime(value: string) {
  return format(parseISO(value), "d MMM yyyy · HH:mm", { locale: es });
}

export function formatDate(value: string) {
  return format(parseISO(value), "d MMM yyyy", { locale: es });
}

export function formatRelative(value: string) {
  return formatDistanceToNow(parseISO(value), { addSuffix: true, locale: es });
}

export function isPastDate(value: string) {
  return isPast(parseISO(value));
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
