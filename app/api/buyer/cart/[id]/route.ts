import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItemId = parseInt(params.id, 10);
    const { quantity } = await request.json();
    const qtyVal = parseInt(quantity, 10);

    if (isNaN(qtyVal) || qtyVal < 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!item || item.cartId !== cart.id) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 403 });
    }

    if (qtyVal === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });
    } else {
      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: qtyVal }
      });
    }

    // Recalculate storeId constraints
    const remainingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id }
    });

    if (remainingItems.length === 0) {
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

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const userIdCookie = (await cookies()).get("userId");
    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = parseInt(userIdCookie.value, 10);

    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItemId = parseInt(params.id, 10);

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId }
    });

    if (!item || item.cartId !== cart.id) {
      return NextResponse.json({ error: "Item not found or unauthorized" }, { status: 403 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    const remainingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id }
    });

    if (remainingItems.length === 0) {
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
