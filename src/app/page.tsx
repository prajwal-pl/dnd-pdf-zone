"use client";
import { PdfBuilderProvider } from "@/modules/pdf-builder/hooks/use-pdf-builder";
import EditorShell from "@/modules/pdf-builder/components/EditorShell";
import Toolbar from "@/modules/pdf-builder/components/Toolbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PdfBuilderProvider>
        <div className="h-16 border-b flex items-center justify-between px-4 gap-4">
          <div className="font-semibold">Dynamic PDF Builder</div>
          <Toolbar />
        </div>
        <EditorShell />
      </PdfBuilderProvider>
    </div>
  );
}
