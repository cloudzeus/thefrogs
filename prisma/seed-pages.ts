/**
 * Seed PageMeta records based on the actual content of each public page.
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-pages.ts
 *   or add to the main seed script.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pages = [
    // ── HOME ──────────────────────────────────────────────────────────────────
    {
        slug: "home",
        published: true,
        heroImage: "/images/hero-athens-bar.jpg",
        titleEL: "THE FROGS GUESTHOUSE",
        titleEN: "THE FROGS GUESTHOUSE",
        subtitleEL: "Ένα boutique ξενοδοχείο στην καρδιά της Αθήνας με bar στο ισόγειο και ταράτσα για χρυσές ώρες.",
        subtitleEN: "A boutique guesthouse in the heart of Athens with a bar downstairs and a rooftop made for golden hour. Est. 2018.",
        textEL: "Καλωσορίστε στο The Frogs Guesthouse — ένα μοναδικό boutique κατάλυμα που συνδυάζει διακριτική πολυτέλεια, αυθεντική αθηναϊκή ατμόσφαιρα και ζεστή φιλοξενία. Βρισκόμαστε στην καρδιά του Ψυρρή, μια ανάσα από τα πιο εμβληματικά αξιοθέατα της πόλης.",
        textEN: "Welcome to The Frogs Guesthouse — a unique boutique property combining understated luxury, authentic Athenian atmosphere, and warm hospitality. Located in the heart of Psyri, steps away from the city's most iconic landmarks.",
        metaTitleEL: "The Frogs Guesthouse | Boutique ξενοδοχείο Αθήνα",
        metaTitleEN: "The Frogs Guesthouse | Boutique Hotel Athens, Greece",
        metaDescriptionEL: "Boutique guesthouse στην καρδιά της Αθήνας. Μοναδικά δωμάτια, bar και ταράτσα με θέα. Κλείστε απευθείας για τις καλύτερες τιμές.",
        metaDescriptionEN: "Boutique guesthouse in the heart of Athens. Unique rooms, bar and rooftop with views. Book direct for the best rates. Est. 2018.",
        keywords: "Athens boutique hotel, Frogs Guesthouse, Psyri accommodation, Athens guesthouse, boutique hotel Greece, Athens city center hotel",
    },

    // ── ROOMS ─────────────────────────────────────────────────────────────────
    {
        slug: "rooms",
        published: true,
        heroImage: "/images/guesthouse-room.jpg",
        titleEL: "ΤΑ ΔΩΜΑΤΙΑ",
        titleEN: "THE ROOMS",
        subtitleEL: "Έξι μοναδικά διαμορφωμένοι χώροι, ο καθένας με το δικό του χαρακτήρα",
        subtitleEN: "Six individually designed spaces, each with its own character and charm",
        textEL: "Κάθε δωμάτιο είναι σχεδιασμένο με ιδιαίτερη προσοχή στη λεπτομέρεια — από τη Deluxe Suite με το ξεχωριστό σαλόνι, μέχρι το nautical-themed Sailor Room και το πολιτισμικά εμπνευσμένο African Room. Βρείτε τον χώρο που ταιριάζει στους ρυθμούς σας.",
        textEN: "Each room is designed with careful attention to detail — from the Deluxe Suite with a separate living room, to the nautical-themed Sailor Room and the culturally inspired African Room. Find the space that matches your pace.",
        metaTitleEL: "Δωμάτια | The Frogs Guesthouse Αθήνα",
        metaTitleEN: "Rooms | The Frogs Guesthouse Athens",
        metaDescriptionEL: "Ανακαλύψτε τα 6 μοναδικά δωμάτια του The Frogs Guesthouse. Deluxe Suite, Loft, Sailor, African και άλλα. Κλείστε άμεσα online.",
        metaDescriptionEN: "Discover 6 uniquely designed rooms at The Frogs Guesthouse Athens. Deluxe Suite, Loft, Sailor Room, African Room and more. Book online now.",
        keywords: "Athens hotel rooms, boutique rooms Athens, Deluxe Suite Athens, Frogs Guesthouse rooms, Psyri hotel, Athens accommodation",
    },

    // ── ATHENS / SIGHTS ───────────────────────────────────────────────────────
    {
        slug: "athens",
        published: true,
        heroImage: "/images/rooftop-skyline.jpg",
        titleEL: "ΑΘΗΝΑ",
        titleEN: "ATHENS",
        subtitleEL: "Μια πόλη όπου η αρχαία ιστορία συναντά τη σύγχρονη ζωή, μια ανάσα από την πόρτα σας",
        subtitleEN: "A city where ancient history meets modern life, just steps from your door",
        textEL: "Το The Frogs Guesthouse βρίσκεται στη ζωντανή γειτονιά του Ψυρρή — σε περπατητή απόσταση από τα πιο εμβληματικά αξιοθέατα, τις ζωντανές γειτονιές και τα κρυφά διαμάντια της Αθήνας. Από την αρχαία Ακρόπολη μέχρι τα τάβερνες και τα μοντέρνα μπαρ, ανακαλύψτε τις πολλές πτυχές αυτής της εξαιρετικής πόλης.",
        textEN: "Located in the vibrant Psyri neighbourhood, The Frogs Guesthouse puts you within walking distance of Athens' most iconic landmarks, vibrant neighbourhoods, and hidden gems. From the ancient Acropolis to trendy nightlife districts, discover the many faces of this extraordinary city.",
        metaTitleEL: "Αξιοθέατα Αθήνας | The Frogs Guesthouse",
        metaTitleEN: "Athens Sights & Attractions | The Frogs Guesthouse",
        metaDescriptionEL: "Εξερευνήστε την Αθήνα από την τέλεια βάση. Ακρόπολη, Πλάκα, Μοναστηράκι — όλα σε απόσταση βόλτας. Μείνετε στο The Frogs Guesthouse.",
        metaDescriptionEN: "Explore Athens from the perfect base. Acropolis, Plaka, Monastiraki — all within walking distance. Stay at The Frogs Guesthouse in Psyri.",
        keywords: "Athens attractions, Athens sights, Acropolis, Plaka, Monastiraki, Athens walking distance, things to do Athens, Psyri Athens",
    },

    // ── GALLERY ───────────────────────────────────────────────────────────────
    {
        slug: "gallery",
        published: true,
        heroImage: "/images/hero-athens-bar.jpg",
        titleEL: "GALLERY",
        titleEN: "GALLERY",
        subtitleEL: "Εικόνες από τους χώρους, τη ζωή και την ατμόσφαιρα του The Frogs",
        subtitleEN: "Images from the spaces, life, and atmosphere of The Frogs",
        textEL: "Περιηγηθείτε στη συλλογή φωτογραφιών μας — δωμάτια, bar, ταράτσα και η γύρω αθηναϊκή ζωή που κάνει κάθε διαμονή αξέχαστη.",
        textEN: "Browse our photo collection — rooms, bar, rooftop, and the surrounding Athenian life that makes every stay unforgettable.",
        metaTitleEL: "Φωτογραφίες | The Frogs Guesthouse Αθήνα",
        metaTitleEN: "Gallery | The Frogs Guesthouse Athens",
        metaDescriptionEL: "Δείτε τους χώρους του The Frogs Guesthouse — δωμάτια, bar, ταράτσα και τη ζωντανή ατμόσφαιρα της Αθήνας μέσα από έναν φακό.",
        metaDescriptionEN: "View The Frogs Guesthouse spaces — rooms, bar, rooftop, and the vibrant Athenian atmosphere through a lens.",
        keywords: "Athens hotel photos, Frogs Guesthouse gallery, boutique hotel images Athens, Athens guesthouse pictures",
    },

    // ── DIRECTORY ─────────────────────────────────────────────────────────────
    {
        slug: "directory",
        published: true,
        heroImage: "/images/hero-athens-bar.jpg",
        titleEL: "ΟΔΗΓΟΣ ΦΙΛΟΞΕΝΟΥΜΕΝΩΝ",
        titleEN: "GUEST DIRECTORY",
        subtitleEL: "Όλα όσα χρειάζεστε για μια τέλεια παραμονή στην Αθήνα",
        subtitleEN: "Everything you need for a perfect stay in Athens",
        textEL: "Ο οδηγός φιλοξενουμένων μας περιέχει χρήσιμες πληροφορίες για τους χώρους μας, τις τοπικές υπηρεσίες και τα μυστικά της Αθήνας που μόνο οι ντόπιοι γνωρίζουν. Κάντε τη διαμονή σας αξέχαστη.",
        textEN: "Our guest directory contains useful information about our spaces, local services, and Athenian secrets that only locals know. Make your stay unforgettable.",
        metaTitleEL: "Οδηγός Φιλοξενουμένων | The Frogs Guesthouse",
        metaTitleEN: "Guest Directory | The Frogs Guesthouse Athens",
        metaDescriptionEL: "Χρήσιμες πληροφορίες για τους φιλοξενούμενους του The Frogs Guesthouse — τοπικές υπηρεσίες, tips και μυστικά της Αθήνας.",
        metaDescriptionEN: "Useful information for The Frogs Guesthouse guests — local services, insider tips, and Athenian secrets for the perfect stay.",
        keywords: "Athens guest guide, Athens local tips, Athens hotel information, Frogs Guesthouse directory, Athens insider tips",
    },

    // ── CONTACT ───────────────────────────────────────────────────────────────
    {
        slug: "contact",
        published: true,
        heroImage: "/images/contact-coffee.jpg",
        titleEL: "ΕΠΙΚΟΙΝΩΝΙΑ",
        titleEN: "CONTACT US",
        subtitleEL: "Χαρά μας να σας ακούσουμε. Για ειδικά αιτήματα ή απορίες μη διστάσετε να επικοινωνήσετε μαζί μας.",
        subtitleEN: "Always a pleasure to hear from you. For any special requests or other enquiries do not hesitate to drop us a line.",
        textEL: "Βρείτε μας στην Αριστοφάνους 4, Αθήνα 10554. Τηλ: +30 21 1401 9607 · WhatsApp: +30 697 690 8878 · Email: thefrogs.guesthouse@gmail.com",
        textEN: "Find us at 4 Aristofanous Str., Athens 10554. Tel: +30 21 1401 9607 · WhatsApp: +30 697 690 8878 · Email: thefrogs.guesthouse@gmail.com",
        metaTitleEL: "Επικοινωνία | The Frogs Guesthouse Αθήνα",
        metaTitleEN: "Contact | The Frogs Guesthouse Athens",
        metaDescriptionEL: "Επικοινωνήστε με το The Frogs Guesthouse. Τηλέφωνο, WhatsApp, email και οδηγίες πρόσβασης. Ψυρρή, Αθήνα 10554.",
        metaDescriptionEN: "Contact The Frogs Guesthouse. Phone, WhatsApp, email and directions. Psyri, Athens 10554. We'd love to hear from you.",
        keywords: "contact Athens hotel, Frogs Guesthouse contact, Athens boutique hotel phone, Psyri hotel address, Athens guesthouse email",
    },
];

async function main() {
    console.log("🌱 Seeding PageMeta records…\n");

    for (const page of pages) {
        const result = await prisma.pageMeta.upsert({
            where: { slug: page.slug },
            update: page,
            create: page,
        });
        console.log(`  ✅  /${result.slug} — "${result.titleEN}"`);
    }

    console.log(`\n✨ Done — seeded ${pages.length} page records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
