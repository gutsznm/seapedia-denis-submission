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
      include: {
        wallet: {
          include: {
            transactions: { orderBy: { createdAt: "desc" } }
          }
        }
      }
    });

    if (!user || user.activeRole !== "BUYER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const wallet = user.wallet || await prisma.wallet.create({
      data: { userId, balance: 0 },
      include: { transactions: true }
    });

    return NextResponse.json({ wallet });
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

    const { amount } = await request.json();
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    const wallet = user.wallet || await prisma.wallet.create({
      data: { userId, balance: 0 }
    });

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: amountVal },
        transactions: {
          create: {
            amount: amountVal,
            type: "TOPUP"
          }
        }
      },
      include: {
        transactions: { orderBy: { createdAt: "desc" } }
      }
    });

    return NextResponse.json({ wallet: updatedWallet });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
