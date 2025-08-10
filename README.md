# Dynamic PDF Builder

Web-based PDF editor to design print-ready PDFs by placing fields on top of page images with pixel-accurate WYSIWYG, live preview, data-binding, and database-backed templates.

Video demo: https://vimeo.com/1108817563?share=copy

## Objective

Create a web-based Dynamic PDF Builder where a user can upload images, place input fields over them using a drag-and-drop editor, and export the final document as a print-ready PDF. Bonus points for implementing data-binding from JSON to auto-fill fields.

## Core Requirements Coverage

- Upload one or more images (PNG/JPG) as PDF page backgrounds.
- Place draggable and resizable input fields: text, date, checkbox, signature, image, and QR/barcode.
- Support multiple pages with a thumbnail navigator and page reordering.
- Style controls for font, size, color, alignment, rotation, and opacity.
- Exact WYSIWYG positioning between editor preview and PDF export.
- Export as selectable-text vector PDF (not rasterized).
- Option to export with form fields editable (PDF AcroForms) or flattened.
- Save, load, and duplicate templates; allow JSON export of layout.
- Live PDF preview panel and print-ready export.
- Field validations (required, regex, min/max) and visual error indicators.
- Modular, clean code architecture with clear separation of concerns.

## Architecture Overview

- UI: Next.js App Router, React, Tailwind + shadcn/ui components.
- Editor modules:
  - Canvas: draggable/resizable field boxes, inline editing, signature drawing.
  - Left panel: pages list and reordering; saved templates list.
  - Right panel: field properties, styling, bindings JSON editor; date via calendar.
  - Preview: live PDF preview rendered via export pipeline to a Blob URL.
- Export: pdf-lib renders vector text, images, checkboxes, QR/barcodes; optional AcroForms with flattening.
- Persistence: Prisma + PostgreSQL for Template storage. Server Actions for list/save/load. Local fallback mirrors to localStorage when needed.
- Uploads: UploadThing for image uploads (image field and optional backgrounds), storing returned public URLs in the template payload.

## Data Model (Prisma)

- Template: id, name, payload (full template JSON), createdAt, updatedAt
- Project: id, name, templateId, dataBindings, createdAt, updatedAt

The template payload includes pages, fields, and metadata; see `src/modules/pdf-builder/types/schema.ts` for Zod schemas.

## Key Features

- Drag-and-drop fields with exact coordinates; WYSIWYG matches export.
- Fields: text, date, checkbox, signature (drawn), image (uploaded URL), QR, barcode.
- Styling: font size, weight, italic, underline, alignment, color, opacity.
- Data-binding: paste JSON and set binding paths to auto-fill fields.
- Export: selectable text; optional AcroForms; QR/barcode generated and embedded.
- Templates: save/load via server actions; JSON import/export.
- Keyboard shortcuts: Delete/Backspace removes the selected field.

## Project Structure

- `src/modules/pdf-builder/components` – Canvas, LeftPanel, RightPanel, Preview, EditorShell
- `src/modules/pdf-builder/lib` – export-pdf, codes (QR/barcode), storage, binding, id
- `src/modules/pdf-builder/types` – Zod schemas for fields/pages/templates
- `src/app/actions` – server actions for templates
- `src/app/api/uploadthing` – UploadThing router
- `src/components/ui` – shadcn/ui components used in the editor

## Setup

1. Install dependencies.
2. Configure a PostgreSQL database and set `DATABASE_URL` in `.env`.
3. Run Prisma migrations.
4. Ensure UploadThing is configured (uses the provided file router).
5. Start the dev server.

Commands:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Build and run:

```bash
npm run build
npm start
```

## Usage

1. Add pages and optionally set image backgrounds.
2. Insert fields (text, date, checkbox, signature, image, QR/barcode) and drag to position.
3. Select a field to edit properties and styling in the right panel.
4. For images, upload via UploadThing; the field stores a public image URL.
5. Paste JSON in the bindings section and set binding paths on fields to auto-fill.
6. Use Export PDF with the AcroForm toggle to choose editable vs flattened output.
7. Save the template to persist to the database; list and reload templates from the left panel.
8. Export/import JSON for portability.

## Implementation Details

- pdf-lib is used to draw vector text, images, checkboxes, and to embed QR/barcodes.
- QR is generated via `qrcode`; barcodes via `jsbarcode`, both converted to data URLs for embedding.
- Export supports both data URLs and remote image URLs by fetching bytes at render time.
- Server Actions (`src/app/actions/templateAction.ts`) implement list, load, save, and a form-post based `saveTemplateFromForm`.
- The Saved Templates list shows name, created date, and basic stats (pages/fields).
- Date fields use a calendar component with month/year dropdown and styling parity with text.

## Validation & Error States

- Fields include validation metadata in the template schema (required, regex, min, max).
- Visual indicators can be added to the canvas/preview to reflect invalid bindings or missing required values.

## Testing & Quality

- Type safety via TypeScript and Zod schema typing for template structures.
- Linting via ESLint; styles with Tailwind.
- Build validation via `npm run build`.

## Configuration

- Environment:
  - `DATABASE_URL` – PostgreSQL connection string.
  - UploadThing keys if using a custom setup; current router is configured in `src/app/api/uploadthing`.

## Limitations / Future Work

- More barcode formats and styling controls.
- Enhanced validation UI and error summaries.
- Multi-user auth and ownership for templates.

## Video URL

Demo video: https://vimeo.com/1108817563?share=copy
