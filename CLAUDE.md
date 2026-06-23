# CLAUDE.md — Wreksa Frontend

## North Star Sprint 1
SPA React yang mengkonsumsi backend NestJS `arsip-backend`.
Fitur: login, sidebar menu (`/menus`), browser Map/Berkas, upload `.xlsx`, render tabel DTPS, CRUD baris.

## Peta Jalan Stage
| Stage    | Fokus |
|----------|-------|
| FE-001   | Fondasi (setup ini) ✅ |
| FE-002   | Auth: login form, auth store (zustand), axios interceptor Bearer |
| FE-003   | Interceptor refresh token (401 → /auth/refresh → retry) |
| FE-004   | Sidebar: fetch `/menus`, tree navigasi |
| FE-005   | Sheet browser: daftar sheet per menu |
| FE-006   | Render tabel DTPS (TanStack Table, kolom bertingkat) |
| FE-007   | CRUD baris (tambah/edit/hapus cell) |
| FE-008   | Import `.xlsx` (react-dropzone, progress) |
| FE-009   | Polish: loading state, error boundary, empty state |

## Stack Terkunci (jangan ganti tanpa konfirmasi)
- Vite 8 + React 19 + TypeScript 6 strict
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn-ui (komponen manual di `src/components/ui/`) — TANPA lucide
- **Phosphor** `@phosphor-icons/react` — WAJIB, bukan lucide
- TanStack Query v5 + TanStack Table v8
- react-hook-form + zod + @hookform/resolvers
- zustand v5 (client state: access token in-memory + user)
- react-router-dom v7
- react-dropzone, sonner, date-fns, axios

## Konvensi Kode (WAJIB di semua stage)

### 1. Pisahkan hooks dari komponen
```
features/auth/hooks/useLogin.ts     ← logika, query, mutation
features/auth/components/LoginForm.tsx  ← render saja
```

### 2. Maks 300 baris per file
Kalau lebih, pecah jadi unit lebih kecil.

### 3. Satu alias: `@/` → `src`
Import langsung dan eksplisit. Tidak ada barrel `index.ts` re-export.
```ts
import { Button } from '@/components/ui/button';  // ✅
import { Button } from '@/components/ui';          // ❌ barrel
```

### 4. Styling lewat design token
```ts
className="bg-[var(--color-primary)]"  // ✅
className="bg-black"                   // ❌ hardcoded
```
Token didefinisikan di `src/styles/tokens.css`.

### 5. TypeScript strict
Hindari `any`. Beri komentar alasan jika sangat terpaksa.

## Kontrak API Ringkas

| Endpoint               | Method | Response |
|------------------------|--------|----------|
| `/auth/login`          | POST   | `LoginResponse` |
| `/auth/me`             | GET    | `MeResponse` |
| `/auth/refresh`        | POST   | `RefreshResponse` |
| `/menu-items`          | GET    | `MenuNode[]` |
| `/sheets/:id`          | GET    | `SheetMeta` |
| `/sheets/:id/rows`     | GET    | `RowsResponse` |
| `/sheets/:id/rows`     | POST   | `SheetRow` |
| `/sheets/:id/rows/:rid`| PATCH  | `SheetRow` |
| `/sheets/:id/rows/:rid`| DELETE | `void` |
| `/import`              | POST   | `ImportResponse` |

Tipe lengkap di `src/types/api.ts`.

Cookie httpOnly `refreshToken` dikirim otomatis (`withCredentials: true`).

## Format Task Log
Simpan di `docs/tasks/FE-XXX-nama.md`.
Bagian wajib: Tujuan / Rencana / File diubah / Keputusan kunci / Belajar dari sini.

## Kebijakan Mock (Sprint 1 → Sprint 2)

Fitur yang belum punya backend **WAJIB** dibangun di balik interface yang sama dengan API asli nanti:
```
features/<x>/api/<x>.api.ts   ← ekspor fungsi async (baca/tulis sessionStorage sementara)
```

Aturan:
1. Tandai setiap baris mock dengan komentar `// MOCK(sprint2)`.
2. **Simpan metadata, bukan byte file** — sessionStorage hanya string, batas ~5MB.
   Untuk upload: simpan `{ id, name, size, mimeType, uploadedAt }`.
3. Setiap mock **wajib** punya entri di `docs/sprint2-backend-needs.md`.
4. **Login BUKAN mock** — `POST /auth/login` tersambung ke endpoint nyata sejak FE-003.
5. Saat backend siap, cukup ganti implementasi satu file — konsumen tidak berubah.
