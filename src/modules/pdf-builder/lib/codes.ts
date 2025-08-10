// Utilities to generate QR and Barcode data URLs on the client
// These run in the browser. For server usage, consider a Canvas polyfill.

export async function generateQrDataUrl(
  value: string,
  size = 128
): Promise<string> {
  if (!value) return emptyPng(size, size);
  const QR = await import(/* webpackChunkName: "qrcode" */ "qrcode");
  return QR.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: size,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

export async function generateBarcodeDataUrl(
  value: string,
  opts?: {
    format?: "code128" | "code39" | "ean13";
    width?: number;
    height?: number;
  }
): Promise<string> {
  if (!value) return emptyPng(opts?.width ?? 200, opts?.height ?? 60);
  const { default: JsBarcode } = await import(
    /* webpackChunkName: "jsbarcode" */ "jsbarcode"
  );
  const canvas = document.createElement("canvas");
  const width = opts?.width ?? 200;
  const height = opts?.height ?? 60;
  canvas.width = width;
  canvas.height = height;
  const formatMap: Record<string, string> = {
    code128: "CODE128",
    code39: "CODE39",
    ean13: "EAN13",
  };
  const format = formatMap[opts?.format ?? "code128"];
  try {
    JsBarcode(canvas, value, {
      format,
      width: Math.max(1, Math.floor((width - 10) / Math.max(value.length, 12))),
      height: Math.max(24, height - 8),
      displayValue: false,
      margin: 2,
      background: "#ffffff",
      lineColor: "#000000",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return emptyPng(width, height);
  }
}

function emptyPng(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ddd";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }
  return canvas.toDataURL("image/png");
}
