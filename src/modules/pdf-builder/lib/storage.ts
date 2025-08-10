import { Template } from "../types/schema";

const KEY = "pdf-builder:templates";

export async function listTemplates(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch("/api/templates", { cache: "no-store" });
    if (res.ok) return (await res.json()) as { id: string; name: string }[];
  } catch {}
  // fallback to localStorage
  const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as Template[];
    return arr.map((t) => ({ id: t.id, name: t.name }));
  } catch {
    return [];
  }
}

export async function saveTemplate(t: Template) {
  try {
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: t }),
    });
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
    const res = await fetch(`/api/templates/${id}`, { cache: "no-store" });
    if (res.ok) return (await res.json()) as Template;
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
