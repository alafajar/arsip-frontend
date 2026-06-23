# FE-005 — AppShell + Sidebar (dari `/menus`) + Logout Permanen

## Konteks untuk agent
Lanjutan frontend Wreksa. Auth sudah berfungsi (FE-004). Stage ini membangun kerangka aplikasi:
sidebar kiri berisi pohon menu nyata dari `GET /menus`, brand, chip user + logout permanen, dan area
konten ber-outlet. **Belum** membangun browser konten (Map/Berkas cards) atau CRUD menu — itu FE-006.

**Baca dulu & jangan menebak:** `STATE.md`, `CLAUDE.md`, `src/types/api.ts` (`MenuNode`),
`src/lib/api/client.ts`, `src/lib/query-keys.ts`, `src/stores/auth.store.ts`,
`src/features/auth/hooks/useLogout.ts`, `src/App.tsx`.

## Aturan kerja (WAJIB)
1. Nyatakan ulang tugas 1-2 kalimat; buat `docs/tasks/FE-005-appshell-sidebar.md`.
2. hooks (logika) terpisah dari komponen (render); ≤300 baris/file; satu alias `@/`; nol warna hardcode (token).
3. Akhiri: update task log.

## Tujuan
Setelah login, user melihat shell: sidebar (brand → section "Konten" berisi pohon `/menus` → section
"Arsip" statis) + chip user dengan logout. Klik node menu menavigasi ke `/konten/:menuId` (halaman
placeholder; isinya FE-006). Sesuai wireframe Image 3/5/6/7.

## Bagian 1 — Data menu (server state)
- `features/menus/api/menus.api.ts`: `getTree(): Promise<MenuNode[]>` → `GET /menus`.
- `features/menus/hooks/useMenuTree.ts`: `useQuery` dengan key dari `query-keys.ts` (mis. `['menus']`).
  Tangani state loading (skeleton) & error (pesan ringkas, bukan stack trace).

## Bagian 2 — Layout & sidebar
- `components/layout/AppShell.tsx`: grid 2 kolom — sidebar kiri lebar tetap + area konten kanan
  (`<Outlet/>`). Bungkus dengan **ErrorBoundary** (lihat Bagian 4).
- `components/layout/Sidebar.tsx` (render) + `features/menus/components/MenuTree.tsx` (render rekursif):
  - Brand atas: lambang "W" + "Wreksa".
  - Header section **"Konten"** (statis) → di bawahnya pohon dari `/menus` (root nodes → children).
  - Header section **"Arsip"** (statis, dekoratif Sprint 1) — render item, tanpa fungsi.
  - Node dengan `children` bisa expand/collapse (ikon Phosphor CaretDown/Right), `aria-expanded`.
  - Node aktif disorot pakai `--sidebar-accent` / `--sidebar-accent-foreground`.
  - Klik node → `navigate('/konten/' + node.id)`. Sheet TIDAK tampil di sidebar (sheet muncul di
    area konten pada FE-006); sidebar hanya pohon map.
- `components/layout/UserChip.tsx`: tampilkan **`username`** + indikator peran kecil + tombol logout
  (ikon Phosphor SignOut) memakai `useLogout`. **Hapus tombol logout sementara FE-004** dari home.

## Bagian 3 — Routing
- Route terlindung dibungkus `AppShell` (di dalam `RequireAuth` dari FE-004):
  - `/` → home placeholder (mis. "Pilih map di samping").
  - `/konten/:menuId` → **placeholder** `ContentPage` (judul = nama node; isi nyata di FE-006).
- `/login` tetap di luar shell.

## Bagian 4 — Robustness & a11y (perbaikan gap yang sebelumnya tak terjadwal)
- **ErrorBoundary global** (`components/layout/ErrorBoundary.tsx`) membungkus outlet di `AppShell`:
  error render tak tertangkap → fallback ramah (token warna) + tombol "Muat ulang", bukan layar putih.
- **A11y baseline** (wajib, ringan):
  - `<nav aria-label="Navigasi konten">` untuk sidebar; struktur list yang benar.
  - Toggle expand/collapse: `<button>` dengan `aria-expanded` + label teks.
  - Tombol logout: `aria-label="Keluar"`.
  - Fokus terlihat memakai `--ring`; node & tombol dapat dioperasikan keyboard (Enter/Space).

## Keputusan kunci (tulis di task log)
1. Sidebar = pohon map saja; sheet ditampilkan di area konten (FE-006), bukan sidebar — sesuai wireframe.
2. "Arsip" dirender statis/dekoratif (tanpa backend) — tercatat di `docs/sprint2-backend-needs.md`.
3. ErrorBoundary + a11y baseline disisipkan di stage UI pertama untuk menutup gap secara incremental,
   bukan ditunda ke "stage hardening" terpisah.
4. Identitas chip = `username` (selaras `/me`).

## Belajar dari sini (isi di task log)
- Kenapa server state (menu) lewat TanStack Query, bukan disalin ke Zustand.
- Kenapa render rekursif + key stabil penting untuk pohon menu.
- Kenapa ErrorBoundary mencegah satu error komponen merobohkan seluruh app.

## Kriteria selesai (verifikasi)
- Setelah login: sidebar menampilkan pohon nyata dari `/menus` (mis. Kriteria → DTPS/Profil Dosen, Kurikulum).
- Expand/collapse bekerja (mouse & keyboard); node aktif tersorot.
- Klik node → URL jadi `/konten/:menuId`, placeholder menampilkan nama node.
- Chip menampilkan `username`; logout → kembali ke `/login`, store + cache Query bersih.
- Reload saat login → shell tetap tampil (sesi pulih dari FE-004), route aktif dipertahankan.
- Loading awal `/menus` → skeleton; bila gagal → pesan ringkas (bukan stack trace).
- Lemparkan error sengaja di satu komponen anak → ErrorBoundary menampilkan fallback, app tidak putih.
- Build/lint bersih; ≤300 baris; nol warna hardcode.

## Yang TIDAK dikerjakan
- Tidak ada Map/Berkas cards, CRUD menu, empty-state "Buat Map" (FE-006).
- Tidak ada halaman/fungsi Arsip, upload, file picker (stage terkait + kebijakan mock).
- Tidak ada `RequireRole`/sembunyikan tombol per-peran (muncul saat ada aksi tulis, FE-006+).
- Tidak ada responsif mobile (desktop dulu; catat sebagai gap).
