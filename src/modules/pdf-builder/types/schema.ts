import { z } from "zod";

export const FieldType = z.enum([
  "text",
  "date",
  "checkbox",
  "signature",
  "image",
  "qr",
  "barcode",
]);
export type FieldType = z.infer<typeof FieldType>;

export const CommonFieldSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  type: FieldType,
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(0),
  height: z.number().min(0),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  name: z.string().min(1).default("field"),
  required: z.boolean().default(false),
  binding: z.string().optional(), // JSON pointer / path
  validation: z
    .object({
      regex: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  style: z
    .object({
      fontFamily: z.string().optional(),
      fontSize: z.number().optional(),
      fontWeight: z.string().optional(),
      color: z.string().optional(),
      align: z.enum(["left", "center", "right"]).optional(),
      italic: z.boolean().optional(),
      underline: z.boolean().optional(),
    })
    .optional(),
});

export const TextFieldSchema = CommonFieldSchema.extend({
  type: z.literal("text"),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  multiline: z.boolean().default(false),
});

export const DateFieldSchema = CommonFieldSchema.extend({
  type: z.literal("date"),
  value: z.string().optional(), // ISO date
  format: z.string().default("yyyy-MM-dd"),
});

export const CheckboxFieldSchema = CommonFieldSchema.extend({
  type: z.literal("checkbox"),
  checked: z.boolean().optional(),
});

export const SignatureFieldSchema = CommonFieldSchema.extend({
  type: z.literal("signature"),
  value: z.string().optional(), // data URL
});

export const ImageFieldSchema = CommonFieldSchema.extend({
  type: z.literal("image"),
  src: z.string().optional(), // data URL
  objectFit: z.enum(["contain", "cover", "fill"]).default("contain"),
});

export const QRFieldSchema = CommonFieldSchema.extend({
  type: z.literal("qr"),
  value: z.string().optional(),
});

export const BarcodeFieldSchema = CommonFieldSchema.extend({
  type: z.literal("barcode"),
  value: z.string().optional(),
  format: z.enum(["code128", "code39", "ean13"]).default("code128"),
});

export const AnyFieldSchema = z.discriminatedUnion("type", [
  TextFieldSchema,
  DateFieldSchema,
  CheckboxFieldSchema,
  SignatureFieldSchema,
  ImageFieldSchema,
  QRFieldSchema,
  BarcodeFieldSchema,
]);
export type AnyField = z.infer<typeof AnyFieldSchema>;

export const PageSchema = z.object({
  id: z.string(),
  background: z.string().optional(), // data URL for background image
  width: z.number().min(1),
  height: z.number().min(1),
  fields: z.array(AnyFieldSchema),
});
export type Page = z.infer<typeof PageSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  pages: z.array(PageSchema),
});
export type Template = z.infer<typeof TemplateSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  template: TemplateSchema,
  dataBindings: z.record(z.string(), z.unknown()).optional(),
});
export type Project = z.infer<typeof ProjectSchema>;
