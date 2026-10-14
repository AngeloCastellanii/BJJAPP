# MatLink

Web app de jiu-jitsu (marca propia) inspirada en el ecosistema estilo Ujitsu: roladas, open mats, eventos, partners, peleas, ranking, technique tracker, feed y blog.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- PWA (`manifest.webmanifest` + service worker)
- Capa de datos desacoplada en `src/server/`
- Supabase listo (`supabase/migrations/001_init.sql`)

## Arranque

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) y entra con el perfil demo.

## Supabase (opcional)

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_init.sql`.
3. Copia `.env.example` a `.env.local` y rellena las claves.

Mientras no haya env, la app usa datos demo en memoria (persistentes durante `pnpm dev`).

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
