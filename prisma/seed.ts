import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("1f1femsk", 10);

    const user = await prisma.user.upsert({
        where: { email: "gkozyris@i4ria.com" },
        update: {
            password: hashedPassword,
            role: "ADMIN",
            name: "George Kozyris",
        },
        create: {
            email: "gkozyris@i4ria.com",
            password: hashedPassword,
            role: "ADMIN",
            name: "George Kozyris",
        },
    });

    console.log("✅ Admin user seeded:", user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
