# FE-005 — AppShell + Sidebar (dari `/menus`) + Logout Permanen

## Tujuan
Bangun kerangka aplikasi pasca-login: sidebar kiri berisi pohon menu nyata dari `GET /menus`,
chip user + logout permanen, dan area konten ber-outlet. `/konten/:menuId` masih placeholder.

## Rencana
1. `features/menus/api/menus.api.ts` — `getTree()` → GET /menus
2. `features/menus/hooks/useMenuTree.ts` — useQuery dengan loading/error
3. `components/layout/ErrorBoundary.tsx` — class boundary, fallback ramah + tombol muat ulang
4. `components/layout/UserChip.tsx` — username, chip peran, tombol logout
5. `features/menus/components/MenuTree.tsx` — render pohon rekursif, expand/collapse, node aktif
6. `components/layout/Sidebar.tsx` — brand, section Konten, section Arsip (statis), UserChip
7. `components/layout/AppShell.tsx` — grid 2 kolom: sidebar + Outlet dibungkus ErrorBoundary
8. `features/menus/pages/ContentPage.tsx` — placeholder konten: judul node dari tree
9. `src/App.tsx` — wiring AppShell, routes baru, hapus PlaceholderHome + tombol logout temp

---

## File diubah

| File | Alasan |
|------|--------|
| `src/features/menus/api/menus.api.ts` | Baru — API call GET /menus |
| `src/features/menus/hooks/useMenuTree.ts` | Baru — TanStack Query hook untuk pohon menu |
| `src/components/layout/ErrorBoundary.tsx` | Baru — class component, fallback ramah, tombol reload |
| `src/components/layout/UserChip.tsx` | Baru — username + role chip + logout (SignOut Phosphor) |
| `src/features/menus/components/MenuTree.tsx` | Baru — pohon rekursif, expand/collapse a11y |
| `src/components/layout/Sidebar.tsx` | Baru — sidebar lengkap: brand, Konten, Arsip dekoratif |
| `src/components/layout/AppShell.tsx` | Baru — layout 2 kolom sidebar + Outlet |
| `src/features/menus/pages/ContentPage.tsx` | Baru — placeholder konten per menuId |
| `src/App.tsx` | Update — hapus TEMP logout, tambah AppShell + /konten/:menuId |

---

## Keputusan kunci

1. **Sidebar = pohon map saja** — sheet ditampilkan di area konten (FE-006), bukan sidebar.
   Node menampilkan nama map; sheets tidak muncul di sidebar.
2. **Arsip = dekoratif Sprint 1** — render item statis tanpa fungsi. Tercatat di sprint2-backend-needs.md.
3. **ErrorBoundary + a11y disisipkan sekarang** — menutup gap secara incremental di stage UI pertama;
   tidak ditunda ke "stage hardening" terpisah.
4. **Server state menu via TanStack Query** — tidak disalin ke Zustand. Menu adalah server state:
   stale, refetchable, cacheable. Zustand untuk client state (auth). Mencampur keduanya membuat
   invalidasi cache jadi manual dan rawan bug.
5. **Identitas chip = `username`** — sesuai `/me` (fullName tidak tersedia di /me).
6. **Expand state = `Set<string>` di Sidebar** — lokal React state, tidak perlu Zustand/URL karena
   preferensi UI navigasi bukan app state yang perlu di-share atau di-persist.

---

## Belajar dari sini

- **Server state (menu) via TanStack Query, bukan Zustand** — Query menangani loading/error/stale/cache
  secara deklaratif. Zustand tidak punya konsep "stale data dari server" — itu harus diimplementasi
  manual. Gunakan alat yang tepat untuk tiap jenis state.
- **Render rekursif + key stabil** — key={node.id} (bukan index) penting agar React bisa membedakan
  node yang dipindah/diubah tanpa merender ulang seluruh pohon. Ini juga mencegah state lokal
  (expand/collapse) tercampur antar node.
- **ErrorBoundary mencegah satu error komponen merobohkan seluruh app** — React secara default
  un-mount seluruh tree saat ada uncaught render error. ErrorBoundary mengisolasi kerusakan ke
  sub-tree, memungkinkan app tetap berfungsi parsial.
