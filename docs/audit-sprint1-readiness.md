# Audit Kesiapan Sprint 1 — Wreksa (fakta + bukti path)

> Audit faktual per 2026-06-24. Bukan penilaian kualitas/gaya. Repo: `arsip-frontend` (FE) dan
> `arsip-backend` (BE). Status verifikasi = statik (baca kode); tidak menjalankan aplikasi end-to-end
> kecuali disebut. "BELUM DIVERIFIKASI" = wiring ada di kode tapi belum diuji runtime dalam audit ini.

## Tabel DoD Sprint 1

| # | Poin DoD | Status | Bukti (path konkret) | Catatan |
|---|----------|--------|----------------------|---------|
| 1 | Admin login + kaprodi view-only | **ADA TAPI BELUM DIVERIFIKASI** | **Login FE:** `src/features/auth/hooks/useLogin.ts` → `authApi.login` → `POST /auth/login`. **Login BE:** `arsip-backend/src/auth/auth.controller.ts:31` `@Post('login')`. **View-only FE:** `src/features/auth/hooks/useCanEdit.ts` (`role === 'ADMIN'`) menyembunyikan tombol tulis. **Enforce BE:** `@Roles(Role.ADMIN)` di menus/sheets/imports controller. | Gating tulis hanya disembunyikan di FE (komentar eksplisit di `useCanEdit.ts:3-4`); otorisasi nyata di BE 403. `RequireAuth` (`src/features/auth/components/RequireAuth.tsx`) hanya cek token, bukan role. KAPRODI view-only secara de-facto total karena FE belum punya UI tulis baris/import (lihat #3, #5). |
| 2 | Admin buat menu bertingkat | **ADA TAPI BELUM DIVERIFIKASI** | **FE:** `src/features/menus/hooks/useCreateMenu.ts` → `createMenu` (`src/features/menus/api/menus.api.ts`) → `POST /menus` body `{name, parentId}`. Dialog: `src/features/menus/components/CreateMapDialog.tsx`. Dipasang di `ContentPage.tsx` (`parentId={menuId}` = sub-map) dan `App.tsx` HomePage (`parentId={null}` = top-level). **BE:** `arsip-backend/src/menu/menus.controller.ts:39` `@Post()` `@Roles(ADMIN)`. | Bertingkat didukung lewat `parentId`. Belum diuji runtime di audit ini. CRUD menu di FE hanya CREATE; PATCH/DELETE menu **TIDAK ADA** di FE (BE punya: `menus.controller.ts:52,66`). |
| 3 | Import Excel DTPS | **TIDAK ADA (di FE)** | **BE ADA:** `arsip-backend/src/imports/imports.controller.ts:32` `@Post()` multipart, field `file/name/parentMenuId`. **FE TIDAK ADA:** `src/features/imports/` hanya berisi `components/.gitkeep` + `hooks/.gitkeep`; tidak ada `imports.api.ts`, hook, atau UI. Tidak ada route import di `src/App.tsx`. | DoD #3 tidak bisa dipenuhi dari UI saat ini; hanya bisa via panggilan API langsung ke BE. |
| 4 | Tabel DTPS tampil benar (header gabung, NIDN nol-depan, link klik) | **ADA TAPI BELUM DIVERIFIKASI** | **Header gabung:** `src/features/sheets/lib/columns-to-coldef.tsx` (grup tanpa accessor, leaf `cells[id]`) + `SheetTable.tsx` thead `colSpan` only. **NIDN nol-depan:** `src/features/sheets/components/CellRenderer.tsx` render verbatim string, tanpa `Number()`. **Link klik:** `CellRenderer.tsx` `type==='URL'` → `<a target="_blank" rel="noopener noreferrer">`. **BE kontrak:** `sheets.controller.ts:45` `/columns` (pohon), `:73` `/rows` (cells string\|null). | Fix `rowSpan` sudah benar di kode (lihat Bagian B). Verifikasi visual DTPS tidak diulang di audit ini; screenshot terakhir user adalah sheet grid-mirror, bukan DTPS. |
| 5 | Admin tambah/ubah/hapus baris | **TIDAK ADA (di FE)** | **BE ADA:** `arsip-backend/src/sheets/sheets.controller.ts:116` `@Post(':id/rows')`, `:132` `@Patch(':id/rows/:rowId')`, `:148` `@Delete(':id/rows/:rowId')` (semua `@Roles(ADMIN)`). **FE TIDAK ADA:** `src/features/sheets/api/sheets.api.ts` hanya `getSheet/getColumns/getRows`. `src/features/sheets/hooks/` hanya `useSheet/useColumns/useRows` (tidak ada mutation). Tombol "Ubah Detail" di `SheetPage.tsx` `disabled` (placeholder FE-009). | CRUD baris belum digarap di FE (ditandai untuk FE-009). |

---

## A. Sheet Grid-mirror (`isReadOnly`, hasil import .xlsx apa adanya)

### A1. Apakah backend menyimpan CellMerge saat import? — **YA**

Capture merge di `arsip-backend/src/imports/imports.service.ts` (`parseGridSheet`, baris 395-405):
```ts
const merges: GridSheetData['merges'] = [];
for (const merge of worksheet.model.merges || []) {
  const [s, e] = merge.split(':');
  const sm = s.match(/^([A-Z]+)(\d+)$/);
  const em = e.match(/^([A-Z]+)(\d+)$/);
  if (!sm || !em) continue;
  merges.push({
    startRow: parseInt(sm[2]), endRow: parseInt(em[2]),
    startCol: colLetterToNum(sm[1]), endCol: colLetterToNum(em[1]),
  });
}
```
Persist ke DB (`imports.service.ts:520-522`):
```ts
if (merges.length > 0) {
  await tx.cellMerge.createMany({
    data: merges.map((m) => ({ sheetId, ...m })),
```
Model Prisma (`arsip-backend/prisma/schema.prisma:180-192`):
```prisma
model CellMerge {
  id       String @id @default(uuid()) @db.Uuid
  sheetId  String @db.Uuid
  startRow Int
  endRow   Int
  startCol Int
  endCol   Int
  sheet Sheet @relation(fields: [sheetId], references: [id], onDelete: Cascade)
  @@index([sheetId])
  @@map("cell_merges")
}
```
`isReadOnly` ditetapkan untuk sheet non-DTPS (`imports.service.ts:218`): `const isReadOnly = sheetData.kind !== 'dtps';`

### A2. Apakah ADA endpoint yang mengembalikan data merge? — **TIDAK ADA**

- `grep "merge\|Merge"` pada `arsip-backend/src/sheets/sheets.service.ts` → **0 match**.
- `arsip-backend/src/sheets/sheets.controller.ts` hanya mengekspos `@Get(':id')`, `@Get(':id/columns')`, `@Get(':id/rows')` — tidak ada `merges` di ketiganya, dan tidak ada endpoint `/merges`.
- Tipe FE `src/types/api.ts` (`SheetMeta`, `Column`, `SheetRow`, `RowsResponse`) tidak punya field merge.

**Kesimpulan:** merge tersimpan di DB tapi tidak pernah dikirim ke FE.

### A3. Bagaimana FE merender sheet `isReadOnly` sekarang? — **FLAT (tidak crash, tidak kacau-fatal)**

- `src/features/sheets/components/SheetTable.tsx` menerima props `{ sheetId, columns }` saja — **tidak membaca `isReadOnly`** dan tidak ada cabang khusus grid-mirror.
- Untuk grid-mirror, `/columns` mengembalikan kolom flat huruf `A`–`I` (semua `TEXT`, `children:[]`), sehingga `columns-to-coldef.tsx` menghasilkan kolom datar; thead menampilkan `A`–`I`, dan "header" Excel ikut tampil sebagai baris data biasa, sel merged-away → `—` (lewat `CellRenderer.tsx`).
- Tidak crash; render flat apa adanya. Tidak setia ke layout Excel (merge tidak diterapkan).
- Sudah didokumentasikan: `docs/sprint2-backend-needs.md` #9 dan `docs/STATE.md` §5/§7.

---

## B. Frontend — Daftar Route + `<thead>` SheetTable

### B1. Route (`src/App.tsx:69-81`)
- `/login` → `LoginPage` (dibungkus `RedirectIfAuthed`)
- `/` → `HomePage` (dibungkus `RequireAuth` → `AppShell`)
- `/konten/:menuId` → `ContentPage`
- `/sheets/:sheetId` → `SheetPage`

Tidak ada route untuk import, arsip, atau edit baris.

### B2. `<thead>` SheetTable (`src/features/sheets/components/SheetTable.tsx:67-84`) — fix rowSpan **BENAR**
```tsx
<thead className="bg-[var(--muted)]">
  {table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}>
      {headerGroup.headers.map((header) => (
        <th
          key={header.id}
          colSpan={header.colSpan}
          scope={header.colSpan > 1 ? 'colgroup' : 'col'}
          className="..."
        >
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </th>
      ))}
    </tr>
  ))}
</thead>
```
Konfirmasi: hanya `colSpan` + `isPlaceholder`; **TANPA `rowSpan`**. Sesuai fix di `docs/fix-header-misalign-frontend.md`.

---

## C. Import (`POST /imports`)

### C1. Signature endpoint BE (`arsip-backend/src/imports/imports.controller.ts:32-95`)
- `@Post()` `@Roles(Role.ADMIN)` `@HttpCode(201)`, `multipart/form-data`, `FileInterceptor('file')`, `memoryStorage`, limit 10 MB, filter `.xlsx`.
- Field form: `file` (required, binary), `name` (optional), `parentMenuId` (optional, uuid).
- Handler memanggil `importsService.importWorkbook(file, req.user.id, req.body.name, req.body.parentMenuId)`.

### C2. FE punya UI/hook pemanggil? — **TIDAK ADA**
- `src/features/imports/` hanya `components/.gitkeep` dan `hooks/.gitkeep` (kosong).
- Tidak ada `imports.api.ts`, tidak ada hook mutation, tidak ada komponen dropzone, tidak ada route. (`react-dropzone` terkunci di stack tapi belum dipakai untuk import.)

---

## D. Gap Sprint 1 (faktual — yang jelas belum ada/rusak untuk menutup 5 DoD)

1. **DoD #3 — Import Excel DTPS: TIDAK ADA di FE.** `src/features/imports/` kosong; tidak ada API/hook/UI/route. BE siap (`POST /imports`).
2. **DoD #5 — CRUD baris: TIDAK ADA di FE.** `sheets.api.ts` tanpa POST/PATCH/DELETE; tidak ada mutation hook; tombol "Ubah Detail" `disabled`. BE siap (`POST/PATCH/DELETE /sheets/:id/rows`).
3. **DoD #2 — Menu: hanya CREATE di FE.** PATCH (rename/pindah) dan DELETE menu tidak ada di FE walau BE siap (`menus.controller.ts:52,66`). (CREATE bertingkat ada.)
4. **DoD #1 & #4 — BELUM DIVERIFIKASI runtime dalam audit ini.** Login, view-only gating, dan render DTPS hanya dikonfirmasi secara statik (kode). Render DTPS spesifik tidak diuji ulang sesi ini (screenshot terakhir = grid-mirror).
5. **Grid-mirror render tidak setia (di luar 5 DoD inti, tapi tampil ke user):** merge tidak diterapkan karena BE tidak mengekspos `CellMerge`. Terdokumentasi sebagai Sprint 2 (`sprint2-backend-needs.md` #9).
6. **`RequireAuth` tidak membedakan role.** Pemisahan ADMIN vs KAPRODI sepenuhnya bergantung pada `useCanEdit` (menyembunyikan UI) + enforcement BE 403; tidak ada route-level role guard di FE.
