/** Comprime una imagen del navegador a data URL JPEG (demo, sin storage). */
export async function fileToDataUrl(
  file: File,
  maxSize = 720,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Solo se permiten imágenes");
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("La imagen supera 6MB");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}

export const DICEBEAR_STYLES = [
  { id: "notionists", label: "Notionists" },
  { id: "lorelei", label: "Lorelei" },
  { id: "avataaars", label: "Avataaars" },
  { id: "personas", label: "Personas" },
  { id: "adventurer", label: "Adventurer" },
  { id: "big-ears", label: "Big Ears" },
  { id: "fun-emoji", label: "Fun Emoji" },
  { id: "bottts", label: "Bottts" },
  { id: "shapes", label: "Shapes" },
  { id: "identicon", label: "Identicon" },
] as const;

export type DicebearStyle = (typeof DICEBEAR_STYLES)[number]["id"];

const BACKGROUNDS = "e8e6e1,ebe7e0,e4ebe7,e8e8ef,efe6e3";

export function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${BACKGROUNDS}`;
}

/** Fallback usado en seed / perfiles sin foto */
export function avatarFallback(seed: string) {
  return dicebearUrl("notionists", seed);
}

/** Seeds base del catálogo (cada uno genera un rostro distinto) */
export const AVATAR_CATALOG_SEEDS = [
  "bjjapp-01",
  "bjjapp-02",
  "bjjapp-03",
  "bjjapp-04",
  "bjjapp-05",
  "bjjapp-06",
  "bjjapp-07",
  "bjjapp-08",
  "bjjapp-09",
  "bjjapp-10",
  "bjjapp-11",
  "bjjapp-12",
  "bjjapp-13",
  "bjjapp-14",
  "bjjapp-15",
  "bjjapp-16",
  "bjjapp-17",
  "bjjapp-18",
  "bjjapp-19",
  "bjjapp-20",
  "bjjapp-21",
  "bjjapp-22",
  "bjjapp-23",
  "bjjapp-24",
] as const;

export function parseDicebearUrl(url: string | null | undefined): {
  style: DicebearStyle;
  seed: string;
} | null {
  if (!url) return null;
  const match = url.match(
    /api\.dicebear\.com\/9\.x\/([^/]+)\/svg\?seed=([^&]+)/,
  );
  if (!match) return null;
  const style = decodeURIComponent(match[1]) as DicebearStyle;
  const seed = decodeURIComponent(match[2]);
  if (!DICEBEAR_STYLES.some((s) => s.id === style)) return null;
  return { style, seed };
}
