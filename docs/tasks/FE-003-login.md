# FE-003 — Integrasi Design Token + Login UI

## Tujuan
Terjemahkan design token nyata (primary biru #2563EB, zinc palette, font Inter) ke sistem Tailwind v4 +
shadcn, lalu bangun layar login yang tersambung ke endpoint nyata `POST /auth/login`.

## Rencana
1. Install `@fontsource/inter` + `@radix-ui/react-checkbox`
2. Update `src/styles/tokens.css`: CSS variables standar shadcn v4 + alias legacy `--color-*`
3. Tambah komponen shadcn: `card`, `label`, `checkbox`
4. Buat `features/auth/hooks/useLogin.ts` (logika)
5. Buat `features/auth/components/LoginForm.tsx` (render)
6. Buat `features/auth/pages/LoginPage.tsx` (komposisi)
7. Update `App.tsx` dengan route `/login`
8. Buat `docs/sprint2-backend-needs.md` + update `CLAUDE.md`

---

## File diubah

| File | Alasan |
|------|--------|
| `src/styles/tokens.css` | Ganti placeholder hitam → token nyata (primary biru, zinc, Inter, radius) |
| `src/components/ui/card.tsx` | Baru — komponen Card shadcn (Card, CardHeader, CardContent, CardTitle, CardDescription) |
| `src/components/ui/label.tsx` | Baru — Label aksesibel via @radix-ui/react-label |
| `src/components/ui/checkbox.tsx` | Baru — Checkbox dekoratif via @radix-ui/react-checkbox |
| `src/features/auth/hooks/useLogin.ts` | Baru — logika login: panggil API, set store, navigasi, map error |
| `src/features/auth/components/LoginForm.tsx` | Baru — form render saja: field, toggle sandi, error inline, loading |
| `src/features/auth/pages/LoginPage.tsx` | Baru — layout halaman login (komposisi) |
| `src/App.tsx` | Tambah route `/login` |
| `docs/sprint2-backend-needs.md` | Baru — catatan fitur dekoratif yang butuh backend sprint 2 |
| `CLAUDE.md` | Tambah aturan mock policy |

---

## Keputusan kunci

1. **Token diterjemahkan ke format v4/shadcn** — `@theme inline` + CSS variables standar (`--background`,
   `--primary`, `--border` dll.). Bukan paste blok `theme.extend` v3.
2. **Primary biru (#2563EB) menggantikan hitam wireframe** — token adalah sumber kebenaran warna.
   Wireframe pakai tombol hitam, tapi token memberi biru, maka biru yang dipakai.
3. **Legacy aliases dipertahankan** — `--color-primary`, `--color-border` dll. tetap di `:root` sebagai
   alias ke variabel standar baru, sehingga `button.tsx` dan `input.tsx` tidak perlu diubah.
4. **Login tersambung endpoint nyata** — `POST /auth/login` langsung ke backend, bukan mock.
5. **401 → pesan generik** — "Data yang anda masukkan salah" (tidak bocorkan pesan mentah backend;
   anti-enumerasi).
6. **429 ditangani terpisah** — "Terlalu banyak percobaan, coba lagi nanti."
7. **Checkbox "Tetap masuk" dekoratif** — state terkontrol tapi tanpa efek (tidak persist token).
   Dicatat sebagai dekoratif di komponen.
8. **Kebijakan mock ditetapkan** — fitur tanpa backend → interface yang sama dengan API asli, ditandai
   `// MOCK(sprint2)`, metadata-only (sessionStorage), tercatat di sprint2-backend-needs.md.

---

## Belajar dari sini

- **Token sebagai CSS variable** membuat re-theme murah: ganti nilai satu variabel di `:root`, seluruh
  UI ikut berubah tanpa menyentuh kode komponen. Zero hardcode = zero pencarian-ganti.
- **Pesan error login digenerik-kan di UI** (bukan pesan mentah backend) karena: (a) pesan yang presisi
  ("username salah" vs "password salah") membantu brute-force enumerasi akun; (b) pesan backend bisa
  berbeda bahasa/format antar versi, UI harus stabil.
- **Mock di balik interface yang sama** (`features/<x>/api/<x>.api.ts` dengan signature identik ke API
  nyata) membuat penggantian ke API asli bersih: cukup ganti implementasi satu file, konsumen tidak
  berubah.
