# Sprint 2 — Backend Needs

Dokumen ini mencatat fitur yang dibangun sebagai mock di Sprint 1 dan membutuhkan endpoint backend di
Sprint 2. Setiap fitur mock harus punya entri di sini (kebijakan: lihat `CLAUDE.md`).

Format tiap entri:
- **Fitur** — nama fitur dan lokasi kode mock
- **Endpoint dibutuhkan** — method + path + deskripsi singkat
- **Bentuk data** — shape request/response ringkas

---

## 1. Arsip — Daftar & Preview Berkas

**Fitur:** Section "Arsip" di sidebar / halaman tersendiri. Tampilkan daftar berkas yang diupload oleh
user. Di Sprint 1 hanya tersedia sebagai shell visual (no-op).

**Mock:** `features/arsip/api/arsip.api.ts` — baca/tulis sessionStorage, ditandai `// MOCK(sprint2)`.
Simpan metadata (bukan byte file): nama, ukuran, tipe MIME, tanggal upload, uuid palsu.

**Endpoint dibutuhkan:**
- `GET /files` — daftar file milik user
- `POST /files` — upload file baru (multipart)
- `DELETE /files/:id` — hapus file

**Bentuk data:**
```ts
// GET /files response
interface FileItem {
  id: string;
  name: string;
  size: number;        // bytes
  mimeType: string;
  uploadedAt: string;  // ISO datetime
}
```

---

## 2. Arsip — Drag-and-drop Upload

**Fitur:** Area drag-drop di halaman Arsip untuk upload berkas langsung (bukan `.xlsx` import).

**Mock:** Sama dengan entri #1 — `features/arsip/api/arsip.api.ts`.

**Endpoint dibutuhkan:**
- `POST /files` (multipart) — sama dengan #1

---

## 3. File Picker "Pilih berkas dari arsip"

**Fitur:** Modal/drawer pilih berkas yang sudah ada di Arsip, digunakan saat membuat referensi ke
berkas dari dalam form baris (kolom tipe URL/Dokumen).

**Mock:** `features/arsip/api/arsip.api.ts` — baca dari sessionStorage.

**Endpoint dibutuhkan:**
- `GET /files` — reuse dari #1; tambahkan filter `?type=<mimeType>` opsional

---

## 4. Toggle "Dokumen Internal"

**Fitur:** Toggle di header halaman yang memfilter tampilan antara "Dokumen Publik" vs "Dokumen
Internal". Di Sprint 1 dekoratif (state lokal saja, tanpa filter API).

**Mock:** State React lokal, tidak ada mock API.

**Endpoint dibutuhkan:**
- `GET /files?visibility=internal|public` — parameter filter di endpoint #1

---

## 5. Metadata per Berkas (ukuran, jenis, tanggal)

**Fitur:** Kolom "Ukuran", "Jenis", "Tanggal diunggah" di tabel daftar Arsip.

**Mock:** Data dari sessionStorage (lihat #1).

**Endpoint dibutuhkan:**
- Sudah tercakup di response `GET /files` (lihat shape di #1)

---

## 6. Pencarian di Map/Berkas

**Fitur:** Input pencarian yang memfilter kartu Map dan Berkas. Di Sprint 1 hanya filter client-side
(dari data yang sudah di-fetch), tanpa endpoint khusus.

**Mock:** Filter JavaScript di sisi client.

**Endpoint dibutuhkan:**
- `GET /menu-items?search=<query>` — filter server-side (opsional untuk Sprint 2; client-filter
  mencukupi jika dataset kecil)
- `GET /sheets?search=<query>` — idem

---

## 7. "Olah Tabel" (Export/Transform)

**Fitur:** Tombol "Olah tabel" di header tabel DTPS. Fungsinya belum ditentukan di Sprint 1
(placeholder button).

**Mock:** Button disabled dengan tooltip "Segera hadir".

**Endpoint dibutuhkan:**
- TBD — kemungkinan `POST /sheets/:id/export` yang mengembalikan file `.xlsx`

---

## 8. Sort by Ukuran / Jenis

**Fitur:** Dropdown sort di daftar Arsip (sort by ukuran, jenis, tanggal).

**Mock:** Sort JavaScript client-side dari data sessionStorage.

**Endpoint dibutuhkan:**
- `GET /files?sortBy=size|mimeType|uploadedAt&order=asc|desc`

---

## 10. Rename & Delete Berkas (Sheet)

**Fitur:** Aksi pensil (ubah nama) dan trash (hapus) pada Berkas card/baris di ContentPage.
Di Sprint 1 aksi ini non-fungsional: klik menampilkan toast "Sprint 2" tanpa menyentuh data.
Kode mock ditandai `// MOCK(sprint2)` di `src/features/menus/pages/ContentPage.tsx`.

**Endpoint dibutuhkan:**
- `PATCH /sheets/:id` — ubah nama sheet; body: `{ name: string }`
- `DELETE /sheets/:id` — hapus sheet beserta seluruh baris dan kolomnya

**Bentuk data (usulan):**
```ts
// PATCH /sheets/:id — request body
{ name: string }

// PATCH /sheets/:id — response
SheetMeta  // (tipe sudah ada di src/types/api.ts)

// DELETE /sheets/:id — response
void (204)
```

**Catatan:** Saat ini import `.xlsx` dapat menumpuk sheet tanpa cara menghapusnya dari UI.
Endpoint ini wajib untuk mengelola siklus hidup sheet.

---

## 9. Render Setia Grid-mirror (Read-only) Sheet — Ekspos CellMerge

**Fitur:** Render setia sheet grid-mirror (`isReadOnly: true`, hasil import `.xlsx` apa adanya) —
header merge bertingkat ala Excel (mis. "Jumlah Calon Mahasiswa" membentang di atas
Pendaftar+Lulus Seleksi). Beda dari sheet DTPS (engine-table) yang sudah benar karena punya pohon
kolom asli.

**Status Sprint 1:** Grid-mirror sheet render apa adanya — kolom flat huruf `A`–`I` (semua `TEXT`,
tanpa hierarki), dan "header" Excel tampil sebagai baris data biasa + sel kosong `—`. Bukan bug
per-sheet; ini fitur yang ditunda (lihat FE-008 "Yang TIDAK dikerjakan").

**Catatan kunci (akar masalah):** Merge metadata SUDAH disimpan backend di tabel `CellMerge`
(`startRow/endRow/startCol/endCol`) saat import (`arsip-backend → imports.service.ts → parseGridSheet`),
tetapi BELUM diekspos di response API mana pun (`GET /sheets/:id`, `/columns`, `/rows` tidak
mengembalikan merge). Tanpa data ini FE tidak bisa merekonstruksi layout — bukan masalah render FE,
tapi data yang dibutuhkan tidak dikirim.

**Endpoint dibutuhkan (pilih salah satu):**
- `GET /sheets/:id/merges` — daftar range merge, ATAU
- tambahkan field `merges` pada response `GET /sheets/:id` atau `GET /sheets/:id/rows`.

**Bentuk data (usulan):**
```ts
interface CellMerge {
  startRow: number; endRow: number;   // 0-based row index (selaras orderIndex baris)
  startCol: number; endCol: number;   // 0-based col index (urutan kolom A, B, C…)
}
```

**Kebutuhan FE saat data tersedia:** untuk sheet `isReadOnly`, render grid dengan colSpan/rowSpan
dari merge ranges; sembunyikan header huruf `A`–`I`; jangan tampilkan sel "merged-away" sebagai `—`.
Konsumen: `src/features/sheets/components/SheetTable.tsx` (+ transform di
`src/features/sheets/lib/columns-to-coldef.tsx`).
