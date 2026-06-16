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

    if (!user || user.activeRole !== "DRIVER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const availableJobs = await prisma.order.findMany({
      where: { status: "Menunggu Pengirim" },
      include: {
        buyer: { select: { username: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ jobs: availableJobs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
