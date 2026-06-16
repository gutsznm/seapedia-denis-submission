import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const { username, email, password, roles } = await request.json();

    if (!username || !email || !password || !roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Email regex validation (Level 7)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    // Fetch matching roles from DB
    const dbRoles = await prisma.role.findMany({
      where: {
        name: {
          in: roles
        }
      }
    });

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roles: {
          connect: dbRoles.map((role) => ({ id: role.id }))
        }
      },
      include: {
        roles: true
      }
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles.map((r) => r.name)
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
