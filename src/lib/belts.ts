import type { Belt } from "./types";

export const BELT_LABELS: Record<Belt, string> = {
  white: "Blanco",
  blue: "Azul",
  purple: "Morado",
  brown: "Marrón",
  black: "Negro",
  coral: "Coral",
  red: "Rojo",
};

export const BELT_COLORS: Record<Belt, string> = {
  white: "#F5F5F5",
  blue: "#2563EB",
  purple: "#7C3AED",
  brown: "#92400E",
  black: "#171717",
  coral: "#FB7185",
  red: "#DC2626",
};

export const BELTS: Belt[] = [
  "white",
  "blue",
  "purple",
  "brown",
  "black",
  "coral",
  "red",
];

export function formatBelt(belt: Belt, stripes: number) {
  const label = BELT_LABELS[belt];
  if (stripes <= 0) return label;
  return `${label} · ${stripes} grado${stripes === 1 ? "" : "s"}`;
}
