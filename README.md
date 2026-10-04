# belajar-vibecoding

REST API dengan Bun + ElysiaJS + Drizzle ORM + MySQL.

## Setup

Install dependencies:

```bash
bun install
```

Copy `.env.example` ke `.env` dan sesuaikan `DATABASE_URL`.

Jalankan migrasi:

```bash
bun run db:generate   # generate migrasi dari schema
bun run db:migrate    # apply migrasi ke database
```

Run dev server:

```bash
bun run dev
```

## Endpoints

- `GET /health` — health check
- `GET /users` — list semua user
- `POST /users` — buat user (body: `{ "name": string, "email": string }`)
