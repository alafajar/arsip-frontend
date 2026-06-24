# FE-006c — Menu Management + Aksi Berkas

## Tujuan
Pindahkan pemicu create map ke sidebar, tambahkan rename+delete MAP (fungsional via PATCH/DELETE /menus/:id),
dan tambahkan UI pensil/trash untuk berkas (non-fungsional, Sprint 2).

## Rencana
1. Tambah `renameMenu`/`deleteMenu` ke `menus.api.ts`
2. Buat hooks `useRenameMenu`, `useDeleteMenu`
3. Buat komponen dialog: `RenameMapDialog`, `DeleteMapDialog`
4. Update `MapCard` + `BerkasCard` dengan hover/focus-within actions (group pattern)
5. Update `MenuTree` dengan hover/focus-within actions per node; terima `parentId`
6. Update `Sidebar`: "+ Map Baru" (ADMIN), "+ Arsip Baru" (MOCK), mount rename/delete dialogs
7. Update `ContentPage`: wire rename/delete untuk maps, MOCK toast untuk berkas
8. Tambah entri #10 di `sprint2-backend-needs.md`

## File Diubah / Dibuat
| File | Aksi |
|------|------|
| `src/features/menus/api/menus.api.ts` | Tambah `renameMenu`, `deleteMenu` |
| `src/features/menus/hooks/useRenameMenu.ts` | Baru |
| `src/features/menus/hooks/useDeleteMenu.ts` | Baru |
| `src/features/menus/components/RenameMapDialog.tsx` | Baru |
| `src/features/menus/components/DeleteMapDialog.tsx` | Baru |
| `src/features/menus/components/MapCard.tsx` | Tambah hover actions |
| `src/features/menus/components/BerkasCard.tsx` | Tambah hover actions (MOCK) |
| `src/features/menus/components/MenuTree.tsx` | Tambah hover actions + parentId |
| `src/components/layout/Sidebar.tsx` | "+ Map Baru", rename/delete dialogs |
| `src/features/menus/pages/ContentPage.tsx` | Wire rename/delete; berkas MOCK |
| `docs/sprint2-backend-needs.md` | Tambah entri #10 (PATCH/DELETE /sheets/:id) |

## Keputusan Kunci
1. **Create top-level pindah ke sidebar.** "+ Map Baru" di bawah label "Konten" membuka
   `CreateMapDialog` dengan `parentId=null`. Tombol "Tambah Map" di ContentPage tetap ada
   (membuat sub-map dengan `parentId=menuId`).
2. **Rename/delete map dibuka kembali dari Sprint 2** (pembalikan keputusan atas permintaan user).
   Diimplementasikan sepenuhnya di stage ini.
3. **Delete robust ke cascade DAN 409.** `getErrorMessage` sudah menangani 409 dengan pesan
   server. `onSuccess` invalidate + toast; kalau 409 → toast pesan server. Tidak ada asumsi.
4. **Rename kirim `parentId` lama.** PATCH /menus/:id menimpa semua field termasuk `parentId`;
   mengirim `parentId` baru akan memindahkan node ke parent lain secara tidak sengaja.
5. **Aksi berkas = UI saja.** Klik pensil/trash berkas → `toast.info("Sprint 2")`. Tidak ada
   fake delete via sessionStorage (data server nyata; refetch akan memunculkannya lagi).
6. **Hover actions muncul saat fokus (a11y).** Pola `group-hover:opacity-100 group-focus-within:opacity-100`
   via Tailwind group; action buttons bisa di-Tab; punya `aria-label`.

## Belajar dari Sini
- **Handler delete dibuat robust ke dua perilaku** karena deskripsi API (Swagger) adalah niat,
  bukan bukti runtime. Backend bisa menolak delete node berisi dengan 409, atau cascade-delete.
  Menangani keduanya membuat UI tidak bisa salah.
- **"Fake delete" berkas via sessionStorage menyesatkan** karena sheet adalah data server nyata.
  Setelah refetch TanStack Query (misalnya saat user kembali ke halaman), sheet akan muncul lagi.
  Mock yang benar hanya boleh menyembunyikan — bukan menghapus — data server nyata.
- **Rename harus menyertakan `parentId` lama** karena PATCH /menus/:id bersifat "replace all",
  bukan "partial update" untuk nama saja. Tanpa `parentId`, backend bisa menginterpretasikan
  `parentId: undefined` sebagai "pindah ke root" dan memecah hierarki.
