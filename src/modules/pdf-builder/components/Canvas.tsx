"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { cn } from "@/lib/utils";
import { generateQrDataUrl, generateBarcodeDataUrl } from "../lib/codes";

export default function Canvas() {
  const { template, selectedPageId, selectedFieldId, removeField } = usePdfBuilder();
  const page =
    template.pages.find((p) => p.id === selectedPageId) ?? template.pages[0];
  if (!page) return null;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedFieldId) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeField(selectedFieldId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedFieldId, removeField]);
  return (
    <div
      className="relative bg-white shadow"
      style={{ width: page.width, height: page.height }}
    >
      {page.background && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.background}
          alt="bg"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {page.fields.map((f) => (
        <DraggableField key={f.id} fieldId={f.id} />
      ))}
    </div>
  );
}

function DraggableField({ fieldId }: { fieldId: string }) {
  const { template, selectedPageId, updateField, selectField } =
    usePdfBuilder();
  const page =
    template.pages.find((p) => p.id === selectedPageId) ?? template.pages[0];
  const field = page.fields.find((f) => f.id === fieldId)!;
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [resizing, setResizing] = React.useState<null | "se">(null);
  const [editing, setEditing] = React.useState(false);
  const sigCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingRef = React.useRef(false);
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle === "se") {
      setResizing("se");
    } else {
      setDragging(true);
    }
    selectField(fieldId);
  };
  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
    selectField(fieldId);
  };
  const onClick = (e: React.MouseEvent) => {
    // Toggle checkbox when not dragging/resizing
    if (!dragging && !resizing && field.type === "checkbox") {
      updateField(fieldId, { checked: !(field as any).checked } as any);
    }
  };
  const start = React.useRef({
    x: 0,
    y: 0,
    w: field.width,
    h: field.height,
    fx: field.x,
    fy: field.y,
  });
  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging && !resizing) return;
      const dx = e.movementX;
      const dy = e.movementY;
      if (dragging) {
        start.current.fx += dx;
        start.current.fy += dy;
        updateField(fieldId, { x: start.current.fx, y: start.current.fy });
      } else if (resizing === "se") {
        start.current.w += dx;
        start.current.h += dy;
        updateField(fieldId, {
          width: Math.max(8, start.current.w),
          height: Math.max(8, start.current.h),
        });
      }
    };
    const onUp = () => {
      setDragging(false);
      setResizing(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, fieldId, updateField]);
  // Signature pad handlers
  const startSig = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    drawingRef.current = true;
    canvas.getContext("2d")!.beginPath();
    const rect = canvas.getBoundingClientRect();
    canvas
      .getContext("2d")!
      .moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  const moveSig = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas || !drawingRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  const endSig = () => {
    drawingRef.current = false;
  };
  const saveSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    try {
      const data = canvas.toDataURL("image/png");
      updateField(fieldId, { src: data } as any);
    } catch {}
    setEditing(false);
  };
  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      className={cn(
        "absolute border border-dashed border-primary/60 bg-primary/5 select-none",
        dragging && "cursor-grabbing"
      )}
      style={{
        left: field.x,
        top: field.y,
        width: field.width,
        height: field.height,
      }}
    >
      {/* In-canvas content preview */}
      {field.type === "text" && (
        <div
          className="w-full h-full px-1 py-0.5 overflow-hidden"
          style={{
            fontFamily: field.style?.fontFamily,
            fontSize: field.style?.fontSize ?? 12,
            fontWeight: field.style?.fontWeight as any,
            color: field.style?.color ?? "#000",
            textAlign: field.style?.align as any,
            fontStyle: field.style?.italic ? "italic" : undefined,
            textDecoration: field.style?.underline ? "underline" : undefined,
            opacity: field.opacity ?? 1,
          }}
        >
          {(field as any).value ?? ""}
        </div>
      )}
      {field.type === "date" && (
        <div
          className="w-full h-full px-1 py-0.5 overflow-hidden"
          style={{
            fontFamily: field.style?.fontFamily,
            fontSize: field.style?.fontSize ?? 12,
            fontWeight: field.style?.fontWeight as any,
            color: field.style?.color ?? "#000",
            textAlign: field.style?.align as any,
            fontStyle: field.style?.italic ? "italic" : undefined,
            textDecoration: field.style?.underline ? "underline" : undefined,
            opacity: field.opacity ?? 1,
          }}
        >
          {(field as any).value ?? ""}
        </div>
      )}
      {field.type === "checkbox" && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="size-3 border border-foreground rounded-[2px] flex items-center justify-center">
            {(field as any).checked ? (
              <div className="size-2 bg-foreground" />
            ) : null}
          </div>
        </div>
      )}
      {field.type === "image" && (field as any).src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(field as any).src}
          alt="img"
          className="w-full h-full object-contain pointer-events-none"
        />
      )}
      {field.type === "signature" && (field as any).src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={(field as any).src}
          alt="sig"
          className="w-full h-full object-contain pointer-events-none"
        />
      )}
      {field.type === "qr" && <QrPreview value={(field as any).value ?? ""} />}
      {field.type === "barcode" && (
        <BarcodePreview value={(field as any).value ?? ""} />
      )}
      {/* Inline editors overlay */}
      {editing && (
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm p-1 flex items-center justify-center gap-2"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(field.type === "text" ||
            field.type === "date" ||
            field.type === "qr" ||
            field.type === "barcode") && (
            <input
              className="w-full h-7 rounded border px-2 text-sm"
              autoFocus
              placeholder={field.type === "date" ? "YYYY-MM-DD" : "Value"}
              defaultValue={(field as any).value ?? ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateField(fieldId, {
                    value: (e.target as HTMLInputElement).value,
                  } as any);
                  setEditing(false);
                } else if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
              onBlur={(e) => {
                updateField(fieldId, { value: e.target.value } as any);
                setEditing(false);
              }}
            />
          )}
          {field.type === "image" && (
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) {
                  setEditing(false);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  updateField(fieldId, { src: String(reader.result) } as any);
                  setEditing(false);
                };
                reader.readAsDataURL(f);
              }}
            />
          )}
          {field.type === "signature" && (
            <div className="flex flex-col items-center gap-2">
              <canvas
                ref={sigCanvasRef}
                width={Math.max(150, field.width - 8)}
                height={Math.max(60, field.height - 8)}
                className="bg-white border rounded"
                onPointerDown={startSig}
                onPointerMove={moveSig}
                onPointerUp={endSig}
                onPointerLeave={endSig}
              />
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-xs border rounded"
                  onClick={clearSignature}
                >
                  Clear
                </button>
                <button
                  className="px-2 py-1 text-xs border rounded bg-primary text-primary-foreground"
                  onClick={saveSignature}
                >
                  Save
                </button>
                <button
                  className="px-2 py-1 text-xs border rounded"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        className="absolute -bottom-1.5 -right-1.5 size-3 bg-primary rounded-sm cursor-se-resize"
        data-handle="se"
      />
    </div>
  );
}

function QrPreview({ value }: { value: string }) {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = await generateQrDataUrl(value || "");
        if (mounted) setSrc(url);
      } catch {
        if (mounted) setSrc(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [value]);
  if (!src)
    return (
      <div className="w-full h-full text-[10px] text-center grid place-items-center p-1">
        <span>QR</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="qr" className="w-full h-full object-contain" />;
}

function BarcodePreview({ value }: { value: string }) {
  const [src, setSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const url = await generateBarcodeDataUrl(value || "");
        if (mounted) setSrc(url);
      } catch {
        if (mounted) setSrc(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [value]);
  if (!src)
    return (
      <div className="w-full h-full text-[10px] text-center grid place-items-center p-1">
        <span>BARCODE</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="barcode" className="w-full h-full object-contain" />;
}
