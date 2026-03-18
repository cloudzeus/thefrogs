/**
 * Seed script: inserts the `secondBuilding` HomeSection row if it does not
 * already exist, placing it right after the `guesthouse` section.
 *
 * Run with:
 *   npx tsx src/scripts/seed-second-building.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the order of the guesthouse section so we can insert after it
  const guesthouse = await prisma.homeSection.findUnique({
    where: { key: "guesthouse" },
    select: { order: true },
  });

  const guesthouseOrder = guesthouse?.order ?? 3;

  // Shift every section that currently sits after guesthouse up by 1
  await prisma.homeSection.updateMany({
    where: { order: { gt: guesthouseOrder } },
    data: { order: { increment: 1 } },
  });

  // Upsert the secondBuilding section
  const result = await prisma.homeSection.upsert({
    where: { key: "secondBuilding" },
    update: {}, // don't overwrite if admin has customised it
    create: {
      key: "secondBuilding",
      order: guesthouseOrder + 1,
      published: true,
      image: null,
      labelEL: "ΔΕΥΤΕΡΟ ΚΤΗΡΙΟ • EST. 2022",
      labelEN: "SECOND BUILDING • EST. 2022",
      titleEL: "ΤΟ\nΠΑΡΑΡΤΗΜΑ",
      titleEN: "THE\nANNEX",
      subtitleEL: null,
      subtitleEN: null,
      bodyEL:
        "Μία πιο ήσυχη γωνιά, λίγα βήματα μακριά — δωμάτια με την ίδια φροντίδα και χαρακτήρα, ιδανικά για μεγαλύτερες διαμονές.",
      bodyEN:
        "A quieter corner just steps away — freshly designed rooms with the same care and character, perfect for longer stays.",
      ctaLabelEL: "Δείτε Δωμάτια",
      ctaLabelEN: "See Rooms",
      ctaUrl: "/rooms",
      cta2LabelEL: "Ελέγξτε Διαθεσιμότητα",
      cta2LabelEN: "Check Availability",
      cta2Url: "https://thefrogsguesthouse.reserve-online.net/",
      extras: {},
    },
  });

  console.log("✅  secondBuilding section seeded:", result.key, "order:", result.order);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
