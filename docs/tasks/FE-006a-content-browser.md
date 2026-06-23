# FE-006a — Content Browser (Baca-saja): Map & Berkas

## Tujuan
Ganti placeholder ContentPage FE-005 dengan browser konten nyata: kartu sub-Map (children) dan
Berkas (sheets) yang diambil dari cache pohon `['menus']`, dilengkapi breadcrumb, pencarian
sisi-klien, toggle grid/list, dan sort nama.

## Rencana
1. `features/menus/lib/find-node.ts` — `findNodeById` + `getAncestorPath` (utl tree traversal)
2. `features/menus/components/Breadcrumb.tsx` — nav dari ancestor path
3. `features/menus/components/MapCard.tsx` — kartu map, grid & list mode
4. `features/menus/components/BerkasCard.tsx` — kartu berkas, grid & list mode
5. `features/menus/pages/ContentPage.tsx` — ganti placeholder; state search/viewMode/sortDir
6. `features/sheets/pages/SheetPage.tsx` — placeholder route /sheets/:sheetId (FE-008)
7. `src/App.tsx` — tambah /sheets/:sheetId, update HomePage dengan empty state pohon

---

## File diubah

| File | Alasan |
|------|--------|
| `src/features/menus/lib/find-node.ts` | Baru — tree traversal: findNodeById + getAncestorPath |
| `src/features/menus/components/Breadcrumb.tsx` | Baru — nav breadcrumb dari ancestor path |
| `src/features/menus/components/MapCard.tsx` | Baru — kartu sub-map, grid/list mode, keyboard a11y |
| `src/features/menus/components/BerkasCard.tsx` | Baru — kartu sheet, grid/list mode, keyboard a11y |
| `src/features/menus/pages/ContentPage.tsx` | Ganti placeholder FE-005 — browser lengkap |
| `src/features/sheets/pages/SheetPage.tsx` | Baru — placeholder tabel sheet (FE-008) |
| `src/App.tsx` | Tambah /sheets/:sheetId; HomePage-aware pohon kosong |

---

## Keputusan kunci

1. **Sumber data = cache `['menus']`** — tidak ada `GET /menus/:id`. Node diambil dari pohon
   yang sudah di-fetch oleh Sidebar via `useMenuTree`. Sidebar & konten otomatis sinkron karena
   mengonsumsi query key yang sama.
2. **006a baca-saja** — tidak ada tombol Tambah/rename/hapus Map. Mutasi ditunda ke 006b setelah
   perilaku `DELETE /menus/:id` pada node tak-kosong diverifikasi bersama backend.
3. **Buat Berkas (sheet manual) = Sprint 2** — tidak dibangun. Berkas tidak menampilkan
   ukuran/jenis/tanggal karena field tersebut tidak ada di response backend.
4. **Sort hanya Nama** — opsi Tanggal/Jenis/Ukuran tidak dirender (tak ada data backend); lebih
   bersih menghilangkan opsi yang tidak berfungsi daripada merender disabled dengan placeholder.
5. **Pencarian = filter sisi-klien** — cukup untuk dataset Sprint 1. Pencarian isi lintas-sheet
   butuh backend (Sprint 2, dicatat di sprint2-backend-needs.md).

---

## Belajar dari sini

- **Satu query jadi sumber untuk sidebar + breadcrumb + browser sekaligus** — karena pohon
  menu ada di TanStack Query cache (`['menus']`), semua komponen yang memanggilnya mendapat
  data yang sama tanpa request tambahan. Ini jauh lebih efisien daripada fetch-per-halaman.
- **Filter/sort sisi-klien aman untuk dataset kecil** — dataset Sprint 1 (puluhan node menu)
  cocok di-filter di browser. "Pencarian isi" lintas ribuan baris DTPS harus ke backend; tapi
  menyaring nama map dari daftar kecil tidak butuh endpoint.
- **Menghilangkan field yang tidak ada datanya** lebih baik daripada menampilkan "—" — kolom
  Ukuran/Jenis/Tanggal yang selalu "—" menambah visual noise tanpa nilai informasi; lebih bersih
  tidak ditampilkan sampai backend menyediakan field tersebut.
