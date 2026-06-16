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
      where: { buyerId: userId },
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

export async function POST(request: Request) {
  try {
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });

    if (!user || user.activeRole !== "BUYER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { deliveryMethod, addressId, discountCode } = await request.json();

    if (!deliveryMethod || !addressId) {
      return NextResponse.json({ error: "Delivery method and address are required" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart || cart.items.length === 0 || cart.storeId === null) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock untuk ${item.product.name} tidak cukup` }, { status: 400 });
      }
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    // Calculate shipping fee depending on method
    let deliveryFee = 0;
    if (deliveryMethod === "Instant") {
      deliveryFee = 50000;
    } else if (deliveryMethod === "Next Day") {
      deliveryFee = 25000;
    } else if (deliveryMethod === "Regular") {
      deliveryFee = 10000;
    } else {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    // Voucher or Promo Discount Calculation (Simple setup first)
    let discountAmount = 0;
    if (discountCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: discountCode }
      });

      const promo = await prisma.promo.findUnique({
        where: { code: discountCode }
      });

      const now = new Date();

      if (voucher) {
        if (voucher.expiryDate > now && voucher.remainingUsage > 0) {
          discountAmount = Math.min(voucher.discount, subtotal);
          // decrement usage
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { remainingUsage: { decrement: 1 } }
          });
        }
      } else if (promo) {
        if (promo.expiryDate > now) {
          discountAmount = Math.min(promo.discount, subtotal);
        }
      }
    }

    // Calculation formula: ((Subtotal - Discount) + DeliveryFee) * 1.12 for PPN
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableSubtotal + deliveryFee) * 0.12;
    const totalAmount = taxableSubtotal + deliveryFee + taxAmount;

    // Check balance
    const balance = user.wallet?.balance || 0;
    if (balance < totalAmount) {
      return NextResponse.json({ error: "Saldo tidak mencukupi" }, { status: 400 });
    }

    // Deduct stock, charge wallet, write transaction, construct order transactionally
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct user wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: totalAmount },
          transactions: {
            create: {
              amount: -totalAmount,
              type: "PAYMENT"
            }
          }
        }
      });

      // 2. Reduce product stocks safely
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      // 3. Create the order & items
      const order = await tx.order.create({
        data: {
          buyerId: userId,
          storeId: cart.storeId!,
          subtotal,
          discountCode,
          discountAmount,
          deliveryFee,
          taxAmount,
          totalAmount,
          status: "Sedang Dikemas",
          deliveryMethod,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.discountPrice || item.product.price
            }))
          },
          statusHistory: {
            create: {
              status: "Sedang Dikemas"
            }
          }
        },
        include: {
          items: true,
          statusHistory: true
        }
      });

      // 4. Clear the buyer's cart items and store association
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { storeId: null }
      });

      return order;
    });

    return NextResponse.json({ order: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
