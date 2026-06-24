# FE-009 — CRUD Baris: Mode-Edit Tabel + Modal Generik

## Tujuan
Menutup DoD #5: ADMIN dapat menambah, mengubah, dan menghapus baris pada sheet DTPS (bukan read-only)
lewat mode-edit tabel + modal generik yang digerakkan metadata kolom dari `/columns`.

## Rencana
1. API: tambah `createRow/updateRow/deleteRow` ke `sheets.api.ts`.
2. Hooks mutation: `useCreateRow/useUpdateRow/useDeleteRow` (invalidate `rows` on success, toast on error).
3. `error-message.ts`: tambah penanganan 409 (sheet read-only).
4. `DeleteRowDialog`: konfirmasi hapus sederhana.
5. `RowFormDialog`: form generik dari pohon kolom (grup → label+anak berdampingan; leaf → input per tipe).
6. `SheetTable`: tambah props editMode + action column (pensil/hapus) + "Tambah baris" di bawah tabel.
7. `SheetPage`: gerbang `canEdit && !isReadOnly`, editMode state, wire dialogs.

## File diubah
| File | Aksi | Alasan |
|------|------|--------|
| `src/lib/api/error-message.ts` | Diperbarui | Tambah penanganan 409 (sheet read-only) |
| `src/features/sheets/api/sheets.api.ts` | Diperbarui | Tambah createRow, updateRow, deleteRow |
| `src/features/sheets/hooks/useCreateRow.ts` | Dibuat | Mutation POST /sheets/:id/rows |
| `src/features/sheets/hooks/useUpdateRow.ts` | Dibuat | Mutation PATCH /sheets/:id/rows/:rowId |
| `src/features/sheets/hooks/useDeleteRow.ts` | Dibuat | Mutation DELETE /sheets/:id/rows/:rowId |
| `src/features/sheets/components/DeleteRowDialog.tsx` | Dibuat | Konfirmasi hapus baris |
| `src/features/sheets/components/RowFormDialog.tsx` | Dibuat | Form generik tambah/ubah baris dari pohon kolom |
| `src/features/sheets/components/SheetTable.tsx` | Diperbarui | Mode-edit: action column + "Tambah baris" |
| `src/features/sheets/pages/SheetPage.tsx` | Diperbarui | Gerbang edit, state mode-edit, wire dialogs |

## Keputusan kunci
1. **Gerbang edit dobel**: `canEdit && !sheet.isReadOnly`. Backend tetap penjaga (403/409). Menyembunyikan UI bukan keamanan; 409 ditangani via toast.
2. **Form generik dari `/columns`**: bukan hardcoded DTPS. Grup → fieldset + anak berdampingan. Leaf → input per tipe.
3. **Required TIDAK ada**: required = turunan skema formula (Sprint 2). Jangan hardcode; saat formula ada, required digerakkan skema. Semua field opsional di form ini.
4. **Kontrak tulis**: value selalu string; `value:""` = hapus cell; hanya kolom leaf di `cells`.
5. **Toggle "Dokumen Internal" + file picker = dummy sessionStorage** (`// MOCK(sprint2)`); URL eksternal = nyata (masuk `cells`).
6. **Sinkron via invalidate `rows`**: bukan tebak bentuk response mutasi; invalidate seluruh cache baris sheet aktif.

## Belajar dari sini
- **Form generik selaras "engine tabel"**: hardcoded DTPS akan rusak saat skema berubah; form dari `/columns` otomatis menyesuaikan kolom baru tanpa perubahan FE.
- **`value:""` vs tidak menyertakan**: `""` artinya "hapus cell"; tidak menyertakan artinya "biarkan tak berubah". Untuk edit, kirim semua leaf agar field yang dikosongkan user benar-benar terhapus.
- **Sembunyikan ≠ amankan**: `useCanEdit` dan `!isReadOnly` hanya kenyamanan UI; 403 (peran) dan 409 (read-only) dari server tetap harus ditangani sebagai toast, bukan diabaikan.
- **Required ditunda**: required adalah aturan domain (validasi skema), bukan properti statis kolom. Mengimplementasinya sekarang = menebak; sistem formula Sprint 2 yang akan menentukannya.
