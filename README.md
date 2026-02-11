<p align="center">
  <a href="https://cineposi.com">
    <img src="https://github.com/user-attachments/assets/80f4be1f-c20f-4502-bae2-975e2a6eef27" alt="Logo">
  </a>
</p>

# 🎬シネポジ cineposi

映画館の座席レビューを共有できるサービスです。

## 技術

### Web

- Next.js 14.2.5
- React 18
- NextAuth
- prisma

### Design

- tailwindcss
- shadcn/ui

### Database

- postgres

## ER図

> [!WARNING]
> 作成中

## ネットワーク構成

> [!WARNING]
> 作成中

## 環境構築

> [!WARNING]
> 作成中

### secret env

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

# Notion
NOTION_API_KEY=
NOTION_DATABASE_ID=
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
