This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

## secret env

```
# Postgres
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@postgres:5432/postgres?schema=public

# NextAuth
NEXTAUTH_URL=
NEXTAUTH_SECRET==

# Auth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_ID=
GITHUB_SECRET=
```

## prisma

```bash
npx prisma migrate dev --create-only --name init
npx prisma migrate dev
```

```bash
npx prisma generate
```

#### seed追加

```bash
npx prisma db seed
```

```
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@postgres:5432/postgres?schema=public" npx ts-node scripts/batch.ts createScrees
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@postgres:5432/postgres?schema=public" npx ts-node scripts/batch.ts createSeats
```

### dotenv

```bash
./node_modules/.bin/dotenv -e .env.local -- npx prisma db seed
```

```bash
POSTGRES_PRISMA_URL="postgresql://postgres:postgres@postgres:5432/postgres?schema=public" npx ts-node scripts/batch.ts createSeats
```
