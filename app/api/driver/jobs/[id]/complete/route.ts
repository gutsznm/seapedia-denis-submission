import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.activeRole !== "DRIVER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery || delivery.driverId !== userId) {
      return NextResponse.json({ error: "Delivery not found or not assigned to you" }, { status: 403 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "Sedang Dikirim") {
      return NextResponse.json({ error: "Order is not in transit" }, { status: 400 });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { orderId },
        data: { status: "Pesanan Selesai" }
      });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: "Pesanan Selesai",
          statusHistory: {
            create: { status: "Pesanan Selesai" }
          }
        }
      });
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
