import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STANDARD_AMENITIES = [
    { icon: "Wifi", nameEN: "Free Wi-Fi", nameEL: "Δωρεάν Wi-Fi" },
    { icon: "Wind", nameEN: "Air Conditioning", nameEL: "Κλιματισμός" },
    { icon: "Tv", nameEN: "Flat-screen TV", nameEL: "Επίπεδη Τηλεόραση" },
    { icon: "Refrigerator", nameEN: "Minibar", nameEL: "Μίνι Μπαρ" },
    { icon: "Coffee", nameEN: "Coffee Machine", nameEL: "Μηχανή Καφέ" },
    { icon: "ShowerHead", nameEN: "Private Bathroom", nameEL: "Ιδιωτικό Μπάνιο" },
    { icon: "Sparkles", nameEN: "Premium Toiletries", nameEL: "Προϊόντα Περιποίησης" },
    { icon: "Lock", nameEN: "Safe", nameEL: "Χρηματοκιβώτιο" },
];

const STANDARD_FACILITIES = [
    { icon: "Wifi", nameEN: "Free High-Speed Wi-Fi", nameEL: "Δωρεάν Γρήγορο Wi-Fi" },
    { icon: "Coffee", nameEN: "Coffee Shop", nameEL: "Καφετέρια" },
    { icon: "Utensils", nameEN: "Breakfast", nameEL: "Πρωινό" },
    { icon: "Martini", nameEN: "Bar & Lounge", nameEL: "Μπαρ" },
    { icon: "Luggage", nameEN: "Luggage Storage", nameEL: "Χώρος Αποσκευών" },
    { icon: "Sparkles", nameEN: "Daily Housekeeping", nameEL: "Καθημερινός Καθαρισμός" },
    { icon: "Ban", nameEN: "Smoke-Free", nameEL: "Χωρίς Κάπνισμα" },
];

async function main() {
    const rooms = await prisma.room.findMany();
    console.log(`Found ${rooms.length} rooms. Filling amenities...`);

    for (const room of rooms) {
        // Clear old ones to avoid duplicates
        await prisma.roomAmenity.deleteMany({ where: { roomId: room.id } });
        await prisma.roomFacility.deleteMany({ where: { roomId: room.id } });

        // Insert new default amenities
        await prisma.room.update({
            where: { id: room.id },
            data: {
                amenities: {
                    create: STANDARD_AMENITIES.map((a, i) => ({ ...a, order: i }))
                },
                facilities: {
                    create: STANDARD_FACILITIES.map((f, i) => ({ ...f, order: i }))
                }
            }
        });
        console.log(`Updated room ${room.name}`);
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
