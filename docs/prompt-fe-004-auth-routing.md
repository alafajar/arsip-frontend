# FE-004 — Boot Silent-Refresh + Protected Routes + Logout

## Konteks untuk agent
Lanjutan frontend Wreksa. FE-002 menyediakan auth store, interceptor refresh single-flight,
`auth.api.ts`, dan `bootstrapAuth()` (belum disambung). FE-003 membuat login yang sudah menaruh
token di store + pindah ke `/`. Stage ini menyambung sisanya: pulihkan sesi saat reload, jaga
route, dan logout — **semua endpoint nyata, tidak ada mock di stage ini.**

**Baca dulu & jangan menebak:** `STATE.md`, `CLAUDE.md`, `src/lib/api/bootstrap.ts`,
`src/lib/api/client.ts` (single-flight refresh), `src/stores/auth.store.ts`, `src/lib/api/auth.api.ts`,
`src/App.tsx` (router FE-001/003).

## Aturan kerja (WAJIB)
1. Nyatakan ulang tugas 1-2 kalimat; buat `docs/tasks/FE-004-auth-routing.md`.
2. Incremental & kecil; hooks (logika) terpisah dari komponen (render); ≤300 baris/file; satu alias `@/`.
3. Akhiri: update task log (file diubah+alasan, keputusan kunci, "Belajar dari sini").

## Tujuan
- Reload saat login → tetap login (sesi dipulihkan via refresh→me), mendarat di `/`.
- Reload saat logout / cookie mati → route terlindung dialihkan ke `/login`.
- User login membuka `/login` → dialihkan ke `/`.
- Logout → cookie + store + cache query bersih, kembali ke `/login`.

## Desain — implementasikan sesuai ini

### 1. Boot sekali, kebal StrictMode (INTI STAGE INI)
**Masalah:** `useEffect` jalan 2× di React StrictMode dev → `bootstrapAuth()` menembak `/auth/refresh`
2×. Karena backend merotasi refresh token + reuse-detection, refresh kedua memicu **revoke semua sesi**.

**Solusi wajib:** cache promise boot di **level modul, jangan pernah di-reset**:
```ts
// features/auth/lib/run-bootstrap-once.ts
let bootstrapPromise: Promise<boolean> | null = null;
export function runBootstrapOnce() {
  if (!bootstrapPromise) bootstrapPromise = bootstrapAuth();
  return bootstrapPromise; // dipanggil berapa kali pun → satu refresh saja seumur hidup app
}
```
**Jangan** mematikan StrictMode untuk "menyelesaikan" ini — itu menyembunyikan bug. Buat boot idempoten.

### 2. AuthGate (gerbang loading saat boot)
- `features/auth/hooks/useAuthBootstrap.ts` (logika): panggil `runBootstrapOnce()` di effect,
  simpan status `'pending' | 'done'`.
- `features/auth/components/AuthGate.tsx` (render): selama `pending` tampilkan layar loading netral
  (pakai token warna, bukan hardcode). Setelah `done`, render `children` (router).
- Bungkus router dengan `AuthGate` agar **route tidak render sebelum boot selesai** — cegah kedip
  login / redirect prematur.

### 3. Protected routes
- `features/auth/components/RequireAuth.tsx`: jika `!isAuthenticated()` → `<Navigate to="/login" replace />`;
  selain itu render `<Outlet/>`/children.
- `features/auth/components/RedirectIfAuthed.tsx` (untuk `/login`): jika sudah login →
  `<Navigate to="/" replace />`.
- Update `App.tsx`: `/login` publik (dibungkus `RedirectIfAuthed`); `/` dan route app lain dibungkus
  `RequireAuth`.
- **Role guard (`RequireRole`) TIDAK dibuat sekarang** — belum ada route khusus-ADMIN (CRUD menu = FE-006).
  Cukup catat di task log bahwa mekanismenya menyusul. Penyembunyian tombol per-role juga di stage terkait.
- (Opsional) "return-to": setelah login, kembali ke halaman tujuan. Tidak wajib Sprint 1 (hanya ada `/`).

### 4. Logout
- `features/auth/hooks/useLogout.ts`: `await auth.api.logout()` (toleran jika gagal/jaringan) →
  `clearAuth()` → **`queryClient.clear()`** (buang cache user lama, cegah kebocoran antar sesi) →
  `navigate('/login', { replace: true })`.
- Sediakan **tombol logout sementara** di placeholder home `/` untuk verifikasi stage ini.
  Tandai `// TEMP(FE-005): pindah ke sidebar` — tombol nyata ada di sidebar (Image 3) pada FE-005.

## Keputusan kunci (tulis di task log)
1. Boot di-cache level modul (idempoten) → satu refresh saja, kebal double-invoke StrictMode →
   menghindari reuse-detection backend (revoke-all). Tidak mematikan StrictMode.
2. AuthGate menahan render route sampai boot selesai → tak ada kedip login/redirect prematur.
3. Logout mengosongkan cache Query, bukan hanya store → cegah data user lama bocor ke sesi baru.
4. Role guard ditunda sampai ada route khusus-peran (FE-006).

## Belajar dari sini (isi di task log)
- Kenapa StrictMode menggandakan efek di dev, dan kenapa itu berbahaya khusus untuk sistem dengan
  token rotation + reuse-detection.
- Kenapa render route harus menunggu boot (race antara "tahu siapa user" vs "render guard").
- Kenapa cache Query harus dibuang saat logout (browser bersama, multi-user).

## Kriteria selesai (tes negatif wajib, bukan cuma jalur happy)
- Login → reload halaman → **tetap login**, mendarat di `/` (sesi pulih).
- Logout → reload → `/` dialihkan ke `/login`; tombol back tidak menampilkan konten terlindung.
- Buka `/login` saat sudah login → dialihkan ke `/`.
- **Cek Network tab di dev (StrictMode aktif): hanya 1× `POST /auth/refresh` saat boot.** (Tes negatif
  utama untuk bug reuse-detection.)
- Logout → store kosong, cache Query kosong, cookie ter-clear.
- `pnpm build` & lint bersih; file ≤300 baris; hooks terpisah dari render.

## Yang TIDAK dikerjakan
- Tidak ada sidebar/layout (FE-005) — tombol logout hanya sementara di home.
- Tidak ada `RequireRole` / penyembunyian tombol per-peran (stage terkait).
- Tidak ada fitur menu/sheet/upload.
- Tidak ada mock (stage ini murni auth endpoint nyata).
