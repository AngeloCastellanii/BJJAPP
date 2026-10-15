# BJJApp

Comunidad de jiu-jitsu: amigos, academia, roladas, open mats, competencias, peleas, ranking, técnicas, feed y blog.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- PWA
- Deploy: Cloudflare Workers (OpenNext)

## Local

```bash
pnpm install
pnpm icons
pnpm dev
```

## Deploy

```bash
pnpm dlx wrangler login
pnpm deploy
```

En Windows el repo usa `nodeLinker: hoisted` para el build de OpenNext.
