"use client";
import React from "react";
import { usePdfBuilder } from "../hooks/use-pdf-builder";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox as UICheckbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";

export default function RightPanel() {
  const {
    template,
    selectedPageId,
    selectedFieldId,
    updateField,
    data,
    setData,
  } = usePdfBuilder();
  const page =
    template.pages.find((p) => p.id === selectedPageId) ?? template.pages[0];
  const field = page?.fields.find((f) => f.id === selectedFieldId);
  const [text, setText] = React.useState<string>(JSON.stringify(data, null, 2));
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Selected Field</h4>
        {!field ? (
          <p className="text-xs text-muted-foreground">
            Select a field on the canvas to edit its properties.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="grid gap-1.5">
              <Label htmlFor="fld-name" className="text-xs">
                Name
              </Label>
              <Input
                id="fld-name"
                value={field.name ?? ""}
                onChange={(e) =>
                  updateField(field.id, { name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fld-binding" className="text-xs">
                Binding Path (e.g. user.firstName)
              </Label>
              <Input
                id="fld-binding"
                placeholder="data.path.here"
                value={field.binding ?? ""}
                onChange={(e) =>
                  updateField(field.id, { binding: e.target.value })
                }
              />
            </div>
            {field.type === "text" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="fld-value" className="text-xs">
                    Text Value (for preview)
                  </Label>
                  <Input
                    id="fld-value"
                    value={(field as any).value ?? ""}
                    onChange={(e) =>
                      updateField(field.id, { value: e.target.value } as any)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    min={6}
                    max={96}
                    value={field.style?.fontSize ?? 12}
                    onChange={(e) =>
                      updateField(field.id, {
                        style: {
                          ...field.style,
                          fontSize: Number(e.target.value),
                        },
                      } as any)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={field.style?.color ?? "#000000"}
                    onChange={(e) =>
                      updateField(field.id, {
                        style: { ...field.style, color: e.target.value },
                      } as any)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Toggle
                    pressed={(field.style?.fontWeight ?? "") === "bold"}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: {
                          ...field.style,
                          fontWeight: v ? "bold" : undefined,
                        },
                      } as any)
                    }
                  >
                    Bold
                  </Toggle>
                  <Toggle
                    pressed={Boolean(field.style?.italic)}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, italic: v },
                      } as any)
                    }
                  >
                    Italic
                  </Toggle>
                  <Toggle
                    pressed={Boolean(field.style?.underline)}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, underline: v },
                      } as any)
                    }
                  >
                    Underline
                  </Toggle>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Align</Label>
                  <Select
                    value={field.style?.align ?? "left"}
                    onValueChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, align: v as any },
                      } as any)
                    }
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="Align" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {field.type === "date" && (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="fld-date" className="text-xs">
                    Date Value
                  </Label>
                  <Input
                    id="fld-date"
                    type="date"
                    value={(field as any).value ?? ""}
                    onChange={(e) =>
                      updateField(field.id, { value: e.target.value } as any)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    min={6}
                    max={96}
                    value={field.style?.fontSize ?? 12}
                    onChange={(e) =>
                      updateField(field.id, {
                        style: {
                          ...field.style,
                          fontSize: Number(e.target.value),
                        },
                      } as any)
                    }
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={field.style?.color ?? "#000000"}
                    onChange={(e) =>
                      updateField(field.id, {
                        style: { ...field.style, color: e.target.value },
                      } as any)
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Toggle
                    pressed={(field.style?.fontWeight ?? "") === "bold"}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: {
                          ...field.style,
                          fontWeight: v ? "bold" : undefined,
                        },
                      } as any)
                    }
                  >
                    Bold
                  </Toggle>
                  <Toggle
                    pressed={Boolean(field.style?.italic)}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, italic: v },
                      } as any)
                    }
                  >
                    Italic
                  </Toggle>
                  <Toggle
                    pressed={Boolean(field.style?.underline)}
                    onPressedChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, underline: v },
                      } as any)
                    }
                  >
                    Underline
                  </Toggle>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Align</Label>
                  <Select
                    value={field.style?.align ?? "left"}
                    onValueChange={(v) =>
                      updateField(field.id, {
                        style: { ...field.style, align: v as any },
                      } as any)
                    }
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="Align" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            {field.type === "checkbox" && (
              <div className="flex items-center gap-2">
                <UICheckbox
                  id="fld-checked"
                  checked={Boolean((field as any).checked)}
                  onCheckedChange={(v) =>
                    updateField(field.id, { checked: Boolean(v) } as any)
                  }
                />
                <Label htmlFor="fld-checked" className="text-xs">
                  Checked
                </Label>
              </div>
            )}
            {field.type === "image" && (
              <div className="grid gap-1.5">
                <Label className="text-xs">Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () =>
                      updateField(field.id, {
                        src: String(reader.result),
                      } as any);
                    reader.readAsDataURL(f);
                  }}
                />
              </div>
            )}
            {field.type === "signature" && (
              <p className="text-xs text-muted-foreground">
                Double‑click the signature box on the canvas to draw and save.
              </p>
            )}
            {field.type === "qr" && (
              <div className="grid gap-1.5">
                <Label htmlFor="fld-qr" className="text-xs">
                  QR Value
                </Label>
                <Input
                  id="fld-qr"
                  value={(field as any).value ?? ""}
                  onChange={(e) =>
                    updateField(field.id, { value: e.target.value } as any)
                  }
                />
              </div>
            )}
            {field.type === "barcode" && (
              <div className="grid gap-1.5">
                <Label htmlFor="fld-barcode" className="text-xs">
                  Barcode Value
                </Label>
                <Input
                  id="fld-barcode"
                  value={(field as any).value ?? ""}
                  onChange={(e) =>
                    updateField(field.id, { value: e.target.value } as any)
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>
      <label className="text-xs">
        Bindings JSON (applies via Binding Path)
      </label>
      <textarea
        className="w-full h-48 border rounded p-2 font-mono text-xs"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          try {
            const v = JSON.parse(text);
            setData(v);
          } catch {}
        }}
      />
      <div className="text-xs text-muted-foreground">
        Paste JSON to preview bindings. Set a field’s Binding Path to pull a
        value from this JSON. Or set a direct value above for quick preview.
      </div>
    </div>
  );
}
