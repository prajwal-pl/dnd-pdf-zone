import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.template.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const t = body?.template;
  if (!t || typeof t !== "object")
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  // Upsert by id
  const row = await prisma.template.upsert({
    where: { id: String(t.id) },
    update: { name: String(t.name), payload: t },
    create: { id: String(t.id), name: String(t.name), payload: t },
  });
  return NextResponse.json({ id: row.id });
}
