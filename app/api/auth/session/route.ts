import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const userIdCookie = (await cookies()).get("userId");

    if (!userIdCookie || !userIdCookie.value) {
      return NextResponse.json({ user: null });
    }

    const userId = parseInt(userIdCookie.value, 10);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: true,
        wallet: true,
        store: true
      }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map(r => r.name),
        activeRole: user.activeRole,
        walletBalance: user.wallet?.balance || 0,
        hasStore: !!user.store
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
