import { cn } from "@/lib/cn";

const tones = [
  "bg-[#ebe7e0] text-[#3f3a34]",
  "bg-[#e4ebe7] text-[#2f4338]",
  "bg-[#e8e8ef] text-[#34344a]",
  "bg-[#efe6e3] text-[#4a322c]",
];

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const tone =
    tones[
      Math.abs(
        Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
      ) % tones.length
    ];

  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-16 w-16 text-lg",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight ring-2 ring-white",
        tone,
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}
