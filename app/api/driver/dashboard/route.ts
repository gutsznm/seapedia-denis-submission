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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.activeRole !== "DRIVER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const deliveries = await prisma.delivery.findMany({
      where: { driverId: userId },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            statusHistory: true
          }
        }
      },
      orderBy: { id: "desc" }
    });

    const active = deliveries.find((d) => d.status === "Sedang Dikirim");
    const history = deliveries.filter((d) => d.status !== "Sedang Dikirim");

    // Driver earns 10% of delivery fee
    const totalEarnings = deliveries
      .filter((d) => d.status === "Pesanan Selesai")
      .reduce((sum, d) => sum + d.order.deliveryFee * 0.1, 0);

    return NextResponse.json({ active, history, totalEarnings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
