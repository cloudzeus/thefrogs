/**
 * Seed script: directory items
 * Run with: node seed-directory.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const items = [
    {
        titleEN: 'Check In Time',
        titleEL: 'Ώρα Check In',
        icon: 'Calendar',
        descriptionEN: 'Check in time from 15:00 to 23:00, after 23:00 there is an extra charge of 20 Euros. Early check-in is available upon request and subjected to availability.',
        descriptionEL: 'Ώρα check-in από τις 15:00 έως τις 23:00. Μετά τις 23:00 υπάρχει επιπλέον χρέωση 20 Ευρώ. Το πρόωρο check-in είναι διαθέσιμο κατόπιν αιτήματος και ανάλογα με τη διαθεσιμότητα.',
        order: 1,
    },
    {
        titleEN: 'Check Out Time',
        titleEL: 'Ώρα Check Out',
        icon: 'Clock',
        descriptionEN: 'Check-out time is at 11:00 am. Please make sure you have not forgotten any personal items before leaving your room and that you have returned your key to the Reception Desk. Late check-out is available upon request and subject to availability.',
        descriptionEL: 'Η ώρα check-out είναι στις 11:00 π.μ. Παρακαλούμε βεβαιωθείτε ότι δεν έχετε ξεχάσει προσωπικά αντικείμενα πριν φύγετε από το δωμάτιό σας και ότι έχετε επιστρέψει το κλειδί στη Ρεσεψιόν. Η καθυστερημένη αναχώρηση είναι διαθέσιμη κατόπιν αιτήματος και ανάλογα με τη διαθεσιμότητα.',
        order: 2,
    },
    {
        titleEN: 'Housekeeping Services',
        titleEL: 'Υπηρεσίες Καθαριότητας',
        icon: 'Sparkles',
        descriptionEN: 'Rooms are cleaned daily between 14:00pm – 16:00pm. Towels, bathrobes and bed linens are changed every 2 days. If you wish any extra set of pillows, towels or bathrobes please ask at the Reception.',
        descriptionEL: 'Τα δωμάτια καθαρίζονται καθημερινά μεταξύ 14:00μμ – 16:00μμ. Οι πετσέτες, τα μπουρνούζια και τα κλινοσκεπάσματα αλλάζονται κάθε 2 ημέρες. Εάν επιθυμείτε επιπλέον μαξιλάρια, πετσέτες ή μπουρνούζια, παρακαλούμε ζητήστε το στη Ρεσεψιόν.',
        order: 3,
    },
    {
        titleEN: 'Baby Cot',
        titleEL: 'Βρεφική Κούνια',
        icon: 'Baby',
        descriptionEN: 'We provide baby cot free of charge. Please inform our Reception prior to your arrival.',
        descriptionEL: 'Παρέχουμε βρεφική κούνια δωρεάν. Παρακαλούμε ενημερώστε τη Ρεσεψιόν μας πριν από την άφιξή σας.',
        order: 4,
    },
    {
        titleEN: 'First Aid Kit',
        titleEL: 'Φαρμακείο Πρώτων Βοηθειών',
        icon: 'Heart',
        descriptionEN: 'A First Aid Kit is located at our Reception.',
        descriptionEL: 'Ένα φαρμακείο πρώτων βοηθειών βρίσκεται στη Ρεσεψιόν μας.',
        order: 5,
    },
    {
        titleEN: 'Internet / Free Wifi',
        titleEL: 'Ίντερνετ / Δωρεάν Wifi',
        icon: 'Wifi',
        descriptionEN: 'Free wifi access is available in all the areas of the hotel.',
        descriptionEL: 'Δωρεάν πρόσβαση wifi είναι διαθέσιμη σε όλους τους χώρους του ξενοδοχείου.',
        order: 6,
    },
    {
        titleEN: 'Laptop / Tablet (upon request)',
        titleEL: 'Laptop / Tablet (κατόπιν αιτήματος)',
        icon: 'Laptop',
        descriptionEN: 'Free usage of a laptop or tablet, upon request. Please ask at the Reception.',
        descriptionEL: 'Δωρεάν χρήση laptop ή tablet, κατόπιν αιτήματος. Παρακαλούμε ζητήστε το στη Ρεσεψιόν.',
        order: 7,
    },
    {
        titleEN: 'Taxi Service',
        titleEL: 'Υπηρεσία Ταξί',
        icon: 'Car',
        descriptionEN: 'Transport to and from the airport / port with extra charge.',
        descriptionEL: 'Μεταφορά από και προς το αεροδρόμιο / λιμάνι με επιπλέον χρέωση.',
        order: 8,
    },
    {
        titleEN: 'Parking',
        titleEL: 'Στάθμευση',
        icon: 'MapPin',
        descriptionEN: 'Private parking space upon request just 100m away from our guesthouse. Please ask at the reception for further details.',
        descriptionEL: 'Ιδιωτικός χώρος στάθμευσης κατόπιν αιτήματος μόλις 100μ μακριά από τον ξενώνα μας. Παρακαλούμε ρωτήστε στη ρεσεψιόν για περισσότερες λεπτομέρειες.',
        order: 9,
    },
    {
        titleEN: 'Daily Excursions & City Tours',
        titleEL: 'Καθημερινές Εκδρομές & Περιηγήσεις στην Πόλη',
        icon: 'Bus',
        descriptionEN: 'We provide daily excursions & city tours upon request with extra charge. We advise you to express your interest at least 2 days prior to your arrival and ask our Reception for further information.',
        descriptionEL: 'Παρέχουμε καθημερινές εκδρομές & περιηγήσεις στην πόλη κατόπιν αιτήματος με επιπλέον χρέωση. Σας συμβουλεύουμε να εκδηλώσετε το ενδιαφέρον σας τουλάχιστον 2 ημέρες πριν από την άφιξή σας και να ρωτήσετε τη Ρεσεψιόν μας για περισσότερες πληροφορίες.',
        order: 10,
    },
    {
        titleEN: 'Porter & Luggage Storage Services',
        titleEL: 'Υπηρεσίες Μεταφοράς & Φύλαξης Αποσκευών',
        icon: 'Briefcase',
        descriptionEN: 'Porter services are available upon request. Luggage storage is available after check out. Please ask at the reception.',
        descriptionEL: 'Υπηρεσίες αχθοφόρου είναι διαθέσιμες κατόπιν αιτήματος. Η φύλαξη αποσκευών είναι διαθέσιμη μετά το check out. Παρακαλούμε ρωτήστε στη ρεσεψιόν.',
        order: 11,
    },
    {
        titleEN: 'Room Service',
        titleEL: 'Υπηρεσία Δωματίου',
        icon: 'Coffee',
        descriptionEN: 'Room service upon request between 10:00am – 22:00pm.',
        descriptionEL: 'Υπηρεσία δωματίου κατόπιν αιτήματος μεταξύ 10:00πμ – 22:00μμ.',
        order: 12,
    },
    {
        titleEN: 'Breakfast Room Service & Early Breakfast',
        titleEL: 'Υπηρεσία Πρωινού στο Δωμάτιο & Πρόωρο Πρωινό',
        icon: 'Sun',
        descriptionEN: 'Breakfast room service, upon request, with extra charge. Early breakfast take away package, upon request, free of charge. Please ask at the reception for your menu choices.',
        descriptionEL: 'Υπηρεσία πρωινού στο δωμάτιο, κατόπιν αιτήματος, με επιπλέον χρέωση. Πακέτο πρόωρου πρωινού (take away), κατόπιν αιτήματος, δωρεάν. Παρακαλούμε ζητήστε στη ρεσεψιόν τις επιλογές του μενού σας.',
        order: 13,
    },
    {
        titleEN: 'Laundry & Dry Cleaning Service',
        titleEL: 'Υπηρεσία Πλυντηρίου & Στεγνού Καθαρίσματος',
        icon: 'Shirt',
        descriptionEN: 'Laundry & Dry cleaning Service is available upon request with extra charge, every day except national holidays. Please ask at the reception.',
        descriptionEL: 'Η υπηρεσία πλυντηρίου και στεγνού καθαρίσματος είναι διαθέσιμη κατόπιν αιτήματος με επιπλέον χρέωση, κάθε μέρα εκτός από τις εθνικές εορτές. Παρακαλούμε ρωτήστε στη ρεσεψιόν.',
        order: 14,
    },
];

async function main() {
    console.log('Seeding directory items...');

    // Clear existing
    await prisma.directory.deleteMany({});

    for (const item of items) {
        await prisma.directory.create({ data: item });
    }

    console.log(`✅ Seeded ${items.length} directory items.`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
