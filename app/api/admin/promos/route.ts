import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { expiryDate: "asc" }
    });
    return NextResponse.json({ promos });
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

    if (!user || user.activeRole !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { code, discount, expiryDate } = await request.json();

    if (!code || discount === undefined || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const discountVal = parseFloat(discount);

    if (isNaN(discountVal) || discountVal <= 0) {
      return NextResponse.json({ error: "Invalid discount value" }, { status: 400 });
    }

    const promo = await prisma.promo.create({
      data: {
        code: code.trim().toUpperCase(),
        discount: discountVal,
        expiryDate: new Date(expiryDate)
      }
    });

    return NextResponse.json({ promo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
