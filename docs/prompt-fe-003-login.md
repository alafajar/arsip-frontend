# FE-003 — Integrasi Design Token + Login UI

## Konteks untuk agent
Lanjutan frontend Wreksa. Stage ini: (1) terjemahkan design token nyata ke sistem Tailwind v4 +
shadcn, ganti placeholder FE-001; (2) bangun layar login (Image 1/2 wireframe) yang **tersambung ke
endpoint nyata** `POST /auth/login`. Auth-client (store, interceptor, `auth.api.ts`) sudah ada dari FE-002.

**Baca dulu yang sudah ada & jangan menebak:** `STATE.md`, `CLAUDE.md`, `src/styles/tokens.css`
(placeholder FE-001), `src/lib/api/auth.api.ts`, `src/stores/auth.store.ts`, `src/types/api.ts`,
dan file token `tailwind.tokens.json` (dilampirkan user).

## Aturan kerja (WAJIB)
1. Nyatakan ulang tugas 1-2 kalimat; buat `docs/tasks/FE-003-login.md`.
2. Incremental & kecil; pisahkan hooks (logika) dari komponen (render); ≤300 baris/file; satu alias `@/`.
3. Akhiri: update task log (file diubah+alasan, keputusan kunci, "Belajar dari sini").

## Tujuan
Login bekerja: user benar → token di store → masuk ke `/`. Kredensial salah → error inline persis
wireframe. Seluruh warna/spacing/radius/tipografi berasal dari token (nol hardcode).

---

## Bagian A — Integrasi Design Token

Sumber nilai: `tailwind.tokens.json` (palette zinc + **primary biru #2563EB**, font Inter).

**Penting — file token berformat Tailwind v3 (`theme.extend`), proyek ini Tailwind v4.**
Jangan tempel blok `theme.extend`. **Terjemahkan** nilainya ke variabel CSS di `tokens.css`
mengikuti theming shadcn v4 (CSS variables + `@theme inline`). **Verifikasi nama variabel standar
ke dokumentasi shadcn v4 terkini** — jangan mengandalkan ingatan.

Tugas:
1. Petakan hex dari token ke variabel CSS standar shadcn: `--background, --foreground, --card(+-foreground),
   --popover(+-foreground), --primary(+-foreground), --secondary(+-foreground), --muted(+-foreground),
   --accent(+-foreground), --destructive(+-foreground), --border, --input, --ring`.
2. **Isi gap yang tidak ada di file token** dari skala zinc agar komponen tidak rusak:
   set sidebar lengkap (`--sidebar, --sidebar-foreground, --sidebar-primary(+-foreground),
   --sidebar-accent(+-foreground), --sidebar-border, --sidebar-ring`) — file hanya memberi
   `sidebar-accent`(#EFF6FF) & `sidebar-accent-foreground`(#2563EB), sisanya turunkan dari zinc/putih;
   dan `--chart-1..5` bila template shadcn memerlukannya.
3. radius (`sm 4 / md 6 / lg 8 / xl 12`), spacing, fontSize+lineHeight, boxShadow → token v4.
4. Font **Inter** (mis. `@fontsource/inter`), set sebagai `--font-sans`.
5. **Divergensi warna yang disengaja:** wireframe pakai tombol primary hitam; token memberi
   **primary biru #2563EB**. **Ikuti token (biru)**, pertahankan layout wireframe. Catat ini di task log.
6. Verifikasi tidak ada hex/warna hardcoded yang tersisa di komponen mana pun.

## Bagian B — Login UI (tersambung endpoint nyata)

Route `/login`. Pisahkan render dari logika:
- `features/auth/components/LoginForm.tsx` — render (≤300 baris).
- `features/auth/hooks/useLogin.ts` — logika: panggil `auth.api.login`, set store, navigasi, map error.
- `features/auth/pages/LoginPage.tsx` — komposisi layout + form.
- Skema zod: `username` wajib, `password` wajib (react-hook-form + `@hookform/resolvers/zod`).

Komponen shadcn yang perlu ditambah: `card, input, label, button, checkbox` (FE-001 baru Button+Input).

Layout (mengacu Image 1/2):
- Card terpusat; lambang "W" + teks "Wreksa".
- Judul "Arsip Anda, terjaga."; subteks "Masuk untuk mengelola, menelusuri, dan merawat berkas Anda."
- Field "Nama Pengguna" (placeholder "Masukkan nama pengguna").
- Field "Kata Sandi" (placeholder "Masukkan kata sandi") + **toggle lihat/sembunyi** (ikon Phosphor Eye/EyeSlash).
- Checkbox "Tetap masuk di perangkat ini" — **dekoratif** (simpan di state form, tanpa efek; jangan
  persist token). Catat sebagai dekoratif.
- Tombol primary lebar penuh "Masuk".

Perilaku:
- Submit → `useLogin` → `auth.api.login(username, password)` → `setAuth(accessToken, user)` →
  `navigate('/')` (placeholder home dari FE-001). Tombol **loading** (disabled + indikator) selama proses.
- **Error mapping** (penting, sesuai kontrak backend):
  - **401** → error inline persis wireframe Image 2: border merah pada field + teks merah
    "Data yang anda masukkan salah" (jangan tampilkan pesan mentah backend).
  - **429** (login dibatasi 5/60s) → pesan "Terlalu banyak percobaan, coba lagi nanti."
  - Jaringan/lainnya → toast (sonner) generik, jangan bocorkan detail internal.

## Bagian C — Kebijakan mock + catatan Sprint 2 (standing rule)

Buat `docs/sprint2-backend-needs.md` dan seed dengan fitur dekoratif yang sudah diketahui dari STATE.md
(Arsip + drag-drop di Arsip; file picker "Pilih berkas dari arsip" + toggle Dokumen Internal;
ukuran/jenis/tanggal per berkas; pencarian; "Olah tabel"). Untuk tiap entri catat: fitur, endpoint
yang dibutuhkan nanti, bentuk data ringkas.

Tetapkan aturan (tulis di `CLAUDE.md` juga):
- Fitur tanpa backend → buat **mock di balik interface yang sama** dengan API asli nanti
  (mis. `features/<x>/api/<x>.api.ts` berisi baca/tulis **sessionStorage**), ditandai `// MOCK(sprint2)`.
- **Simpan metadata, bukan byte file** (sessionStorage string-only ~5MB). Untuk upload Arsip:
  nama, ukuran, tipe, tanggal, uuid palsu.
- Setiap mock wajib punya entri di `docs/sprint2-backend-needs.md`.
- **Login BUKAN mock** (endpoint nyata). Bagian ini hanya menetapkan kebijakan + seed catatan;
  **jangan bangun fitur Arsip di stage ini**.

## Keputusan kunci (tulis di task log)
1. Token diterjemahkan ke format v4/shadcn (bukan paste v3); gap variabel diisi dari zinc.
2. Primary biru (token) menggantikan hitam (wireframe) — token sumber kebenaran warna.
3. Login tersambung endpoint nyata sejak FE-003; boot/guard/redirect-terlindung menyusul FE-004.
4. 401 dipetakan ke pesan generik wireframe (tak bocorkan pesan backend); 429 ditangani terpisah.
5. Kebijakan mock: in-session, metadata-only, di balik interface yang sama, tercatat untuk Sprint 2.

## Belajar dari sini (isi di task log)
- Kenapa token sebagai CSS variable membuat re-theme murah & tidak ada hardcode.
- Kenapa pesan error login digenerik-kan di UI (anti-enumerasi, konsisten dgn backend).
- Kenapa mock di balik interface yang sama membuat penggantian ke API nyata bersih.

## Kriteria selesai (verifikasi nyata)
- Token diterapkan: primary biru, font Inter, radius/spacing dari token; nol warna hardcoded.
- Login admin nyata (kredensial dari backend dev) → token masuk store → pindah ke `/`.
- Kredensial salah → border merah + "Data yang anda masukkan salah" (tanpa redirect).
- Toggle lihat/sembunyi sandi bekerja; tombol loading saat submit.
- `docs/sprint2-backend-needs.md` terbuat & terisi seed; aturan mock ada di `CLAUDE.md`.
- `pnpm build` & lint bersih; file ≤300 baris; hooks terpisah dari render.

## Yang TIDAK dikerjakan
- Tidak ada protected route / guard / redirect-terlindung / silent-refresh boot (FE-004).
- Tidak ada logout UI (FE-004/005).
- Tidak membangun fitur Arsip/upload mock (hanya kebijakan + catatan).
- Checkbox "Tetap masuk" tidak fungsional.
