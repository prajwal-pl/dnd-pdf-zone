import { Template, AnyField } from "../types/schema";

export function getByPath(obj: any, path?: string) {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : (acc as any)[key]), obj);
}

export function applyBindings(
  template: Template,
  data: Record<string, unknown>
) {
  const pages = template.pages.map((p) => ({
    ...p,
    fields: p.fields.map((f) => applyFieldBinding(f, data)),
  }));
  return { ...template, pages } as Template;
}

function applyFieldBinding(
  field: AnyField,
  data: Record<string, unknown>
): AnyField {
  if (!field.binding) return field;
  const val = getByPath(data, field.binding);
  switch (field.type) {
    case "text":
      return {
        ...field,
        value: typeof val === "string" ? val : undefined,
      } as AnyField;
    case "date":
      return {
        ...field,
        value: typeof val === "string" ? val : undefined,
      } as AnyField;
    case "checkbox":
      return { ...field, checked: Boolean(val) } as AnyField;
    case "image":
    case "signature":
      return {
        ...field,
        src: typeof val === "string" ? val : undefined,
      } as AnyField;
    case "qr":
    case "barcode":
      return {
        ...field,
        value: typeof val === "string" ? val : undefined,
      } as AnyField;
    default:
      return field;
  }
}
