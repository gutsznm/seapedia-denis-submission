import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);
    const store = await prisma.store.findUnique({
      where: { userId }
    });
    return NextResponse.json({ store });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true }
    });

    if (!user || user.activeRole !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized role access" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }

    const existingStore = await prisma.store.findUnique({
      where: { name: name.trim() }
    });

    if (existingStore) {
      return NextResponse.json({ error: "Store name already taken" }, { status: 400 });
    }

    const store = await prisma.store.upsert({
      where: { userId },
      update: { name: name.trim() },
      create: { name: name.trim(), userId }
    });

    return NextResponse.json({ store });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
