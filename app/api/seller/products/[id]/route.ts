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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    });

    if (!user || user.activeRole !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.storeId !== user.store.id) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 });
    }

    const { name, description, price, stock, image } = await request.json();

    if (!name || !description || price === undefined || stock === undefined || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceVal = parseFloat(price);
    const stockVal = parseInt(stock, 10);

    if (isNaN(priceVal) || priceVal < 0 || isNaN(stockVal) || stockVal < 0) {
      return NextResponse.json({ error: "Invalid price or stock" }, { status: 400 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: priceVal,
        stock: stockVal,
        image
      }
    });

    return NextResponse.json({ product: updatedProduct });
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { store: true }
    });

    if (!user || user.activeRole !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || product.storeId !== user.store.id) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
