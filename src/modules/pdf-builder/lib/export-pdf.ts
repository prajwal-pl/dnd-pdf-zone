import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Template, AnyField } from "../types/schema";
import { generateQrDataUrl, generateBarcodeDataUrl } from "./codes";

export type ExportOptions = {
  acroform?: boolean; // generate editable fields
  flatten?: boolean; // flatten fields
  data?: Record<string, unknown>; // bindings data
};

export async function exportTemplateToPdf(
  template: Template,
  opts: ExportOptions = {}
) {
  const pdfDoc = await PDFDocument.create();

  const form = opts.acroform ? pdfDoc.getForm() : null;
  for (const page of template.pages) {
    const pdfPage = pdfDoc.addPage([page.width, page.height]);

    if (page.background) {
      const bgBytes = dataUrlToBytes(page.background);
      try {
        const img = page.background.startsWith("data:image/png")
          ? await pdfDoc.embedPng(bgBytes)
          : await pdfDoc.embedJpg(bgBytes);
        pdfPage.drawImage(img, {
          x: 0,
          y: 0,
          width: page.width,
          height: page.height,
        });
      } catch (e) {
        // ignore background if failed
        console.log(e);
      }
    }

    // Pre-embed Helvetica variants for styling
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fontBoldItalic = await pdfDoc.embedFont(
      StandardFonts.HelveticaBoldOblique
    );
    const pickFont = (f: AnyField) => {
      const isBold = (f.style?.fontWeight ?? "") === "bold";
      const isItalic = Boolean(f.style?.italic);
      if (isBold && isItalic) return fontBoldItalic;
      if (isBold) return fontBold;
      if (isItalic) return fontItalic;
      return fontRegular;
    };
    for (const f of page.fields) {
      if (form) {
        addFormField(pdfDoc, form, pdfPage, f, pickFont(f), page.height);
      } else {
        await drawField(pdfDoc, pdfPage, f, pickFont(f), page.height);
      }
    }
  }

  if (opts.flatten && form) form.flatten();
  const bytes = await pdfDoc.save({
    addDefaultPage: false,
    useObjectStreams: true,
  });
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

function yTopToPdf(yTop: number, height: number, pageHeight: number) {
  return pageHeight - yTop - height;
}

async function drawField(
  pdfDoc: PDFDocument,
  page: any,
  f: AnyField,
  font: any,
  pageHeight: number
) {
  // WYSIWYG: coordinates already in PDF points. Draw simple preview for now.
  switch (f.type) {
    case "text": {
      const y = yTopToPdf(f.y, f.height, pageHeight);
      page.drawRectangle({
        x: f.x,
        y,
        width: f.width,
        height: f.height,
        opacity: 0.05,
        color: rgb(0, 0, 0),
      });
      const text = (f as any).value ?? "";
      const size = f.style?.fontSize ?? 10;
      const col = hexToRgb(f.style?.color ?? "#000000");
      if (text) {
        const ty = y + f.height - size - 2; // top padding with font size
        page.drawText(String(text), {
          x: f.x + 2,
          y: ty,
          size,
          font,
          color: col,
        });
        if (f.style?.underline) {
          const width = font.widthOfTextAtSize(String(text), size);
          page.drawLine({
            start: { x: f.x + 2, y: ty - 1 },
            end: { x: f.x + 2 + width, y: ty - 1 },
            thickness: 0.5,
            color: col,
          });
        }
      }
      return;
    }
    case "date": {
      // Treat like styled text
      const y = yTopToPdf((f as any).y, (f as any).height, pageHeight);
      const text = (f as any).value ?? "";
      const size = (f as any).style?.fontSize ?? 10;
      const col = hexToRgb((f as any).style?.color ?? "#000000");
      if (text) {
        const ty = y + (f as any).height - size - 2;
        page.drawText(String(text), {
          x: (f as any).x + 2,
          y: ty,
          size,
          font,
          color: col,
        });
        if ((f as any).style?.underline) {
          const width = (font as any).widthOfTextAtSize(String(text), size);
          page.drawLine({
            start: { x: (f as any).x + 2, y: ty - 1 },
            end: { x: (f as any).x + 2 + width, y: ty - 1 },
            thickness: 0.5,
            color: col,
          });
        }
      }
      return;
    }
    case "checkbox": {
      const y = yTopToPdf(f.y, f.height, pageHeight);
      page.drawRectangle({
        x: f.x,
        y,
        width: f.width,
        height: f.height,
        opacity: 0.1,
        color: rgb(0, 0, 0),
      });
      if ((f as any).checked) {
        page.drawLine({
          start: { x: f.x, y },
          end: { x: f.x + f.width, y: y + f.height },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
        page.drawLine({
          start: { x: f.x + f.width, y },
          end: { x: f.x, y: y + f.height },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }
      return;
    }
    case "image":
    case "signature": {
      const y = yTopToPdf(f.y, f.height, pageHeight);
      const src = (f as any).src;
      if (typeof src === "string") {
        try {
          let bytes: Uint8Array | undefined;
          if (src.startsWith("data:image/")) {
            bytes = dataUrlToBytes(src);
          } else {
            // fetch remote image URL
            const res = await fetch(src);
            const buf = new Uint8Array(await res.arrayBuffer());
            bytes = buf;
          }
          if (bytes) {
            const isPng =
              src.includes(".png") || src.startsWith("data:image/png");
            const img = isPng
              ? await pdfDoc.embedPng(bytes)
              : await pdfDoc.embedJpg(bytes);
            page.drawImage(img, {
              x: f.x,
              y,
              width: f.width,
              height: f.height,
              opacity: f.opacity ?? 1,
            });
            return;
          }
        } catch {
          // fallthrough to placeholder
        }
      }
      page.drawRectangle({
        x: f.x,
        y,
        width: f.width,
        height: f.height,
        opacity: 0.05,
        color: rgb(0, 0, 0),
      });
      return;
    }
    case "qr": {
      const y = yTopToPdf((f as any).y, (f as any).height, pageHeight);
      const val = (f as any).value ?? "";
      if (val) {
        try {
          const dataUrl = await generateQrDataUrl(
            String(val),
            Math.floor(Math.min((f as any).width, (f as any).height))
          );
          const bytes = dataUrlToBytes(dataUrl);
          const img = await pdfDoc.embedPng(bytes);
          page.drawImage(img, {
            x: (f as any).x,
            y,
            width: (f as any).width,
            height: (f as any).height,
          });
        } catch {
          // fallback: box
          page.drawRectangle({
            x: (f as any).x,
            y,
            width: (f as any).width,
            height: (f as any).height,
            opacity: 0.05,
            color: rgb(0, 0, 0),
          });
        }
      }
      return;
    }
    case "barcode": {
      const y = yTopToPdf((f as any).y, (f as any).height, pageHeight);
      const val = (f as any).value ?? "";
      if (val) {
        try {
          const dataUrl = await generateBarcodeDataUrl(String(val), {
            width: Math.floor((f as any).width),
            height: Math.floor((f as any).height),
          });
          const bytes = dataUrlToBytes(dataUrl);
          const img = await pdfDoc.embedPng(bytes);
          page.drawImage(img, {
            x: (f as any).x,
            y,
            width: (f as any).width,
            height: (f as any).height,
          });
        } catch {
          page.drawRectangle({
            x: (f as any).x,
            y,
            width: (f as any).width,
            height: (f as any).height,
            opacity: 0.05,
            color: rgb(0, 0, 0),
          });
        }
      }
      return;
    }
    default: {
      return;
    }
  }
}

function addFormField(
  pdfDoc: PDFDocument,
  form: any,
  page: any,
  f: AnyField,
  font: any,
  pageHeight: number
) {
  const y = yTopToPdf(f.y, f.height, pageHeight);
  const name = f.name ?? f.id;
  switch (f.type) {
    case "text": {
      const tf = form.createTextField(name);
      tf.setText((f as any).value ?? "");
      tf.addToPage(page, { x: f.x, y, width: f.width, height: f.height });
      return;
    }
    case "date": {
      const tf = form.createTextField(name);
      tf.setText((f as any).value ?? "");
      tf.addToPage(page, { x: f.x, y, width: f.width, height: f.height });
      return;
    }
    case "checkbox": {
      const cb = form.createCheckBox(name);
      if ((f as any).checked) cb.check();
      cb.addToPage(page, { x: f.x, y, width: f.width, height: f.height });
      return;
    }
    default: {
      // Non-form visuals will be drawn as graphics in non-acroform export
      return;
    }
  }
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binStr = atob(base64);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return rgb(0, 0, 0);
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  return rgb(r, g, b);
}
