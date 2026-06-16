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
      include: { store: true }
    });

    if (!user || user.activeRole !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Unauthorized store view" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { storeId: user.store.id },
      include: {
        items: {
          include: { product: true }
        },
        statusHistory: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
