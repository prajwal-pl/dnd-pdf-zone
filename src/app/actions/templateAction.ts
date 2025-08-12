"use server";

import { prisma } from "@/lib/prisma";
import { Template } from "@/modules/pdf-builder/types/schema";
import { revalidatePath } from "next/cache";

// List all saved templates with metadata for UI cards
export async function listTemplatesAction(): Promise<
  {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    fields: number;
  }[]
> {
  const rows = await prisma.template.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      payload: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => {
    const payload = row.payload as unknown as Template | undefined;
    const pagesArr = Array.isArray(payload?.pages) ? payload!.pages : [];
    const pages = pagesArr.length;
    const fields = pagesArr.reduce(
      (acc, p) => acc + (Array.isArray(p.fields) ? p.fields.length : 0),
      0
    );
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      pages,
      fields,
    };
  });
}

// Save or update a template
export async function saveTemplateAction(
  template: Template
): Promise<{ id: string }> {
  const row = await prisma.template.upsert({
    where: { id: String(template.id) },
    update: { name: String(template.name), payload: template },
    create: {
      id: String(template.id),
      name: String(template.name),
      payload: template,
    },
  });
  //  revalidate any paths that show template listings
  try {
    revalidatePath("/");
  } catch {}
  return { id: row.id };
}

// Server action to be used directly as a <form action={...}> from Client Components
export async function saveTemplateFromForm(formData: FormData) {
  "use server";
  try {
    const json = formData.get("template");
    if (typeof json !== "string")
      return { ok: false, error: "Missing template" } as const;
    const template = JSON.parse(json) as Template;
    const res = await saveTemplateAction(template);
    return { ok: true, id: res.id } as const;
  } catch (e) {
    return { ok: false, error: (e as Error).message } as const;
  }
}

// Load a single template by id
export async function loadTemplateAction(id: string): Promise<Template | null> {
  const row = await prisma.template.findUnique({ where: { id } });
  return (row?.payload as Template) ?? null;
}
