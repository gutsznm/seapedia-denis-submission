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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { activeRole: true } // dummy field access for runtime validation
    });

    if (!user || user.activeRole !== "BUYER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId }
    });

    return NextResponse.json({ addresses });
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
      where: { id: userId }
    });

    if (!user || user.activeRole !== "BUYER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { addressText } = await request.json();
    if (!addressText || addressText.trim().length === 0) {
      return NextResponse.json({ error: "Address text is required" }, { status: 400 });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        addressText: addressText.trim()
      }
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
