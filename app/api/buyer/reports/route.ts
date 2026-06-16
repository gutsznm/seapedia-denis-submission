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
      where: { id: userId }
    });

    if (!user || user.activeRole !== "BUYER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: userId }
    });

    const totalSpending = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === "Pesanan Selesai").length;

    return NextResponse.json({
      summary: {
        totalSpending,
        totalOrders,
        completedOrders
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
