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
