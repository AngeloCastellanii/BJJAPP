# MatLink

Web app de jiu-jitsu (marca propia): roladas, open mats, eventos, partners, peleas, ranking, technique tracker, feed y blog.

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

Abre [http://localhost:3000](http://localhost:3000) y entra con el perfil demo. La sesión se guarda en cookie.

## Qué incluye

- Auth demo (perfil seed o crear uno nuevo)
- Descubrir gente cerca e invitaciones de partner
- Roladas, open mats y eventos (unirse, invitar, cancelar)
- Peleas (retar, aceptar, registrar ganador)
- Ranking por periodo / academia
- Technique tracker
- Feed + blog
- Shell responsive con menú “Más” en móvil

## Supabase (opcional)

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/migrations/001_init.sql`.
3. Copia `.env.example` a `.env.local` y rellena las claves.

Mientras no haya env, la app usa datos demo en memoria.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
