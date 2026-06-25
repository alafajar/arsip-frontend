import type { CellMerge } from '@/types/api';

// Geometri merge untuk render grid-mirror. Koordinat 1-based, selaras
// SheetRow.orderIndex (baris) dan Column.orderIndex (kolom).

export interface MergeSpan {
  rowSpan: number;
  colSpan: number;
}

export interface MergeIndex {
  /** Span jika (row,col) adalah sudut kiri-atas sebuah merge; undefined bila bukan anchor. */
  anchorAt: (row: number, col: number) => MergeSpan | undefined;
  /** True jika (row,col) berada DI DALAM merge tapi BUKAN anchor → harus dilewati (tidak render <td>). */
  isCovered: (row: number, col: number) => boolean;
}

const key = (row: number, col: number): string => `${row},${col}`;

export function buildMergeIndex(merges: CellMerge[]): MergeIndex {
  const anchors = new Map<string, MergeSpan>();
  const covered = new Set<string>();

  for (const m of merges) {
    const rowSpan = m.endRow - m.startRow + 1;
    const colSpan = m.endCol - m.startCol + 1;
    if (rowSpan < 1 || colSpan < 1) continue;       // guard koordinat rusak
    if (rowSpan === 1 && colSpan === 1) continue;    // bukan merge nyata

    anchors.set(key(m.startRow, m.startCol), { rowSpan, colSpan });
    for (let r = m.startRow; r <= m.endRow; r++) {
      for (let c = m.startCol; c <= m.endCol; c++) {
        if (r === m.startRow && c === m.startCol) continue;
        covered.add(key(r, c));
      }
    }
  }

  return {
    anchorAt: (row, col) => anchors.get(key(row, col)),
    isCovered: (row, col) => covered.has(key(row, col)),
  };
}
