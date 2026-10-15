import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl tracking-tight">No encontrado</h1>
      <p className="mt-2 text-sm text-muted">Esa ruta no existe en BJJApp.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
