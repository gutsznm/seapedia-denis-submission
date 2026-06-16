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
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: { storeId: user.store.id },
      orderBy: { id: "desc" }
    });

    return NextResponse.json({ products });
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
      include: { store: true }
    });

    if (!user || user.activeRole !== "SELLER" || !user.store) {
      return NextResponse.json({ error: "Store not found or unauthorized" }, { status: 403 });
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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: priceVal,
        stock: stockVal,
        image,
        storeId: user.store.id
      }
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
