# FE-001 — Scaffold Frontend Wreksa (Vite + React + TS + Tailwind + shadcn)

## Konteks untuk agent
Frontend SPA untuk **Wreksa**, konsumen dari backend NestJS `arsip-backend` yang sudah jadi.
Backend = engine tabel generik (menu → sheet → columns/rows/cells). Frontend Sprint 1 nanti:
login, sidebar dari `/menus`, browser Map/Berkas, upload import `.xlsx`, render tabel DTPS, CRUD baris.
**Stage ini HANYA fondasi — belum ada fitur.**

## Aturan kerja (WAJIB — sama seperti repo backend)
1. Sebelum mulai: nyatakan ulang tugas 1-2 kalimat, lalu buat `docs/tasks/FE-001-setup.md`.
2. Scaffold/infra boleh perubahan besar sekali jalan (pengecualian dari aturan incremental).
3. Setelah selesai: update task log — daftar file diubah + alasan, keputusan kunci, bagian "Belajar dari sini" (penjelasan untuk frontend engineer yang juga sedang belajar arsitektur).
4. Patuhi `CLAUDE.md` (dibuat di stage ini) untuk stage-stage berikutnya.

## Tujuan
Menyiapkan proyek React+Vite+TS strict dengan Tailwind v4, shadcn-ui, ikon Phosphor, dan seluruh
library inti terpasang; struktur folder feature-based; lapisan design token (CSS variables); alias
tunggal `@/`; tipe kontrak API dari response backend nyata; serta app yang jalan di localhost
sebagai bukti setup benar.

## Stack terkunci (jangan ganti tanpa konfirmasi)
- Vite + React 19 + TypeScript **strict**
- Tailwind CSS **terbaru (v4)** — gunakan setup resmi terkini untuk Vite + Tailwind v4
- **shadcn-ui** (tambah komponen saat dibutuhkan; stage ini cukup Button + Input untuk uji render)
- **Phosphor** `@phosphor-icons/react` — JANGAN lucide (override default shadcn)
- **TanStack Query** (server state) + **TanStack Table** (dipakai di stage tabel, pasang sekarang)
- **react-hook-form** + **zod** + **@hookform/resolvers**
- **zustand** (client state: access token in-memory + user)
- **react-router-dom** (routing)
- **react-dropzone** (drag-drop upload)
- **sonner** (toast)
- **date-fns** (format tanggal)

> Catatan versi: versi library bisa berubah. Gunakan dokumentasi resmi terkini untuk setup
> Vite + Tailwind v4 + shadcn; verifikasi versi yang terpasang, jangan menebak dari ingatan.

## Konvensi kode (WAJIB — tegakkan di semua stage)
- **Pisahkan hooks (logika) dari komponen (render).** Contoh: `features/auth/hooks/useLogin.ts`
  (logika) terpisah dari `features/auth/components/LoginForm.tsx` (render).
- **Maks 300 baris per file.** Kalau lebih, pecah jadi unit yang lebih kecil.
- **Satu alias saja: `@/` → `src`.** Jangan buat banyak alias, jangan bikin hutan barrel
  (`index.ts` re-export). Import langsung & eksplisit agar mudah dilacak junior.
- **Styling lewat design token** (CSS variables semantik). NOL warna/ukuran hardcoded di komponen.
  Saat token desain final datang, re-theme harus murah (cukup ganti nilai variable).
- TypeScript strict; hindari `any` (beri komentar alasan jika sangat terpaksa).
- Foldering feature-based (lihat di bawah).

## Struktur folder yang dibuat
```
src/
  main.tsx
  App.tsx                      # router + 1 route placeholder
  lib/
    api/client.ts              # axios instance (interceptor refresh menyusul FE-002)
    query-keys.ts              # placeholder factory key TanStack Query
  stores/                      # (kosong sekarang; auth.store.ts di FE-002)
  types/api.ts                 # kontrak API (diisi di stage ini)
  components/
    ui/                        # shadcn primitives
    layout/                    # (kosong sekarang)
  features/
    auth/    { hooks/ components/ pages/ }      # folder kosong + .gitkeep
    menus/   { hooks/ components/ }
    sheets/  { hooks/ components/ pages/ }
    imports/ { hooks/ components/ }
  styles/tokens.css            # design token shell
docs/tasks/FE-001-setup.md
CLAUDE.md
.env  .env.example
```

## File kunci yang dibuat

### 1. Alias `@/` → `src`
Konfigurasi di `vite.config.ts` (resolve.alias) dan `tsconfig` (paths). Hanya satu alias ini.

### 2. `src/styles/tokens.css` — design token shell
CSS variables semantik dengan nilai **placeholder netral** (hitam/putih/abu) meniru wireframe
(latar terang, aksen hitam, teks gelap). Akan diganti token final nanti. Minimal:
`--color-bg, --color-surface, --color-fg, --color-muted-fg, --color-border, --color-primary,
--color-primary-fg, --color-danger, --color-danger-fg, --radius`. Hubungkan ke theme Tailwind v4
(via `@theme`/CSS) agar utility memakai token. Jangan tulis hex di komponen.

### 3. `src/types/api.ts` — kontrak API (dari response backend NYATA, gunakan persis)
```ts
// ---- Roles ----
export type Role = 'ADMIN' | 'KAPRODI';

// ---- Auth ----
export interface ApiUser {
  id: string;
  username: string;
  fullName?: string; // HANYA ada di response login; /me & /refresh tidak mengembalikannya
  role: Role;
}
export interface LoginResponse {
  accessToken: string;
  user: ApiUser; // berisi fullName
}
export interface MeResponse {
  id: string;
  username: string;
  role: Role; // tanpa fullName → fallback ke username di UI
}
export interface RefreshResponse {
  accessToken: string;
}

// ---- Menu (Map) ----
export interface MenuSheetRef { id: string; name: string }
export interface MenuNode {
  id: string;
  name: string;
  orderIndex: number;
  sheets: MenuSheetRef[];
  children: MenuNode[];
}

// ---- Sheet ----
// 7 tipe kolom backend: TEXT, INTEGER, FLOAT, DATE, BOOLEAN, MARKING, URL
export type ColumnType = 'TEXT' | 'INTEGER' | 'FLOAT' | 'DATE' | 'BOOLEAN' | 'MARKING' | 'URL';

export interface SheetMeta {
  id: string;
  name: string;
  orderIndex: number;
  isReadOnly: boolean;
  menuItem: { id: string; name: string };
}
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  orderIndex: number;
  children: Column[]; // non-leaf = header grup (datanya null di rows), leaf = pembawa data
}
export interface SheetRow {
  rowId: string;                       // perhatikan: rowId, bukan id
  orderIndex: number;
  cells: Record<string, string | null>; // columnId -> value; SELALU string|null (termasuk INTEGER/URL)
}
export interface RowsResponse {
  rows: SheetRow[];
  total: number;
  limit: number;
  offset: number;
}

// ---- Row write ----
export interface CellWrite { columnId: string; value: string } // value:"" = HAPUS cell (delete-on-empty)
export interface RowWriteBody { cells: CellWrite[] }

// ---- Import ----
export interface ImportedSheet { sheetId: string; name: string; isReadOnly: boolean }
export interface ImportResponse {
  importId: string;
  workbookMenuId: string;
  sheets: ImportedSheet[];
}
```

### 4. `src/lib/api/client.ts` — instance axios dasar
Buat instance axios: `baseURL = import.meta.env.VITE_API_BASE`, `withCredentials: true`
(agar cookie refresh ikut). **Interceptor refresh + auth header menyusul di FE-002** — beri
komentar `// TODO(FE-002): request interceptor (Bearer) + response interceptor (401 → refresh → retry)`.

### 5. `src/App.tsx` + router
Satu route placeholder `/` menampilkan halaman kosong sederhana bertuliskan "Wreksa — siap"
(pakai komponen shadcn Button + satu ikon Phosphor untuk membuktikan keduanya render).
Bungkus app dengan `QueryClientProvider` (TanStack Query) dan `<Toaster />` (sonner).

### 6. `.env.example` + `.env`
```
VITE_API_BASE=http://localhost:3000
```

### 7. `CLAUDE.md` (root frontend) — aturan persisten untuk agent
Ringkas (<150 baris): north star Sprint 1 frontend, stack terkunci, konvensi kode di atas
(hooks≠render, 300 baris, satu alias, design token, feature-based), format task log `docs/tasks/`,
dan kontrak API ringkas (endpoint + bentuk response inti). Sertakan daftar urutan stage FE-001..FE-009
sebagai peta jalan.

### 8. `docs/tasks/FE-001-setup.md` — task log
Format: Tujuan / Rencana / File diubah (path+alasan) / Keputusan kunci / Belajar dari sini.

## Kriteria selesai (verifikasi, bukan cuma "jalan")
- `pnpm dev` jalan di `localhost:5173`; halaman "Wreksa — siap" tampil.
- Utility Tailwind v4 bekerja (mis. warna dari token via class).
- shadcn **Button** render benar; satu ikon **Phosphor** tampil.
- Alias `@/` resolve (import `@/types/api` di `App.tsx` lolos build).
- `QueryClientProvider` + `<Toaster />` terpasang tanpa error.
- `pnpm build` sukses; lint bersih.
- `tokens.css` termuat; **tidak ada hex/warna hardcoded** di komponen.

## Yang TIDAK dikerjakan di stage ini (cegah scope creep)
- Tidak ada login, auth store, atau interceptor refresh (itu FE-002 & FE-003).
- Tidak ada sidebar, menu, upload, atau tabel.
- Jangan tambah komponen shadcn selain Button/Input.
- Jangan sentuh/asumsikan endpoint apa pun selain menyiapkan tipe + base URL.
