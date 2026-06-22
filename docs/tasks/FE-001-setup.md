# FE-001 — Scaffold Frontend Wreksa

## Tujuan
Menyiapkan fondasi frontend SPA Wreksa: Vite 8 + React 19 + TypeScript 6 strict + Tailwind v4
+ shadcn (manual) + Phosphor icons + semua library inti terpasang. Tidak ada fitur — hanya
infrastruktur siap pakai untuk sprint berikutnya.

## Rencana
1. Scaffold Vite `react-ts` → update `package.json` + tsconfig strict + alias `@/`
2. Install semua runtime deps sekaligus
3. Install Tailwind v4 (`tailwindcss` + `@tailwindcss/vite`)
4. Setup shadcn manual (tidak pakai CLI interaktif): install peer deps, buat `lib/utils.ts`, Button, Input
5. Buat struktur folder feature-based + file kunci
6. Verifikasi: `pnpm build` sukses + `pnpm lint` bersih + screenshot Puppeteer

## File Diubah / Dibuat

| Path | Alasan |
|------|--------|
| `package.json` | Rename dari `arsip-temp`, deps ditambah |
| `vite.config.ts` | Plugin `@tailwindcss/vite` + alias `@/` → `src` |
| `tsconfig.app.json` | `strict: true`, `paths` untuk alias, `ignoreDeprecations: "6.0"` (TS6 deprecasi baseUrl) |
| `index.html` | Ganti title ke "Wreksa" |
| `src/main.tsx` | Import `@/styles/tokens.css`, hapus `index.css` bawaan Vite |
| `src/App.tsx` | Router, QueryClientProvider, Toaster, placeholder page |
| `src/styles/tokens.css` | Design token shell via CSS variables + `@theme` Tailwind v4 |
| `src/types/api.ts` | Kontrak API lengkap dari response backend nyata |
| `src/lib/api/client.ts` | Instance axios dengan `baseURL` + `withCredentials` |
| `src/lib/query-keys.ts` | Factory key TanStack Query (placeholder) |
| `src/lib/utils.ts` | Helper `cn()` = clsx + tailwind-merge |
| `src/components/ui/button.tsx` | Button berbasis CVA + Radix Slot, styling via token |
| `src/components/ui/input.tsx` | Input berbasis token |
| `src/features/**/` | Folder kosong + `.gitkeep` untuk auth/menus/sheets/imports |
| `.env` / `.env.example` | `VITE_API_BASE=http://localhost:3000` |
| `CLAUDE.md` | Aturan persisten: stack, konvensi, peta jalan, kontrak API ringkas |

File dihapus: `src/App.css`, `src/index.css` (CSS bawaan Vite — tidak dipakai)

## Keputusan Kunci

**Shadcn manual, bukan CLI** — CLI `shadcn@latest init` selalu interaktif (TTY). Daripada
memaksa piping yang brittle, komponen Button dan Input ditulis manual menggunakan pola CVA
yang sama persis. Lebih transparan dan mudah dilacak.

**Tailwind v4 tanpa `tailwind.config.*`** — v4 menggunakan `@theme { }` langsung di CSS.
Config JS tidak diperlukan. Plugin `@tailwindcss/vite` otomatis mendeteksi kelas di source.

**TypeScript 6 `baseUrl` deprecation** — TS6 memperingatkan `baseUrl` akan dihapus di TS7.
Solusi: tambah `"ignoreDeprecations": "6.0"`. Alias `paths` tetap berfungsi normal.

**shadcn peer deps yang diinstall:** `class-variance-authority`, `clsx`, `tailwind-merge`,
`@radix-ui/react-slot`, `@radix-ui/react-label`

## Belajar dari Sini

### Mengapa pisah hooks dari komponen?
Komponen = "tampilkan ini". Hook = "ambil/ubah data ini". Ketika dipisah, kita bisa:
- Ganti UI tanpa sentuh logika (atau sebaliknya)
- Test logika tanpa mounting komponen
- Baca komponen tanpa noise query/mutation

### Mengapa design token lewat CSS variables?
```css
/* tokens.css */
--color-primary: #111111;
```
```tsx
/* komponen */
className="bg-[var(--color-primary)]"
```
Saat klien datang dengan design system baru, cukup ganti nilai di `tokens.css`.
Tidak perlu sentuh satupun komponen.

### Mengapa satu alias `@/` saja?
Junior sering bingung dengan multiple alias (`@components/`, `@hooks/`, dll).
`@/` → `src` artinya: apapun di `src/`, import dengan `@/path/ke/file`.
Simple, mudah di-grep, tidak ada "magic" tersembunyi.

### Mengapa tidak pakai `index.ts` barrel re-export?
```ts
// ❌ barrel — menyembunyikan dependensi nyata
import { Button, Input, Card } from '@/components/ui';

// ✅ eksplisit — mudah dilacak, refactor aman
import { Button } from '@/components/ui/button';
```
Barrel membuat tree-shaking lebih susah dan menyembunyikan dari mana sebuah symbol berasal.

### Stack version snapshot (2026-06-22)
- Vite 8.0.16, React 19.2.7, TypeScript 6.0.3
- Tailwind CSS 4.3.1, @tailwindcss/vite 4.3.1
- TanStack Query 5.101.0, TanStack Table 8.21.3
- zustand 5.0.14, react-router-dom 7.18.0
- react-hook-form 7.80.0, zod 4.4.3, @hookform/resolvers 5.4.0
- @phosphor-icons/react 2.1.10, sonner 2.0.7, date-fns 4.4.0, axios 1.18.0

## Hasil Verifikasi
- `pnpm build` ✅ — 724ms, 323KB JS, 12.5KB CSS
- `pnpm lint` ✅ — No issues found
- `pnpm dev` ✅ — localhost:5173 ready in 423ms
- Screenshot Puppeteer ✅ — H1 "Wreksa — siap", Button "Mulai", ikon ArrowRight terlihat
- Background: `--color-bg` (#f9f9f9), Button: `--color-primary` (#111) — tidak ada hex di komponen
