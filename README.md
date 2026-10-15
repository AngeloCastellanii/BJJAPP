# BJJApp

Comunidad de jiu-jitsu: amigos, academia, roladas, open mats, competencias, peleas, ranking, técnicas, feed y blog.

## Stack

- Next.js 16.1.7 + React 19 + TypeScript (compatible con Cloudflare/OpenNext)
- Tailwind CSS 4
- PWA
- Deploy: Cloudflare Workers (OpenNext)

## Local

Copia `.env.example` → `.env.local` y define:

- `BJJAPP_AUTH_EMAIL`
- `BJJAPP_AUTH_PASSWORD`

```bash
pnpm install
pnpm icons
pnpm dev
```

## Deploy

```bash
pnpm dlx wrangler login
echo TU_CORREO | pnpm exec wrangler secret put BJJAPP_AUTH_EMAIL
echo TU_CLAVE | pnpm exec wrangler secret put BJJAPP_AUTH_PASSWORD
pnpm deploy
```

En Windows el repo usa `nodeLinker: hoisted` para el build de OpenNext.
