import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { expiryDate: "asc" }
    });
    return NextResponse.json({ vouchers });
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

    const { code, discount, expiryDate, maxUsage } = await request.json();

    if (!code || discount === undefined || !expiryDate || maxUsage === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const discountVal = parseFloat(discount);
    const maxUsageVal = parseInt(maxUsage, 10);

    if (isNaN(discountVal) || discountVal <= 0 || isNaN(maxUsageVal) || maxUsageVal <= 0) {
      return NextResponse.json({ error: "Invalid discount or maxUsage values" }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.trim().toUpperCase(),
        discount: discountVal,
        expiryDate: new Date(expiryDate),
        maxUsage: maxUsageVal,
        remainingUsage: maxUsageVal
      }
    });

    return NextResponse.json({ voucher }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
