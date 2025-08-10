"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { Button } from "@/components/ui/button";

export default function Toolbar() {
  const { selectedPageId, addField } = usePdfBuilder();
  const pid = selectedPageId;
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "text",
            x: 50,
            y: 50,
            width: 120,
            height: 24,
            rotation: 0,
            opacity: 1,
            name: "Text",
            required: false,
          })
        }
      >
        + Text
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "checkbox",
            x: 50,
            y: 90,
            width: 16,
            height: 16,
            rotation: 0,
            opacity: 1,
            name: "Check",
            required: false,
          })
        }
      >
        + Checkbox
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "date",
            x: 50,
            y: 130,
            width: 120,
            height: 24,
            rotation: 0,
            opacity: 1,
            name: "Date",
            required: false,
          })
        }
      >
        + Date
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "signature",
            x: 50,
            y: 170,
            width: 160,
            height: 60,
            rotation: 0,
            opacity: 1,
            name: "Signature",
            required: false,
          })
        }
      >
        + Signature
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "qr",
            x: 230,
            y: 50,
            width: 100,
            height: 100,
            rotation: 0,
            opacity: 1,
            name: "QR",
            required: false,
            value: "",
          } as any)
        }
      >
        + QR
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          pid &&
          addField(pid, {
            type: "barcode",
            x: 230,
            y: 170,
            width: 180,
            height: 60,
            rotation: 0,
            opacity: 1,
            name: "Barcode",
            required: false,
            value: "",
            format: "code128",
          } as any)
        }
      >
        + Barcode
      </Button>
    </div>
  );
}
