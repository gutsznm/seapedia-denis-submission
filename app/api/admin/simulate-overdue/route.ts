import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// SLA rules (days until overdue):
// Instant: 1 day
// Next Day: 2 days
// Regular: 5 days
const SLA: Record<string, number> = {
  Instant: 1,
  "Next Day": 2,
  Regular: 5
};

export async function POST() {
  try {
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.activeRole !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const now = new Date();
    const processed: number[] = [];

    // Find all in-progress orders (not yet completed/returned)
    const activeOrders = await prisma.order.findMany({
      where: {
        status: { in: ["Sedang Dikemas", "Menunggu Pengirim", "Sedang Dikirim"] }
      },
      include: {
        items: { include: { product: true } }
      }
    });

    for (const order of activeOrders) {
      const slaDays = SLA[order.deliveryMethod] ?? 5;
      const deadline = new Date(order.createdAt);
      deadline.setDate(deadline.getDate() + slaDays);

      if (now > deadline) {
        // Overdue - process return/refund
        await prisma.$transaction(async (tx) => {
          // 1. Update order to Dikembalikan
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "Dikembalikan",
              statusHistory: {
                create: { status: "Dikembalikan" }
              }
            }
          });

          // 2. Refund buyer wallet
          const buyerWallet = await tx.wallet.findUnique({
            where: { userId: order.buyerId }
          });

          if (buyerWallet) {
            await tx.wallet.update({
              where: { id: buyerWallet.id },
              data: {
                balance: { increment: order.totalAmount },
                transactions: {
                  create: {
                    amount: order.totalAmount,
                    type: "REFUND"
                  }
                }
              }
            });
          }

          // 3. Restore product stock
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } }
            });
          }

          // 4. Update delivery status if exists
          const delivery = await tx.delivery.findUnique({ where: { orderId: order.id } });
          if (delivery) {
            await tx.delivery.update({
              where: { orderId: order.id },
              data: { status: "Dikembalikan" }
            });
          }
        });

        processed.push(order.id);
      }
    }

    return NextResponse.json({
      message: `Overdue check complete. ${processed.length} order(s) returned/refunded.`,
      processedOrderIds: processed
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
