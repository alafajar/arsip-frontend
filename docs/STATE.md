# STATE — Wreksa Frontend (Sprint 1)

> **Apa ini:** dokumen state hidup. Sumber kebenaran tunggal untuk konteks proyek.
> Memory chat tidak diandalkan (lossy, telat ~24 jam). Dokumen ini yang dirujuk.
> **Update tiap akhir slice.** Terakhir diperbarui: 2026-06-22.

## Cara pakai dokumen ini (untuk chat/sesi baru)
1. Lampirkan file ini + `CLAUDE.md` (frontend) ke chat baru, atau arahkan Claude Code ke keduanya.
2. Kalau membahas UI, lampirkan juga wireframe yang relevan.
3. Buka dengan kalimat status singkat (template di bagian paling bawah).
4. Setelah slice selesai, minta sesi itu menghasilkan versi STATE.md yang sudah diupdate, lalu commit.

---

## 1. Ringkasan proyek
Wreksa = web app sentralisasi dokumen akreditasi prodi (kerangka LAMTEK). Excel hanya untuk impor
awal; **database = source of truth**. Bukan replika Excel; ini **engine tabel generik** (menu →
sheet → columns/rows/cells). Sprint 1 membuktikan engine lewat satu demo: sheet **DTPS** (Data
Dosen Tetap).

- Backend: NestJS 11 + Prisma 7 + PostgreSQL 17 (repo `arsip-backend`) — **MVP selesai** (audit 2026-06-20).
- Frontend: React+Vite (repo terpisah) — **baru mulai** (FE-001 setup).
- Klien dibilling; demo internal jadi target.

## 2. Status backend (dependensi frontend)
Semua endpoint Sprint 1 sudah ada & teruji manual (401/403/404/400/409). Backend belum prod-ready
(tanpa test suite, query-log bocor di prod, tanpa global exception filter) — itu backlog backend,
**bukan urusan frontend Sprint 1**.

Endpoint yang dipakai frontend:
| Endpoint | Guna | Catatan |
|---|---|---|
| `POST /auth/login` | login | resp: `{accessToken, user{id,username,fullName,role}}` + cookie refresh httpOnly |
| `POST /auth/refresh` | tukar access token | resp: `{accessToken}` (tanpa user) |
| `POST /auth/logout` | revoke + clear cookie | resp: `{message}` |
| `GET /auth/me` | identitas saat ini | resp: `{id,username,role}` — **tanpa fullName** |
| `GET /menus` | pohon menu (sidebar) | resp: `MenuNode[]` bersarang, tiap node punya `sheets[]` |
| `POST/PATCH/DELETE /menus[/:id]` | CRUD map (ADMIN) | PATCH/POST body `{name, parentId}` |
| `GET /sheets/:id` | metadata sheet | resp termasuk `isReadOnly` |
| `GET /sheets/:id/columns` | pohon kolom (header bertingkat) | non-leaf = grup (null di rows), leaf = data |
| `GET /sheets/:id/rows?limit=&offset=` | baris ter-pivot | resp `{rows, total, limit, offset}` |
| `POST/PATCH/DELETE /sheets/:id/rows[/:rowId]` | CRUD baris (ADMIN, 409 jika readonly) | body `{cells:[{columnId,value}]}` |
| `POST /imports` | upload .xlsx (ADMIN, multipart) | field: `file, name, parentMenuId`; resp `{importId, workbookMenuId, sheets[]}` |

## 3. Kontrak API (bentuk response nyata — sumber: Postman + uji langsung)
Tipe lengkap ada di `src/types/api.ts`. Inti:
- **Semua nilai cell = string|null** (termasuk INTEGER "1", URL, NIDN "0017026012" nol-depan utuh).
  `type` hanya menentukan input widget + validasi, bukan tipe simpan.
- **Kolom grup (non-leaf)** selalu `null` di rows; data ada di leaf. Render header-group saja.
- **rows pakai key `rowId`** (bukan `id`); pagination `total/limit/offset`.
- **Write**: `{cells:[{columnId,value}]}`; `value:""` = HAPUS cell (delete-on-empty).
- **Import** membuat **satu menu-node baru** (`workbookMenuId`) berisi banyak `sheets[]`.
- **`fullName` hanya di response login**, tidak di `/me`/`/refresh` → UI fallback ke `username`.

Contoh DTPS: 6 kolom — No.(INTEGER), Nama Dosen(TEXT), Kualifikasi Akademik(grup)→{Magister,Doktor}(TEXT),
Jabatan Akademik(TEXT), NIDN(TEXT), Link Dokumen(URL).

## 4. Keputusan terkunci (jangan dibongkar tanpa konfirmasi)
**Stack:** Vite+React+TS strict · Tailwind v4 · shadcn-ui · Phosphor icons (bukan lucide) ·
TanStack Query + TanStack Table · react-hook-form + zod · zustand · react-router-dom ·
react-dropzone · sonner · date-fns.

**Konvensi:** hooks (logika) terpisah dari komponen (render) · maks 300 baris/file · **satu alias `@/`→src**
(tanpa hutan barrel) · styling via design token (CSS variables, nol warna hardcoded) · foldering
feature-based · task log `docs/tasks/FE-NNN-*.md` · `CLAUDE.md` sebagai aturan persisten.

**Form baris = GENERIK (digerakkan metadata `/columns`)**, bukan hardcoded DTPS.
- type → input; leaf-children dirender berdampingan di bawah header induk (reproduksi Magister/Doktor).
- Jabatan = text input (backend tak punya enum). URL = input URL eksternal.
- Kolom "No." disertakan sebagai integer input, **tanpa auto-numbering**.

**Auth:** access token disimpan **in-memory (zustand)**, bukan localStorage. Refresh via cookie
httpOnly. Saat boot: coba `POST /auth/refresh` → jika 200, `GET /auth/me`. Checkbox "Tetap masuk"
**dekoratif** di Sprint 1.

**Granularitas UI:** kartu **Map** = child menu-node (`children[]`); kartu **Berkas** = sheet di
`node.sheets[]`. Klik Berkas → buka tabel sheet.

**Gerbang edit:** tampil bila `role==='ADMIN' && !sheet.isReadOnly`. Tetap tangani 409 dari server.

**Dev:** Vite `:5173` → Nest `:3000`, `withCredentials:true`, base URL via `VITE_API_BASE`.

## 5. Wireframe: fungsional vs dekoratif (Sprint 1)
Wireframe bergaya manajemen dokumen, tapi backend = engine tabel. Yang **tanpa backend** dibangun
sebagai shell visual saja:
- **Fungsional:** login, sidebar (Konten = pohon `/menus`), Map/Berkas cards, CRUD map, upload
  import `.xlsx` (drag-drop), tabel DTPS, CRUD baris.
- **Dekoratif (tanpa fungsi):** section "Arsip" + drag-drop di Arsip, file picker "Pilih berkas
  dari arsip" + toggle Dokumen Internal, ukuran/jenis file & "Tanggal diunggah" per berkas,
  "Cari di Map/Berkas", "Olah tabel", sort by Ukuran/Jenis.
- DTPS asli **24 baris** (mock "2000 data" di wireframe diabaikan; pagination digerakkan `total`).
- **Grid-mirror (read-only) sheet** (import `.xlsx` apa adanya, `isReadOnly`) render setia ala Excel =
  **di luar scope Sprint 1** — butuh backend ekspos `CellMerge`. Detail: `sprint2-backend-needs.md` #9.

## 6. Roadmap stage frontend
| Stage | Isi | Status |
|---|---|---|
| FE-001 | Setup proyek, tooling, struktur, token shell, tipe API | **Spec siap, belum dieksekusi** |
| FE-002 | API client + interceptor refresh + auth store | belum |
| FE-003 | Login UI (Image 1/2) | belum |
| FE-004 | Fungsi login + silent-refresh boot + protected routes | belum |
| FE-005 | AppShell + Sidebar dari `/menus` + section statis | belum |
| FE-006 | Content browser (Map/Berkas) + CRUD menu + empty states | belum |
| FE-007 | Upload import (drag-drop, .xlsx) | belum |
| FE-008 | Tabel DTPS (columns→coldef, header bertingkat, URL clickable, pagination) | belum |
| FE-009 | Edit mode + row CRUD + RowForm generik | belum |

## 7. Item terbuka / utang
- `fullName` tak ada di `/me` — opsional minta backend menambah; sementara fallback username.
- **Grid-mirror (read-only) sheet** render apa adanya (kolom flat `A`–`I` + header Excel tampil
  sebagai baris data) karena backend belum mengekspos `CellMerge` (sudah disimpan saat import, belum
  di response). Render setia Excel = Sprint 2; detail di `sprint2-backend-needs.md` #9. DTPS
  (engine-table) **tidak terdampak** — sudah benar lewat pohon kolom.
- Sprint 2: OpenAPI/Swagger di backend → generate tipe FE (hapus langkah paste response manual).
- Sprint 2: pertimbangkan monorepo agar FE/BE saling melengkapi dalam satu sesi Claude Code.

---

## Template kalimat pembuka untuk chat baru
> Lanjutan proyek **Wreksa frontend Sprint 1**. Baca `STATE.md` + `CLAUDE.md` terlampir untuk konteks
> (backend MVP selesai; frontend di stage **FE-00X**). Keputusan & kontrak API sudah terkunci di STATE.
> Sekarang saya mau kerjakan **<tujuan>**. Mulai dengan menyatakan ulang tugas + buat task log, lalu
> ajukan pertanyaan kalau masih ada yang ambigu sebelum menulis prompt/kode.
