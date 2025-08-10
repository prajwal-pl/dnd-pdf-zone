"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { AnyField, Page, Project, Template } from "../types/schema";
import { nanoid } from "../lib/id";

export type BuilderState = {
  template: Template;
  data: Record<string, unknown>;
  selectedFieldId?: string;
  selectedPageId?: string;
};

export type BuilderActions = {
  addPage: (size?: { width: number; height: number }) => void;
  removePage: (pageId: string) => void;
  reorderPages: (from: number, to: number) => void;
  setBackground: (pageId: string, dataUrl: string) => void;
  addField: (pageId: string, field: Omit<AnyField, "id" | "pageId">) => void;
  updateField: (fieldId: string, patch: Partial<AnyField>) => void;
  removeField: (fieldId: string) => void;
  selectField: (fieldId?: string) => void;
  selectPage: (pageId?: string) => void;
  setData: (next: Record<string, unknown>) => void;
  loadProject: (project: Project) => void;
};

const BuilderContext = createContext<(BuilderState & BuilderActions) | null>(
  null
);

export const usePdfBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("usePdfBuilder must be used within Provider");
  return ctx;
};

export const PdfBuilderProvider = ({
  children,
  initialTemplate,
}: {
  children: React.ReactNode;
  initialTemplate?: Template;
}) => {
  const [state, setState] = useState<BuilderState>(() => ({
    template:
      initialTemplate ??
      ({
        id: nanoid(),
        name: "Untitled",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: [
          {
            id: nanoid(),
            width: 595, // A4 portrait width in pt (approx)
            height: 842, // A4 portrait height in pt
            fields: [],
          },
        ],
      } as Template),
    data: {},
    selectedPageId: undefined,
    selectedFieldId: undefined,
  }));

  const actions = useMemo<BuilderActions>(
    () => ({
      addPage(size) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: [
              ...s.template.pages,
              {
                id: nanoid(),
                width: size?.width ?? 595,
                height: size?.height ?? 842,
                fields: [],
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      removePage(pageId) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: s.template.pages.filter((p) => p.id !== pageId),
            updatedAt: new Date().toISOString(),
          },
          selectedPageId:
            s.selectedPageId === pageId ? undefined : s.selectedPageId,
        }));
      },
      reorderPages(from, to) {
        setState((s) => {
          const pages = [...s.template.pages];
          const [moved] = pages.splice(from, 1);
          pages.splice(to, 0, moved);
          return {
            ...s,
            template: {
              ...s.template,
              pages,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },
      setBackground(pageId, dataUrl) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: s.template.pages.map((p) =>
              p.id === pageId ? { ...p, background: dataUrl } : p
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      addField(pageId, field) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: s.template.pages.map((p) =>
              p.id === pageId
                ? {
                    ...p,
                    fields: [
                      ...p.fields,
                      { ...field, id: nanoid(), pageId } as AnyField,
                    ],
                  }
                : p
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      updateField(fieldId, patch) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: s.template.pages.map((p) => ({
              ...p,
              fields: p.fields.map((f) =>
                f.id === fieldId ? ({ ...f, ...patch } as AnyField) : f
              ),
            })),
            updatedAt: new Date().toISOString(),
          },
        }));
      },
      removeField(fieldId) {
        setState((s) => ({
          ...s,
          template: {
            ...s.template,
            pages: s.template.pages.map((p) => ({
              ...p,
              fields: p.fields.filter((f) => f.id !== fieldId),
            })),
            updatedAt: new Date().toISOString(),
          },
          selectedFieldId:
            s.selectedFieldId === fieldId ? undefined : s.selectedFieldId,
        }));
      },
      selectField(fieldId) {
        setState((s) => ({ ...s, selectedFieldId: fieldId }));
      },
      selectPage(pageId) {
        setState((s) => ({ ...s, selectedPageId: pageId }));
      },
      setData(next) {
        setState((s) => ({ ...s, data: next }));
      },
      loadProject(project) {
        setState({
          template: project.template,
          data: project.dataBindings ?? {},
          selectedFieldId: undefined,
          selectedPageId: project.template.pages[0]?.id,
        });
      },
    }),
    []
  );

  const value = { ...state, ...actions };
  React.useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Project["template"]>;
      try {
        actions.loadProject({
          id: nanoid(),
          template: ce.detail as any,
          dataBindings: {},
        });
      } catch {}
    };
    window.addEventListener("load-template", handler as any);
    return () => window.removeEventListener("load-template", handler as any);
  }, [actions]);
  return (
    <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
  );
};
