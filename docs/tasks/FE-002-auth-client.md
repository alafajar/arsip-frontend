# FE-002 — API Client + Interceptor Refresh + Auth Store

## Tujuan
Membangun lapisan auth-client: zustand store (in-memory), fungsi API auth, axios interceptor
dengan single-flight refresh, dan `bootstrapAuth()` untuk memulihkan sesi saat reload — tanpa
menyambungkan ke UI atau router.

## Rencana
1. `auth.store.ts` — zustand store token + user, actions, getter non-React
2. `auth.api.ts` — fungsi login/refresh/logout/me via client instance
3. `client.ts` — request interceptor (Bearer) + response interceptor (single-flight refresh)
4. `bootstrap.ts` — pulihkan sesi saat boot (refresh → me)
5. Verifikasi: `pnpm build` + `pnpm lint` bersih

## File Diubah / Dibuat

| Path | Alasan |
|------|--------|
| `src/stores/auth.store.ts` | Zustand store: accessToken + user in-memory, actions, isAuthenticated |
| `src/lib/api/auth.api.ts` | Fungsi `login`, `refresh`, `logout`, `me` menggunakan client |
| `src/lib/api/client.ts` | Lengkapi interceptor: request (Bearer) + response (single-flight refresh) |
| `src/lib/api/bootstrap.ts` | `bootstrapAuth()`: refresh → me → setUser; wiring ke router di FE-004 |
| `docs/tasks/FE-002-auth-client.md` | Task log ini |

## Keputusan Kunci

### 1. Single-flight refresh — satu pintu, request lain antre
```
Request A ─┐
Request B ─┤→ 401 → refreshPromise sudah ada → tunggu
Request C ─┘         ↑ tidak trigger refresh kedua
```
Backend merotasi refresh token tiap pakai **dan** punya reuse-detection (token lama dipakai →
revoke semua sesi → logout paksa). Dua refresh paralel berarti refresh pertama sukses, yang
kedua memakai token lama yang sudah dirotasi → reuse-detection aktif → semua sesi mati.
`refreshPromise` modul-level memastikan hanya satu call refresh aktif sekaligus.

### 2. Token in-memory (zustand), bukan localStorage
Access token pendek umurnya — tidak perlu persist. localStorage = permukaan XSS yang terbuka;
in-memory jauh lebih aman. Reload dipulihkan oleh `bootstrapAuth()` via cookie httpOnly.

### 3. Interceptor baca `getState()`, bukan hook React
Hook (`useAuthStore(s => s.accessToken)`) hanya boleh dipanggil dalam React component.
Interceptor jalan di luar React tree → harus pakai `useAuthStore.getState().accessToken`
(akses langsung store, bukan subscription). Selalu mendapat nilai terbaru, bukan closure basi.

### 4. Hindari circular import: `client.ts` tidak import `auth.api.ts`
`auth.api.ts` → import `client` dari `client.ts` ✅  
Jika `client.ts` → import `refresh` dari `auth.api.ts` → circular ❌  
Solusi: `refreshAccessToken()` di dalam `client.ts` memanggil `client.post('/auth/refresh')`
langsung. Cara ini juga benar secara konseptual: interceptor adalah detail implementasi
client, bukan konsumen fungsi API level-atas.

### 5. Loop-guard: `_retry` flag + `isAuthSkip`
Tanpa guard, refresh yang gagal dengan 401 akan memicu refresh lagi → infinite loop.
Dua layer perlindungan:
- `original._retry = true` → request yang sudah di-retry tidak di-retry lagi
- `isAuthSkip(original.url)` → `/auth/refresh` dan `/auth/login` tidak pernah di-retry

### 6. `bootstrapAuth` didefinisikan, tidak dipanggil
Pemisahan mekanisme (FE-002) dari wiring (FE-004). Di FE-004, `bootstrapAuth` dipanggil
sebelum render router; hasilnya menentukan apakah user masuk ke route protected atau redirect.

## Catatan Jujur Soal Batas Verifikasi
Build + lint bersih membuktikan tipe benar dan tidak ada error statis.
Alur e2e penuh (401 nyata → refresh → retry, dan refresh paralel hanya 1×) **baru bisa
diverifikasi di FE-004** setelah ada login UI + backend aktif + protected route.
Stage ini diverifikasi lewat build + review kode, bukan klaim "sudah teruji jalan".

## Belajar dari Sini

### Kenapa refresh paralel berbahaya di sistem token rotation + reuse-detection?
Backend: tiap `/auth/refresh` → token lama diinvalidasi → token baru diterbitkan.  
Skenario buruk tanpa single-flight:
1. Request A dan B sama-sama 401 di waktu bersamaan.
2. A memanggil `/auth/refresh` → berhasil → token baru T2 diterbitkan; T1 mati.
3. B (milliseconds kemudian) juga memanggil `/auth/refresh` dengan cookie lama (T1 sudah mati).
4. Backend mendeteksi token lama dipakai lagi → **revoke semua refresh token user** → semua
   device/tab logout paksa.

Single-flight: A dan B berbagi satu promise refresh → hanya satu call → tidak ada reuse.

### Beda 401 vs 403 vs 409 — penanganan UI berbeda
| Status | Arti | Penanganan |
|--------|------|------------|
| 401 | Token tidak valid / expired | Coba refresh → retry; jika gagal → logout |
| 403 | Token valid tapi role kurang (KAPRODI coba ADMIN action) | Tampil pesan "Akses ditolak" — JANGAN refresh |
| 409 | Konflik bisnis (sheet `isReadOnly`, row sudah ada) | Tampil pesan kontekstual — JANGAN refresh |

Interceptor hanya menangani 401. 403 dan 409 harus dihandle di level query/mutation tiap fitur.

### Kenapa access token tidak di localStorage?
localStorage bisa dibaca oleh **setiap JavaScript yang jalan di halaman** — termasuk script
dari third-party CDN atau XSS. Sekali payload injected, token tercuri.  
In-memory (variabel JS): hanya bisa dibaca oleh JS di origin yang sama, tidak persist lintas
tab/reload (sehingga reload perlu bootstrap), dan tidak mudah diekstrak via XSS sederhana.  
Cookie httpOnly: tidak bisa dibaca JS sama sekali — hanya dikirim browser ke server secara
otomatis. Ini yang membuat refresh token aman meski ada XSS di halaman.
