"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { listTemplates, loadTemplate } from "../lib/storage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, FileText, Layers } from "lucide-react";

export default function LeftPanel() {
  const { template, selectPage, selectedPageId, setBackground, reorderPages } =
    usePdfBuilder();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Pages</h3>
      </div>
      <div className="space-y-1.5">
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
            <div className="flex items-center gap-2 mt-1.5">
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
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1">Saved Templates</h4>
        <TemplatesList
          onLoadTemplate={async (id) => {
            const t = await loadTemplate(id);
            if (t) {
              window.dispatchEvent(
                new CustomEvent("load-template", { detail: t })
              );
            }
          }}
        />
      </div>
    </div>
  );
}

function TemplatesList({
  onLoadTemplate,
}: {
  onLoadTemplate: (id: string) => void | Promise<void>;
}) {
  const [rows, setRows] = React.useState<
    {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      pages: number;
      fields: number;
    }[]
  >([]);
  React.useEffect(() => {
    (async () => {
      const list = await listTemplates();
      setRows(list);
    })();
  }, []);
  if (!rows.length)
    return (
      <div className="text-xs text-muted-foreground">
        No templates saved yet.
      </div>
    );
  return (
    <div className="grid grid-cols-1 gap-1">
      {rows.map((r) => (
        <Card key={r.id} className="py-2">
          <CardHeader className="py-0 gap-0.5 px-3">
            <CardTitle className="text-sm leading-tight line-clamp-1">
              {r.name}
            </CardTitle>
            <CardDescription className="text-[11px] leading-tight">
              <span className="inline-flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />{" "}
                {formatDateTime(r.createdAt)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="py-1 px-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3 w-3" /> {r.pages} pages
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" /> {r.fields} fields
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-3">
            <Button
              size="sm"
              className="h-6 text-[11px]"
              onClick={() => onLoadTemplate(r.id)}
            >
              Load
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}
