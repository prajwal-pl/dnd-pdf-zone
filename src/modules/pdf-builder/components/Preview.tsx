"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { exportTemplateToPdf } from "../lib/export-pdf";
import { applyBindings } from "../lib/binding";

export default function Preview() {
  const { template, data } = usePdfBuilder();
  const [url, setUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const bound = applyBindings(template, data);
      const blob = await exportTemplateToPdf(bound, { flatten: true });
      const url = URL.createObjectURL(blob);
      if (!cancelled) setUrl(url);
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [template, data]);
  if (!url)
    return (
      <div className="text-xs text-muted-foreground">Generating preview…</div>
    );
  return <iframe src={url} className="w-full h-64 border" />;
}
