import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === testHash;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true }
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userRoles = user.roles.map((r) => r.name);
    // If only one non-admin role or is admin, auto select role. Otherwise, leave activeRole null to force select.
    let activeRole = user.activeRole;
    if (!activeRole) {
      const nonAdminRoles = userRoles.filter(r => r !== "ADMIN");
      if (userRoles.includes("ADMIN")) {
        activeRole = "ADMIN";
      } else if (nonAdminRoles.length === 1) {
        activeRole = nonAdminRoles[0];
      }
    }

    if (activeRole && activeRole !== user.activeRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { activeRole }
      });
    }

    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: userRoles,
      activeRole: activeRole || null
    });

    // Set cookie session
    response.cookies.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/"
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
