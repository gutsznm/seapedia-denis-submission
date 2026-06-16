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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      where: {
        storeId: user.store.id,
        // Refunded/returned orders are not counted as seller income
        status: { notIn: ["Dikembalikan"] }
      }
    });

    // Income calculation formula: Sum of subtotal minus discount of all non-refunded orders
    const totalIncome = orders.reduce((sum, o) => {
      // Calculate net order revenue
      const netAmount = Math.max(0, o.subtotal - o.discountAmount);
      return sum + netAmount;
    }, 0);

    const totalOrdersCount = orders.length;

    return NextResponse.json({
      summary: {
        totalIncome,
        totalOrdersCount
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
