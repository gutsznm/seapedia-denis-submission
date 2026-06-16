import { prisma } from "../lib/prisma";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const roles = ["ADMIN", "SELLER", "BUYER", "DRIVER"];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r }
    });
  }
  console.log("Roles upserted successfully");

  const adminPassword = hashPassword("password123");
  const userPassword = hashPassword("password123");

  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const sellerRole = await prisma.role.findUnique({ where: { name: "SELLER" } });
  const buyerRole = await prisma.role.findUnique({ where: { name: "BUYER" } });
  const driverRole = await prisma.role.findUnique({ where: { name: "DRIVER" } });

  if (adminRole && sellerRole && buyerRole && driverRole) {
    // Admin user
    await prisma.user.upsert({
      where: { username: "admin" },
      update: {
        password: adminPassword,
        roles: {
          set: [{ id: adminRole.id }]
        }
      },
      create: {
        username: "admin",
        email: "admin@seapedia.com",
        password: adminPassword,
        roles: {
          connect: [{ id: adminRole.id }]
        }
      }
    });

    // Multi-role user
    await prisma.user.upsert({
      where: { username: "user" },
      update: {
        password: userPassword,
        roles: {
          set: [
            { id: sellerRole.id },
            { id: buyerRole.id },
            { id: driverRole.id }
          ]
        }
      },
      create: {
        username: "user",
        email: "user@seapedia.com",
        password: userPassword,
        roles: {
          connect: [
            { id: sellerRole.id },
            { id: buyerRole.id },
            { id: driverRole.id }
          ]
        }
      }
    });
    console.log("Seed users successfully created");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
