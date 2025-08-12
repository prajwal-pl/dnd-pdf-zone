// export type Size = { width: number; height: number };

// // We store field coordinates in canvas CSS space (origin top-left).
// // PDF uses origin bottom-left; convert when exporting.
// export function cssToPdfY(cssY: number, height: number) {
//   return height - cssY - 0; // top-left -> bottom-left without height (we use absolute y of top, so for baseline use height - top)
// }

// export function pdfToCssY(pdfY: number, height: number) {
//   return height - pdfY;
// }
