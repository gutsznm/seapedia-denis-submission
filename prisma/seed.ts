import { prisma } from "../lib/prisma";

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
  const dbRoles = await prisma.role.findMany();
  console.log("DB Roles:", dbRoles);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
