# FE-004 — Boot Silent-Refresh + Protected Routes + Logout

## Tujuan
Sambungkan `bootstrapAuth()` ke router: pulihkan sesi saat reload (refresh→me), jaga route
terlindung, dan logout bersihkan store + cache query. Semua endpoint nyata.

## Rencana
1. `features/auth/lib/run-bootstrap-once.ts` — cache promise di level modul (kebal StrictMode)
2. `features/auth/hooks/useAuthBootstrap.ts` — status `pending|done`
3. `features/auth/components/AuthGate.tsx` — tahan render router sampai boot selesai
4. `features/auth/components/RequireAuth.tsx` — redirect ke `/login` jika tidak autentikasi
5. `features/auth/components/RedirectIfAuthed.tsx` — redirect ke `/` jika sudah login
6. `features/auth/hooks/useLogout.ts` — logout + clear store + clear cache + navigate
7. `src/App.tsx` — wiring semua guard + tombol logout sementara di home

---

## File diubah

| File | Alasan |
|------|--------|
| `src/features/auth/lib/run-bootstrap-once.ts` | Baru — cache promise boot di modul, idempoten |
| `src/features/auth/hooks/useAuthBootstrap.ts` | Baru — hook status pending/done |
| `src/features/auth/components/AuthGate.tsx` | Baru — loading gate, tahan render route sebelum boot |
| `src/features/auth/components/RequireAuth.tsx` | Baru — guard: tidak autentikasi → /login |
| `src/features/auth/components/RedirectIfAuthed.tsx` | Baru — guard: sudah login → / |
| `src/features/auth/hooks/useLogout.ts` | Baru — logout: API (toleran gagal) + clearAuth + queryClient.clear |
| `src/App.tsx` | Update: wiring AuthGate + RequireAuth + RedirectIfAuthed + tombol logout temp |

---

## Keputusan kunci

1. **Boot di-cache level modul** — `bootstrapPromise` tidak pernah di-reset. Dipanggil berapa kali
   pun (termasuk 2× dari StrictMode) → hanya satu HTTP `POST /auth/refresh`. Menghindari
   reuse-detection backend yang akan revoke semua sesi kalau refresh kedua dikirim.
2. **AuthGate menahan render route** sampai boot selesai → tidak ada kedip login ("flash of
   unauthenticated content") atau redirect prematur sebelum status sesi diketahui.
3. **Logout mengosongkan cache Query** (`queryClient.clear()`) bukan hanya store — mencegah data
   user lama bocor ke sesi user lain di browser yang sama.
4. **Role guard (`RequireRole`) ditunda** — belum ada route khusus-ADMIN (CRUD menu = FE-006).
   Dicatat di sini; mekanismenya menyusul.
5. **Selector langsung ke `accessToken`** — `useAuthStore(s => !!s.accessToken)` lebih reaktif
   dari `s.isAuthenticated()` karena Zustand subscribe ke field bukan ke return fungsi.

---

## Belajar dari sini

- **React StrictMode menggandakan effect di dev** — berguna untuk mendeteksi efek samping yang tidak
  bersih. Solusi yang benar bukan mematikan StrictMode tapi membuat operasi idempoten (cache promise
  di luar React). Mematikan StrictMode hanya menyembunyikan bug.
- **Race antara "tahu siapa user" vs "render guard"** — tanpa AuthGate, guard `RequireAuth` render
  sebelum boot selesai, melihat `accessToken = null`, redirect ke `/login` meskipun cookie masih
  valid. AuthGate memotong race ini.
- **Cache Query harus dibuang saat logout** — di browser bersama, user A logout lalu user B login
  di tab yang sama bisa melihat data A yang masih di-cache (tanpa `queryClient.clear()`). Clear
  cache = batas sesi yang bersih.
