import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-4xl">No encontrado</h1>
      <p className="mt-2 text-muted">Esa ruta no existe en MatLink.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
