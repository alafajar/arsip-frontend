# FE-006b — Tambah Map (Create) + Role Gating

## Tujuan
Tambahkan satu mutasi: membuat Map baru (`POST /menus`) dengan dua jalur — di dalam node aktif
(`parentId = node.id`) dan di root (`parentId = null`). KAPRODI tidak melihat tombol create.

## Rencana
1. `features/auth/hooks/useCanEdit.ts` — role gate: `user.role === 'ADMIN'`
2. `lib/api/error-message.ts` — util ekstrak pesan dari AxiosError (dipakai ulang FE-009)
3. `features/menus/api/menus.api.ts` — tambah `createMenu`
4. `features/menus/hooks/useCreateMenu.ts` — useMutation + invalidateQueries(['menus'])
5. `components/ui/dialog.tsx` — shadcn dialog via @radix-ui/react-dialog
6. `features/menus/components/CreateMapDialog.tsx` — form: nama wajib, trim, zod
7. Update `ContentPage.tsx` — tombol di toolbar + empty state + dialog render
8. Update `App.tsx` — tombol "Buat Map" di root empty state

---

## File diubah

| File | Alasan |
|------|--------|
| `src/features/auth/hooks/useCanEdit.ts` | Baru — helper role gate ADMIN |
| `src/lib/api/error-message.ts` | Baru — ekstrak pesan AxiosError, fallback generik |
| `src/features/menus/api/menus.api.ts` | Tambah `createMenu(body)` → POST /menus |
| `src/features/menus/hooks/useCreateMenu.ts` | Baru — mutation + invalidate + toast |
| `src/components/ui/dialog.tsx` | Baru — shadcn Dialog (Radix + Phosphor X) |
| `src/features/menus/components/CreateMapDialog.tsx` | Baru — dialog form nama map |
| `src/features/menus/pages/ContentPage.tsx` | Tambah tombol toolbar + tombol empty state + dialog |
| `src/App.tsx` | Tambah tombol "Buat Map" di root empty state |

---

## Keputusan kunci

1. **Create-only** — rename & delete map masuk backlog Sprint 2. DoD Sprint 1 hanya menuntut
   membuat menu; ikon ⋮ di wireframe tidak pernah menampilkan isinya.
2. **`parentId`**: root = `null`, dalam-node = `node.id`. Dua jalur dari tiga pemicu (toolbar,
   empty-node, empty-root) — keduanya memakai dialog yang sama dengan prop `parentId` yang berbeda.
3. **Sinkron via `invalidateQueries(['menus'])`** — tidak perlu menebak bentuk response `POST /menus`.
   Sidebar, breadcrumb, dan browser otomatis konsisten karena mengonsumsi query key yang sama.
4. **`canEdit` menyembunyikan UI, BUKAN keamanan** — KAPRODI tidak melihat tombol, tapi backend
   tetap penjaga sebenarnya (403). 403 ditangani di `onError` → toast, bukan crash.
5. **Per-call callback** pada `mutate(body, { onSuccess })` menutup dialog + reset form; hook's
   `onSuccess` menampilkan toast sukses. Keduanya berjalan karena TanStack Query v5 menggabungkan
   callback mutation-level dan call-level.

---

## Belajar dari sini

- **Invalidate+refetch lebih aman daripada menyisipkan node dari response** — bentuk response
  `POST /menus` bisa berubah (field tambahan, nesting berbeda), tapi cache `['menus']` selalu
  mewakili kebenaran server setelah refetch. Manipulasi cache manual rawan drift.
- **Menyembunyikan tombol ≠ keamanan** — UI role gating adalah UX; attacker bisa panggil endpoint
  langsung. Backend harus authorize setiap request (403). Frontend menangani 403 dengan toast
  yang ramah, bukan crash atau layar putih.
- **Satu query key (`['menus']`) membuat tiga tampilan konsisten otomatis** — satu `invalidateQueries`
  menyebabkan sidebar, breadcrumb, dan browser semuanya refetch dan menampilkan data terbaru
  tanpa koordinasi manual.
