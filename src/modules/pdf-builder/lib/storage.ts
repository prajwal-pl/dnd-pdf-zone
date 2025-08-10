import { Template } from "../types/schema";
import {
  listTemplatesAction,
  loadTemplateAction,
  saveTemplateAction,
} from "@/app/actions/templateAction";

const KEY = "pdf-builder:templates";

export async function listTemplates(): Promise<{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  fields: number;
}[]> {
  try {
    return await listTemplatesAction();
  } catch {}
  // fallback to localStorage
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Template[];
    return arr.map((t) => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      pages: t.pages.length,
      fields: t.pages.reduce((acc, p) => acc + p.fields.length, 0),
    }));
  } catch {
    return [];
  }
}

export async function saveTemplate(t: Template) {
  try {
    await saveTemplateAction(t);
  } catch {}
  // also mirror in localStorage for offline quick access
  if (typeof localStorage !== "undefined") {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Template[]) : [];
    const idx = arr.findIndex((x) => x.id === t.id);
    if (idx >= 0) arr[idx] = t;
    else arr.push(t);
    localStorage.setItem(KEY, JSON.stringify(arr));
  }
}

export async function loadTemplate(id: string): Promise<Template | null> {
  try {
    return await loadTemplateAction(id);
  } catch {}
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  if (!raw) return null;
  try {
    const arr = JSON.parse(raw) as Template[];
    return arr.find((t) => t.id === id) ?? null;
  } catch {
    return null;
  }
}
