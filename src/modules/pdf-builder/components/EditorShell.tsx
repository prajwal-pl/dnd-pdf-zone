"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";
import { exportTemplateToPdf } from "../lib/export-pdf";
import { applyBindings } from "../lib/binding";
import LeftPanel from "./LeftPanel";
import Preview from "./Preview";
import { saveTemplate } from "../lib/storage";
import { saveTemplateFromForm } from "@/app/actions/templateAction";
import { Switch } from "@/components/ui/switch";

export const EditorShell = () => {
  const { template, addPage, selectPage, selectedPageId } = usePdfBuilder();
  const activeId = selectedPageId ?? template.pages[0]?.id;
  const [editable, setEditable] = React.useState(false);
  return (
    <div className="grid grid-cols-[280px_1fr_320px] h-[calc(100dvh-4rem)] gap-2">
      <aside className="border-r p-2 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Pages</h3>
          <Button size="sm" onClick={() => addPage()}>
            Add
          </Button>
        </div>
        <LeftPanel />
      </aside>
      <main className="bg-muted/30 flex items-center justify-center">
        <Canvas />
      </main>
  <section className="border-l p-2 overflow-auto space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">Properties</h3>
            <label className="text-xs inline-flex items-center gap-2">
              <Switch checked={editable} onCheckedChange={setEditable} />
              <span>Editable (AcroForm)</span>
            </label>
          </div>
          <Button
            size="sm"
            onClick={async () => {
              const bound = applyBindings(template, {});
              const blob = await exportTemplateToPdf(bound, {
                acroform: editable,
                flatten: !editable,
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${bound.name}.pdf`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export PDF
          </Button>
        </div>
        <div className="flex gap-2">
          <form
            action={async (formData) => {
              const payload = JSON.stringify(template);
              formData.set("template", payload);
              const res = await saveTemplateFromForm(formData);
              if (!res?.ok) {
                console.error(res?.error || "Failed to save template");
              }
            }}
          >
            <input type="hidden" name="template" value={JSON.stringify(template)} readOnly />
            <Button size="sm" variant="outline" type="submit">Save Template</Button>
          </form>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const s = JSON.stringify(template, null, 2);
              const blob = new Blob([s], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${template.name}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export JSON
          </Button>
          <label className="text-xs inline-flex items-center gap-1 cursor-pointer underline">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  const t = JSON.parse(text); // naive hydrate
                  // For now, reload the page state via event
                  window.dispatchEvent(
                    new CustomEvent("load-template", { detail: t })
                  );
                } catch {}
              }}
            />
            Import JSON
          </label>
        </div>
        <RightPanel />
        <div>
          <h4 className="text-sm font-medium mb-1">Live PDF Preview</h4>
          <Preview />
        </div>
      </section>
    </div>
  );
};

export default EditorShell;
