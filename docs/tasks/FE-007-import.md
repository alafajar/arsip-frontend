# FE-007 — Import Excel (Konten)

## Tujuan
Menutup DoD #3: ADMIN mengunggah file `.xlsx` dari ContentPage lewat drag-drop dialog →
`POST /imports` → mendarat di `/konten/:workbookMenuId` dengan workbook baru tampil di sidebar.

## Rencana
1. API: `importWorkbook(params)` via `FormData` tanpa Content-Type manual.
2. Hook: `useImportWorkbook` — `await invalidateQueries(['menus'])` lalu `navigate` on success.
3. `UploadDialog`: react-dropzone (.xlsx, 10 MB), nama opsional, spinner "Mengunggah & memproses…".
4. `ContentPage`: tambah tombol "Unggah Berkas" (canEdit only) + render `<UploadDialog>`.

## File diubah
| File | Aksi | Alasan |
|------|------|--------|
| `src/features/imports/api/imports.api.ts` | Dibuat | FormData ke POST /imports |
| `src/features/imports/hooks/useImportWorkbook.ts` | Dibuat | Mutation: invalidate menus lalu navigate |
| `src/features/imports/components/UploadDialog.tsx` | Dibuat | Drag-drop UI + nama opsional |
| `src/features/menus/pages/ContentPage.tsx` | Diperbarui | Tombol "Unggah Berkas" + render dialog |

## Keputusan kunci
1. **Content-Type multipart dibiarkan browser**: FormData tanpa `Content-Type` manual. Browser mengisi
   boundary yang benar. Set manual → boundary hilang → server tidak bisa parse bagian form.
2. **Refetch sebelum navigasi**: `await invalidateQueries(['menus'])` sebelum `navigate`. Tanpa ini,
   router render `/konten/:workbookMenuId` tapi tree belum punya node itu → flash "Map tidak ditemukan".
   `await` memastikan tree ter-update sebelum render halaman tujuan.
3. **parentMenuId = menuId aktif**: workbook jadi child node aktif, sesuai konteks user.
4. **Progress unggah ≠ progress parse**: setelah upload 100%, server masih parsing file. Spinner
   indeterminate lebih jujur dari progress-bar yang berhenti di 100% untuk waktu lama.
5. **403/400/413 ditangani via `getErrorMessage`**: dialog tetap terbuka saat error; user bisa coba lagi.

## Belajar dari sini
- **Multipart boundary**: Content-Type "multipart/form-data" harus berisi `boundary=xxx`. Browser
  menghasilkan boundary acak dan memasukkannya otomatis. Set manual `Content-Type: multipart/form-data`
  (tanpa boundary) = header tidak valid → server gagal parse.
- **Race cache vs route**: TanStack Query cache tidak sinkron dengan navigasi React Router. Jika navigate
  ke node baru sebelum cache ter-update, komponen yang membutuhkan node itu akan merender "tidak ditemukan".
  `await invalidateQueries` + refetch menjamin data siap sebelum komponen mount.
- **Fase parse tidak terukur**: upload adalah transfer jaringan (bisa diukur via `onUploadProgress`),
  tapi parsing Excel server adalah CPU-bound (tidak ada SSE/WebSocket untuk progress). Progress-bar
  yang "macet di 99%" merusak kepercayaan; indeterminate spinner lebih jujur.
