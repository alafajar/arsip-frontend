# FE-002 — API Client + Interceptor Refresh + Auth Store

## Konteks untuk agent
Lanjutan frontend Wreksa. Backend: access token via header `Authorization: Bearer`, refresh token
via **cookie httpOnly** (otomatis dikirim browser). Backend **merotasi refresh token tiap pakai**
dan punya **reuse-detection** (token mati dipakai lagi → revoke semua sesi → logout paksa).
Stage ini membangun lapisan auth-client. **Belum ada UI login (FE-003) dan belum disambung ke
router/guard (FE-004).**

**Baca dulu yang sudah ada:** `STATE.md`, `CLAUDE.md`, `src/lib/api/client.ts` (placeholder FE-001),
`src/types/api.ts`. Sesuaikan dengan kode nyata yang ada, jangan menebak.

## Aturan kerja (WAJIB)
1. Nyatakan ulang tugas 1-2 kalimat; buat `docs/tasks/FE-002-auth-client.md`.
2. Perubahan incremental & kecil.
3. Akhiri dengan update task log (file diubah + alasan, keputusan kunci, "Belajar dari sini").
4. Patuhi konvensi `CLAUDE.md` (hooks≠render, ≤300 baris/file, satu alias `@/`, no barrel sprawl).

## Tujuan
Menyiapkan: (a) auth store zustand (token + user, in-memory), (b) fungsi API auth
(login/refresh/logout/me), (c) axios client dengan request interceptor (Bearer) + response
interceptor (401 → refresh **single-flight** → retry), (d) fungsi `bootstrapAuth()` untuk pulih
sesi saat reload — **tanpa** menyambungkannya ke routing.

## File yang dibuat/diubah
| File | Alasan |
|---|---|
| `src/stores/auth.store.ts` | Zustand: `accessToken`, `user`, actions; in-memory (tanpa persist) |
| `src/lib/api/auth.api.ts` | Fungsi `login`, `refresh`, `logout`, `me` |
| `src/lib/api/client.ts` | Lengkapi: request + response interceptor (single-flight refresh) |
| `src/lib/api/bootstrap.ts` | `bootstrapAuth()` — pulih sesi (refresh → me); tidak disambung ke router |
| `docs/tasks/FE-002-auth-client.md` | Task log |

## Desain — implementasikan sesuai ini

### 1. `auth.store.ts` (zustand, in-memory)
State: `accessToken: string | null`, `user: ApiUser | null`.
Actions: `setAuth(token, user)` (sesudah login), `setAccessToken(token)` (sesudah refresh),
`setUser(user)` (sesudah `/me`), `clearAuth()`, dan getter `isAuthenticated()` (= `!!accessToken`).
**Tanpa middleware persist.** Interceptor membaca token via `useAuthStore.getState()` (akses non-React)
agar selalu nilai terbaru, bukan closure basi.

### 2. `auth.api.ts`
- `login(username, password): Promise<LoginResponse>` → `POST /auth/login`.
- `refresh(): Promise<RefreshResponse>` → `POST /auth/refresh` (andalkan cookie; tanpa body, tanpa Bearer).
- `logout(): Promise<void>` → `POST /auth/logout` (butuh Bearer, mengikut interceptor).
- `me(): Promise<MeResponse>` → `GET /auth/me`.
Pakai instance `client`. Catatan: `/auth/refresh` & `/auth/login` dikecualikan dari Bearer & dari
retry-on-401 di interceptor (lihat bawah).

### 3. `client.ts` — interceptor

**Request interceptor:** lampirkan `Authorization: Bearer <accessToken>` dari store **kecuali** untuk
`/auth/login` dan `/auth/refresh` (keduanya tidak butuh Bearer; refresh pakai cookie).

**Response interceptor — single-flight refresh (INTI STAGE INI):**
- Modul-level: `let refreshPromise: Promise<string> | null = null;`
- `refreshAccessToken()`: jika `refreshPromise` belum ada → buat (panggil `refresh()`, simpan token
  ke store via `setAccessToken`, lalu `finally` reset `refreshPromise = null`). Jika sudah ada →
  **kembalikan promise yang sama** (request lain menunggu, tidak memicu refresh kedua).
- Pada error 401:
  - Lewati jika request adalah `/auth/refresh` atau `/auth/login` (jangan loop).
  - Lewati jika `original._retry === true` (sudah pernah di-retry → jangan loop).
  - Selain itu: set `original._retry = true`, `await refreshAccessToken()`, pasang token baru ke
    header request asli, lalu **retry** request asli via `client(original)`.
  - Jika refresh gagal → `clearAuth()` lalu reject error. (Redirect ke login ditangani FE-004.)
- Error non-401 → teruskan apa adanya.

### 4. `bootstrap.ts`
`bootstrapAuth(): Promise<boolean>`:
1. Coba `refresh()` → jika sukses, `setAccessToken(token)`.
2. Lalu `me()` → bentuk `ApiUser` dari `{id, username, role}`; karena `/me` **tanpa `fullName`**,
   set `fullName = username` sebagai fallback; `setUser(user)`.
3. Return `true`.
4. Jika gagal di langkah mana pun → `clearAuth()`, return `false`.
**Jangan** memanggil ini dari mana pun di stage ini (hanya definisikan; wiring di FE-004).

## Keputusan kunci (tulis di task log)
1. **Single-flight refresh** mencegah refresh paralel yang memicu reuse-detection backend
   (revoke-all → logout paksa). Satu pintu refresh; request lain antre. Ini konsekuensi langsung
   dari rotasi token + reuse-detection di backend (002e/002g).
2. **Token in-memory (zustand), bukan localStorage** — selaras desain backend (access token pendek,
   tak perlu persist; refresh aman di cookie httpOnly). Reload dipulihkan via `bootstrapAuth`.
3. **Interceptor baca `getState()`, bukan hook** — agar selalu token terbaru, menghindari closure basi.
4. **Boot didefinisikan, tidak disambung** — pemisahan mekanisme (FE-002) dari wiring router (FE-004).

## Belajar dari sini (isi di task log)
- Kenapa refresh paralel berbahaya di sistem dengan token rotation + reuse-detection.
- Beda 401 (perlu refresh/login) vs 403 (role kurang) vs 409 (sheet read-only) untuk penanganan UI.
- Kenapa access token tidak di localStorage (permukaan XSS) tapi di memori + cookie httpOnly.

## Kriteria selesai (jujur soal batasannya)
- `pnpm build` & lint bersih; tipe dari `@/types/api` dipakai (tanpa `any`).
- Store, `auth.api.ts`, interceptor, `bootstrap.ts` terimplementasi sesuai desain di atas.
- Review kode: alur single-flight + loop-guard (`_retry`, exclude `/auth/*`) benar.
- **Catatan jujur:** uji e2e penuh (401 nyata → refresh → retry, dan refresh paralel hanya 1×)
  **baru bisa diverifikasi di FE-004** setelah ada login + router. Stage ini diverifikasi lewat
  build + review, bukan klaim "teruji jalan".
- (Opsional) probe dev sementara via console untuk memanggil `login()`/`me()` — boleh, tapi
  **hapus** sebelum commit; jangan tinggalkan route/tombol uji permanen.

## Yang TIDAK dikerjakan
- Tidak ada UI login (FE-003).
- Tidak ada router, protected route, atau pemanggilan `bootstrapAuth` (FE-004).
- Tidak ada penanganan toast/redirect global (FE-004).
