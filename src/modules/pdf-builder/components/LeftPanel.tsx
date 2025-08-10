"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listTemplates, loadTemplate } from "../lib/storage";

export default function LeftPanel() {
  const { template, selectPage, selectedPageId, setBackground, reorderPages } =
    usePdfBuilder();
  const onUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    pageId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await toDataURL(file);
    setBackground(pageId, url);
    e.currentTarget.value = "";
  };
  return (
  <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Pages</h3>
      </div>
      <div className="space-y-2">
        {template.pages.map((p, idx) => (
          <div
            key={p.id}
            className={cn(
              "border rounded p-2 text-left text-xs",
              selectedPageId === p.id && "ring-2 ring-primary"
            )}
          >
            <button
              className="w-full text-left"
              onClick={() => selectPage(p.id)}
            >
              <div className="font-medium">Page {idx + 1}</div>
              <div className="text-muted-foreground">
                {Math.round(p.width)} × {Math.round(p.height)}
              </div>
            </button>
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs inline-block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e, p.id)}
                />
                <span className="underline cursor-pointer">Upload BG</span>
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => idx > 0 && reorderPages(idx, idx - 1)}
              >
                ↑
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  idx < template.pages.length - 1 && reorderPages(idx, idx + 1)
                }
              >
                ↓
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-1">Saved Templates</h4>
        <TemplatesList onLoadTemplate={async (id) => {
          const t = await loadTemplate(id);
          if (t) {
            window.dispatchEvent(new CustomEvent("load-template", { detail: t }));
          }
        }} />
      </div>
    </div>
  );
}

async function toDataURL(file: File) {
  const r = new FileReader();
  const p = new Promise<string>((resolve, reject) => {
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
  });
  r.readAsDataURL(file);
  return p;
}

function TemplatesList({ onLoadTemplate }: { onLoadTemplate: (id: string) => void | Promise<void> }) {
  const [rows, setRows] = React.useState<{ id: string; name: string }[]>([]);
  React.useEffect(() => {
    (async () => {
      const list = await listTemplates();
      setRows(list);
    })();
  }, []);
  if (!rows.length) return (
    <div className="text-xs text-muted-foreground">No templates saved yet.</div>
  );
  return (
    <div className="space-y-1">
      {rows.map((r) => (
        <button key={r.id} className="text-xs underline" onClick={() => onLoadTemplate(r.id)}>
          {r.name}
        </button>
      ))}
    </div>
  );
}
