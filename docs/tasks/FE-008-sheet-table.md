# FE-008 — Tabel Sheet (DTPS)

## Tujuan
Mengganti placeholder `/sheets/:sheetId` dengan tabel DTPS nyata: ambil metadata + kolom + baris,
render via TanStack Table dengan header bertingkat otomatis, NIDN string utuh, URL clickable,
dan pagination server-side (limit/offset).

## Rencana
1. API layer: `sheets.api.ts` — `getSheet`, `getColumns`, `getRows`.
2. Hooks: `useSheet`, `useColumns`, `useRows` (keepPreviousData untuk navigasi halaman mulus).
3. Transform: `columns-to-coldef.tsx` — rekursif Column[] → ColumnDef[]; grup tanpa accessor, leaf dengan closure `CellRenderer`.
4. Komponen: `CellRenderer` (URL/kosong/teks), `SheetTable` (tabel + pagination state), `SheetPage` (meta + breadcrumb + shell).

## File diubah
| File | Aksi | Alasan |
|------|------|--------|
| `src/lib/query-keys.ts` | Diperbarui | Tambah `columns`, pisah `rowsPage` (dengan limit/offset) agar halaman berbeda cache terpisah |
| `src/features/sheets/api/sheets.api.ts` | Dibuat | `getSheet`, `getColumns`, `getRows` via axios client |
| `src/features/sheets/hooks/useSheet.ts` | Dibuat | Query metadata sheet |
| `src/features/sheets/hooks/useColumns.ts` | Dibuat | Query pohon kolom; `staleTime 5m` (kolom relatif statis) |
| `src/features/sheets/hooks/useRows.ts` | Dibuat | Query baris; `placeholderData: keepPreviousData` untuk transisi halaman mulus |
| `src/features/sheets/lib/columns-to-coldef.tsx` | Dibuat | Rekursif Column[] → ColumnDef[]; CellRenderer di-inline via closure |
| `src/features/sheets/components/CellRenderer.tsx` | Dibuat | Render per tipe: URL = link "Buka folder", lainnya = string verbatim, null/kosong = "—" |
| `src/features/sheets/components/SheetTable.tsx` | Dibuat | TanStack Table + state pageIndex/pageSize + pagination controls |
| `src/features/sheets/pages/SheetPage.tsx` | Diganti | Ganti placeholder; breadcrumb dari menu tree + nama sheet; "Ubah Detail" disabled |

## Keputusan kunci
1. **Grup tanpa accessor**: kolom grup (non-leaf) tidak punya accessor di ColumnDef — data grup
   selalu `null` di rows; memaksa accessor menghasilkan kolom kosong salah. Hanya leaf yang
   membaca `cells[col.id]`.
2. **Semua cell string|null**: tidak ada konversi tipe. `INTEGER "1"` tetap `"1"`, NIDN
   `"0017026012"` tetap utuh — parsing ke number menghilangkan nol di depan, merusak data akreditasi.
3. **Pagination server-side, limit/offset eksplisit**: default server 50 ≠ default UI 10.
   Mengandalkan default server → halaman pertama selalu 50 baris, pengalaman pengguna rusak.
4. **`keepPreviousData`**: navigasi halaman tetap menampilkan data halaman lama sampai halaman
   baru tiba — tidak ada flash kosong antar halaman.
5. **Tombol "Ubah Detail" disabled**: fungsinya di FE-009, tidak dikabel sekarang.
6. **Breadcrumb inline di SheetPage**: ancestor dari menu tree (sudah ter-cache oleh Sidebar),
   sheet name sebagai `aria-current="page"` terakhir — tanpa request tambahan.

## Belajar dari sini
- **Mengapa accessor pada grup menghasilkan kolom kosong**: TanStack Table memanggil `accessorFn`
  pada tiap baris; kolom grup di backend tidak punya cell (selalu `null`), jadi kolom itu tampil
  kosong meski data sebenarnya ada di leaf. Solusi: ColumnDef grup = `{ id, header, columns }` tanpa
  `accessorFn`.
- **Mengapa nilai numerik/NIDN tetap string**: `"0017026012"` diparsing ke `Number` → `17026012`
  (kehilangan nol depan). Untuk akreditasi, NIDN adalah identifier bukan angka — parsing merusak
  data. Konvensi backend "semua cell = string|null" sudah menjaga ini; frontend cukup ikut.
- **Pagination client vs server**: client-side pagination butuh semua data dulu (tidak skalabel);
  server-side (limit/offset + `total`) memungkinkan dataset besar tanpa over-fetch. DTPS 24 baris
  → 3 halaman pada page-size 10, demonstrasi pagination server-side benar.
