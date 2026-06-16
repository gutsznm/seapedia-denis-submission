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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    });

    if (!user || user.activeRole !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const orderId = parseInt(params.id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.storeId !== user.store.id) {
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 403 });
    }

    if (order.status !== "Sedang Dikemas") {
      return NextResponse.json({ error: "Order status must be Sedang Dikemas to process" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "Menunggu Pengirim",
        statusHistory: {
          create: {
            status: "Menunggu Pengirim"
          }
        }
      },
      include: {
        statusHistory: true
      }
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
