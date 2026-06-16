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

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { store: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ cart: cart || { userId, storeId: null, items: [] } });
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

    const { productId, quantity } = await request.json();
    const qtyVal = parseInt(quantity, 10);

    if (!productId || isNaN(qtyVal) || qtyVal <= 0) {
      return NextResponse.json({ error: "Invalid product or quantity" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId, 10) }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, storeId: product.storeId },
        include: { items: true }
      });
    }

    // Verify Single-Store Checkout Rule
    if (cart.storeId !== null && cart.storeId !== product.storeId && cart.items.length > 0) {
      return NextResponse.json({
        error: "conflict",
        message: "Keranjang Anda berisi produk dari toko lain. Kosongkan keranjang terlebih dahulu?"
      }, { status: 409 });
    }

    // Update storeId if empty
    if (cart.storeId !== product.storeId) {
      await prisma.cart.update({
        where: { id: cart.id },
        data: { storeId: product.storeId }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qtyVal }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: qtyVal
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { storeId: null }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
