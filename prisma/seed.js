const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const poisData = [
    {
        slug: 'acropolis',
        titleEN: 'The Acropolis',
        titleEL: 'Η Ακρόπολη',
        subtitleEN: 'Crown of Athens',
        subtitleEL: 'Στέμμα της Αθήνας',
        shortDescriptionEN: 'The Acropolis of Athens is an ancient citadel located on a rocky outcrop above the city, containing remains of several ancient buildings of great architectural and historical significance.',
        shortDescriptionEL: 'Η Ακρόπολη Αθηνών είναι ένα αρχαίο φρούριο σε βραχώδες ύψωμα με κτίρια μεγάλης αρχιτεκτονικής σημασίας.',
        descriptionEN: `The Acropolis is the most striking and complete ancient Greek monumental complex still existing in our times. It is situated on a hill of average height (156m) that rises in the basin of Athens. Its overall dimensions are approximately 170 by 350 meters.\n\nThe hill is rocky and steep on all sides except for the western side. Strong fortification walls have surrounded the summit for more than 3,300 years.\n\nThe most important monuments were built during the 5th century BC: the Parthenon, the Erechtheon, the Propylaea, and the small temple of Athena Nike.`,
        descriptionEL: `Η Ακρόπολη είναι το πιο εντυπωσιακό αρχαίο ελληνικό μνημειακό σύμπλεγμα. Βρίσκεται σε λόφο 156μ στη λεκάνη της Αθήνας.\n\nΤα σημαντικότερα μνημεία είναι ο Παρθενώνας, το Ερέχθειο, τα Προπύλαια και ο ναός της Αθηνάς Νίκης.`,
        featuredImage: '/images/hero-athens-bar.jpg',
        order: 1,
        visitInfo: { distance: '15 min walk from The Frogs', duration: '2-3 hours recommended', price: '€20 (€10 reduced)', hours: '8:00 AM - 8:00 PM (Summer)', bestTime: 'Early morning or late afternoon' },
        tips: [
            { nameEN: 'Buy tickets online to skip the queue', nameEL: 'Αγοράστε εισιτήρια online για να αποφύγετε την ουρά' },
            { nameEN: 'Wear comfortable shoes - lots of walking on marble', nameEL: 'Φορέστε άνετα παπούτσια - πολύ περπάτημα σε μάρμαρο' },
            { nameEN: 'Bring water and sunscreen', nameEL: 'Φέρτε νερό και αντηλιακό' },
            { nameEN: 'Visit early morning to avoid crowds', nameEL: 'Επισκεφθείτε το πρωί για να αποφύγετε τα πλήθη' },
            { nameEN: 'The sunset view is spectacular', nameEL: 'Η θέα στο ηλιοβασίλεμα είναι εντυπωσιακή' },
        ],
        nearby: [
            { name: 'Acropolis Museum', distance: '5 min', order: 0 },
            { name: 'Ancient Agora', distance: '10 min', order: 1 },
            { name: 'Plaka', distance: '5 min', order: 2 },
        ],
    },
    {
        slug: 'plaka',
        titleEN: 'Plaka Neighborhood',
        titleEL: 'Συνοικία Πλάκα',
        subtitleEN: 'The Old Town',
        subtitleEL: 'Η Παλιά Πόλη',
        shortDescriptionEN: 'Plaka is the old historical neighborhood of Athens, clustered around the slopes of the Acropolis, featuring labyrinthine streets and neoclassical architecture.',
        shortDescriptionEL: 'Η Πλάκα είναι η παλιά ιστορική συνοικία της Αθήνας γνωστή ως «Γειτονιά των Θεών».',
        descriptionEN: `Plaka is known as the "Neighborhood of the Gods" due to its proximity to the Acropolis. It is the oldest district in Athens, continuously inhabited for over 3,000 years.\n\nKey areas include Anafiotika, with whitewashed Cycladic houses, and the Roman Agora marketplace.`,
        descriptionEL: `Η Πλάκα είναι η παλαιότερη συνοικία της Αθήνας, κατοικημένη συνεχώς για πάνω από 3.000 χρόνια. Στενά σοκάκια, νεοκλασικά κτίρια και αρχαία ερείπια.`,
        featuredImage: '/images/gallery-1.jpg',
        order: 2,
        visitInfo: { distance: '5 min walk from The Frogs', duration: 'Half day to full day', price: 'Free to explore', hours: 'Always open', bestTime: 'Any time - great for evening strolls' },
        tips: [
            { nameEN: 'Get lost in the small streets - that\'s the charm', nameEL: 'Χαθείτε στα μικρά δρομάκια - αυτή είναι η γοητεία' },
            { nameEN: 'Try traditional Greek food at a taverna', nameEL: 'Δοκιμάστε παραδοσιακή ελληνική κουζίνα σε ταβέρνα' },
            { nameEN: 'Shop for souvenirs on Adrianou Street', nameEL: 'Ψωνίστε σουβενίρ στην οδό Αδριανού' },
            { nameEN: 'Evening is magical with lights and music', nameEL: 'Βράδυ είναι μαγευτικό με φώτα και μουσική' },
        ],
        nearby: [
            { name: 'Acropolis', distance: '5 min', order: 0 },
            { name: 'Monastiraki', distance: '10 min', order: 1 },
            { name: 'Syntagma', distance: '15 min', order: 2 },
        ],
    },
    {
        slug: 'monastiraki',
        titleEN: 'Monastiraki Flea Market',
        titleEL: 'Παζάρι Μοναστηρακίου',
        subtitleEN: 'Treasure Hunting',
        subtitleEL: 'Κυνήγι Θησαυρού',
        shortDescriptionEN: 'A vibrant marketplace where you can find antiques, souvenirs, local crafts and delicious street food.',
        shortDescriptionEL: 'Ζωντανή αγορά με αντίκες, σουβενίρ, τοπικές χειροτεχνίες και πεντανόστιμο street food.',
        descriptionEN: `Monastiraki is one of the most vibrant neighborhoods in Athens, famous for its flea market and antique shops.\n\nThe market operates every day, but Sundays are particularly lively. Street food highlights include souvlaki, gyros, and loukoumades.`,
        descriptionEL: `Το Μοναστηράκι φημίζεται για το παζάρι του. Κάθε Κυριακή γίνεται ιδιαίτερα ζωντανό με πωλητές από όλη την πόλη.`,
        featuredImage: '/images/gallery-3.jpg',
        order: 3,
        visitInfo: { distance: '8 min walk from The Frogs', duration: '2-4 hours', price: 'Free to browse', hours: 'Shops open 10 AM - 8 PM', bestTime: 'Sunday for the full market' },
        tips: [
            { nameEN: 'Sunday is the best day for the full market experience', nameEL: 'Κυριακή είναι η καλύτερη μέρα για το παζάρι' },
            { nameEN: 'Bargaining is expected in many shops', nameEL: 'Παζάρεμα αναμένεται σε πολλά καταστήματα' },
            { nameEN: 'Try the street food - it\'s delicious and cheap', nameEL: 'Δοκιμάστε street food - νόστιμο και φθηνό' },
            { nameEN: 'Cash is king for small vendors', nameEL: 'Μετρητά είναι ό,τι καλύτερο για μικρούς πωλητές' },
        ],
        nearby: [
            { name: 'Ancient Agora', distance: '5 min', order: 0 },
            { name: 'Plaka', distance: '10 min', order: 1 },
            { name: 'Thissio', distance: '10 min', order: 2 },
        ],
    },
    {
        slug: 'lycabettus',
        titleEN: 'Mount Lycabettus',
        titleEL: 'Λυκαβηττός',
        subtitleEN: 'Panoramic Views',
        subtitleEL: 'Πανοραμική Θέα',
        shortDescriptionEN: 'The highest point in Athens offering breathtaking 360° panoramic views, especially magical at sunset.',
        shortDescriptionEL: 'Το υψηλότερο σημείο της Αθήνας με εκπληκτική πανοραμική θέα 360°, ιδιαίτερα μαγευτική στο ηλιοβασίλεμα.',
        descriptionEN: `Mount Lycabettus, at 277 meters above sea level, is the highest point in Central Athens offering panoramic views of the entire city.\n\nYou can reach the summit by walking the winding path (20-30 min) or via the funicular from Aristippou Street.`,
        descriptionEL: `Ο Λυκαβηττός, σε υψόμετρο 277 μέτρων, είναι το υψηλότερο σημείο της κεντρικής Αθήνας. Μπορείτε να ανεβείτε πεζή ή με το τελεφερίκ.`,
        featuredImage: '/images/rooftop-skyline.jpg',
        order: 4,
        visitInfo: { distance: '20 min walk from The Frogs', duration: '1-2 hours', price: 'Free (€7 funicular round trip)', hours: 'Always open', bestTime: 'Sunset for the best views' },
        tips: [
            { nameEN: 'Take the funicular up and walk down for the best experience', nameEL: 'Ανεβείτε με τελεφερίκ και κατεβείτε πεζή' },
            { nameEN: 'Sunset is the most popular time - arrive early', nameEL: 'Ηλιοβασίλεμα είναι η πιο δημοφιλής ώρα - φτάστε νωρίς' },
            { nameEN: 'Bring a jacket - it gets windy at the top', nameEL: 'Πάρτε μπουφάν - φυσάει στην κορυφή' },
            { nameEN: 'Perfect spot for photography', nameEL: 'Τέλειο σημείο για φωτογραφία' },
        ],
        nearby: [
            { name: 'Kolonaki', distance: '10 min', order: 0 },
            { name: 'National Garden', distance: '15 min', order: 1 },
            { name: 'Syntagma', distance: '20 min', order: 2 },
        ],
    },
    {
        slug: 'national-museum',
        titleEN: 'National Archaeological Museum',
        titleEL: 'Εθνικό Αρχαιολογικό Μουσείο',
        subtitleEN: 'Ancient Treasures',
        subtitleEL: 'Αρχαίοι Θησαυροί',
        shortDescriptionEN: "One of the world's most important museums, housing over 11,000 exhibits of ancient Greek civilization.",
        shortDescriptionEL: 'Ένα από τα σημαντικότερα μουσεία του κόσμου με πάνω από 11.000 εκθέματα αρχαίας ελληνικής τέχνης.',
        descriptionEN: `The National Archaeological Museum contains over 11,000 exhibits spanning prehistory to late antiquity.\n\nHighlights include the Mask of Agamemnon, the Antikythera Mechanism, the bronze statue of Zeus or Poseidon, and the frescoes from Akrotiri.`,
        descriptionEL: `Το Εθνικό Αρχαιολογικό Μουσείο περιέχει πάνω από 11.000 εκθέματα. Στα εκθέματα περιλαμβάνεται η Μάσκα του Αγαμέμνονα και ο Μηχανισμός των Αντικυθήρων.`,
        featuredImage: '/images/gallery-2.jpg',
        order: 5,
        visitInfo: { distance: '25 min walk from The Frogs', duration: '2-4 hours', price: '€12 (€6 reduced)', hours: '8:00 AM - 8:00 PM (Tue-Sun)', bestTime: 'Weekday mornings are quieter' },
        tips: [
            { nameEN: 'Audio guides are available in multiple languages', nameEL: 'Ακουστικοί οδηγοί σε πολλές γλώσσες' },
            { nameEN: 'Free admission on first Sunday of each month (Nov-Mar)', nameEL: 'Δωρεάν είσοδος κάθε πρώτη Κυριακή (Νοε-Μαρ)' },
            { nameEN: 'Plan at least 2 hours for a quick visit', nameEL: 'Προγραμματίστε τουλάχιστον 2 ώρες' },
            { nameEN: 'The gift shop has excellent reproductions', nameEL: 'Το gift shop έχει εξαιρετικές αναπαραγωγές' },
        ],
        nearby: [
            { name: 'Exarcheia', distance: '10 min', order: 0 },
            { name: 'Omonia Square', distance: '15 min', order: 1 },
            { name: 'Polytechnic University', distance: '5 min', order: 2 },
        ],
    },
    {
        slug: 'syntagma',
        titleEN: 'Syntagma Square',
        titleEL: 'Πλατεία Συντάγματος',
        subtitleEN: 'Heart of the City',
        subtitleEL: 'Καρδιά της Πόλης',
        shortDescriptionEN: 'The central square of Athens, home to the Hellenic Parliament and the famous Changing of the Guard ceremony.',
        shortDescriptionEL: 'Η κεντρική πλατεία της Αθήνας με το Ελληνικό Κοινοβούλιο και την Αλλαγή της Φρουράς.',
        descriptionEN: `Syntagma Square is named after the Constitution of 1843. The Old Royal Palace houses the Hellenic Parliament.\n\nThe Changing of the Guard takes place every hour, with an elaborate ceremony on Sundays at 11 AM.`,
        descriptionEL: `Η Πλατεία Συντάγματος ονομάστηκε έτσι από το Σύνταγμα του 1843. Στο Παλαιό Ανάκτορο στεγάζεται το Ελληνικό Κοινοβούλιο.`,
        featuredImage: '/images/gallery-4.jpg',
        order: 6,
        visitInfo: { distance: '12 min walk from The Frogs', duration: '1 hour', price: 'Free', hours: 'Always open', bestTime: 'Sunday 11 AM for the full ceremony' },
        tips: [
            { nameEN: 'Arrive 15 minutes early for a good viewing spot', nameEL: 'Φτάστε 15 λεπτά νωρίτερα για καλή θέση' },
            { nameEN: 'The Sunday ceremony is the most elaborate', nameEL: 'Η Κυριακάτικη τελετή είναι η πιο επίσημη' },
            { nameEN: 'Combine with a visit to the National Garden', nameEL: 'Συνδυάστε με επίσκεψη στον Εθνικό Κήπο' },
            { nameEN: 'Metro station has archaeological exhibits', nameEL: 'Ο σταθμός μετρό έχει αρχαιολογικά εκθέματα' },
        ],
        nearby: [
            { name: 'National Garden', distance: '5 min', order: 0 },
            { name: 'Ermou Street', distance: '2 min', order: 1 },
            { name: 'Plaka', distance: '10 min', order: 2 },
        ],
    },
    {
        slug: 'anafiotika',
        titleEN: 'Anafiotika',
        titleEL: 'Αναφιώτικα',
        subtitleEN: 'Hidden Village',
        subtitleEL: 'Κρυφό Χωριό',
        shortDescriptionEN: 'A secret village-like neighborhood under the Acropolis with whitewashed Cycladic houses and narrow alleys.',
        shortDescriptionEL: 'Μια κρυμμένη γειτονιά κάτω από την Ακρόπολη με ασπρισμένα Κυκλαδίτικα σπίτια και στενά δρομάκια.',
        descriptionEN: `Anafiotika is a scenic tiny neighborhood built in Cycladic style, with whitewashed walls and colorful doors. It feels like a Greek island in the middle of the city.\n\nDespite its central location, it remains relatively unknown to many tourists.`,
        descriptionEL: `Τα Αναφιώτικα είναι χτισμένα σε Κυκλαδίτικο ρυθμό. Νιώθεις σαν να είσαι σε νησί στη μέση της πόλης. Σχετικά άγνωστο στους τουρίστες.`,
        featuredImage: '/images/gallery-6.jpg',
        order: 7,
        visitInfo: { distance: '10 min walk from The Frogs', duration: '1-2 hours', price: 'Free', hours: 'Always open', bestTime: 'Late afternoon for golden light' },
        tips: [
            { nameEN: 'Get lost in the maze-like alleys', nameEL: 'Χαθείτε στα σαγηνευτικά δρομάκια' },
            { nameEN: 'Perfect for Instagram photos', nameEL: 'Τέλειο για Instagram φωτογραφίες' },
            { nameEN: 'Very quiet in the early morning', nameEL: 'Πολύ ήσυχο το πρωί' },
            { nameEN: 'Respect the residents - people live here', nameEL: 'Σεβαστείτε τους κατοίκους - είναι κατοικημένο' },
        ],
        nearby: [
            { name: 'Acropolis', distance: '5 min', order: 0 },
            { name: 'Plaka', distance: '2 min', order: 1 },
            { name: 'Roman Agora', distance: '5 min', order: 2 },
        ],
    },
    {
        slug: 'gazi',
        titleEN: 'Gazi & Technopolis',
        titleEL: 'Γκάζι & Τεχνόπολις',
        subtitleEN: 'Nightlife Hub',
        subtitleEL: 'Κέντρο Νυχτερινής Ζωής',
        shortDescriptionEN: "The former gasworks turned cultural center, now Athens' trendiest nightlife and dining district.",
        shortDescriptionEL: 'Το πρώην εργοστάσιο αερίου, τώρα πολιτιστικό κέντρο και το πιο trendy νυχτερινό κέντρο της Αθήνας.',
        descriptionEN: `Gazi surrounds the old Athens gasworks, now the Technopolis cultural complex. Transformed into one of the city's most vibrant nightlife districts.\n\nTechnopolis hosts concerts, exhibitions, and festivals year-round.`,
        descriptionEL: `Το Γκάζι περιβάλλει το παλιό εργοστάσιο αερίου, τώρα Τεχνόπολις. Έχει μετατραπεί σε ένα από τα πιο ζωντανά νυχτερινά κέντρα διασκέδασης.`,
        featuredImage: '/images/bar-interior.jpg',
        order: 8,
        visitInfo: { distance: '15 min walk from The Frogs', duration: 'Evening to late night', price: 'Varies by venue', hours: 'Venues open from 8 PM', bestTime: 'Weekend nights for the full experience' },
        tips: [
            { nameEN: 'Start with dinner and stay for drinks', nameEL: 'Ξεκινήστε με δείπνο και μείνετε για ποτά' },
            { nameEN: 'Many venues have live music', nameEL: 'Πολλά μέρη έχουν ζωντανή μουσική' },
            { nameEN: 'Technopolis hosts great events - check their schedule', nameEL: 'Η Τεχνόπολις έχει εκδηλώσεις - δείτε το πρόγραμμα' },
            { nameEN: 'Metro station makes it easy to get home', nameEL: 'Ο σταθμός μετρό διευκολύνει την επιστροφή' },
        ],
        nearby: [
            { name: 'Kerameikos', distance: '5 min', order: 0 },
            { name: 'Thissio', distance: '10 min', order: 1 },
            { name: 'Monastiraki', distance: '15 min', order: 2 },
        ],
    },
];

const roomsData = [
    {
        name: 'Deluxe Suite', slug: 'deluxe-suite',
        descriptionEN: 'Our Deluxe Suite has a separate room with a king size bed and a living room with 2 Single Sofa Beds. Can accommodate up to 4 people and has an ensuite bathroom with a separate shower room. Always aiming for the best quality and comfort of our guests — all our linens & towels are 100% cotton. The stylish décor inspired from the Greek art combines natural fibers and colourful textiles. The room has a private terrace that offers a view to the urban side of the centre of Athens.',
        descriptionEL: 'Η Deluxe Suite διαθέτει ξεχωριστό δωμάτιο με king size κρεβάτι και σαλόνι με 2 μονά κρεβάτια καναπέ. Μπορεί να φιλοξενήσει έως 4 άτομα.',
        sleeps: 4, squareMeters: 30, startingFrom: 120, featuredImage: '/images/room-deluxe-suite.jpg', published: true, order: 1,
        images: ['/images/room-deluxe-suite.jpg', '/images/guesthouse-room.jpg', '/images/reservation-room.jpg', '/images/gallery-2.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Terrace', nameEL: 'Βεράντα', icon: 'Sun' }, { nameEN: '2 Single Sofa Beds', nameEL: '2 Μονά Κρεβάτια Καναπέ', icon: 'Bed' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
    {
        name: 'Deluxe Triple Room', slug: 'deluxe-triple',
        descriptionEN: 'Our Deluxe Triple room has a king size bed, a single sofa bed and an ensuite bathroom. Perfect for small groups or families looking for comfort and style in the heart of Athens.',
        descriptionEL: 'Το Deluxe Triple δωμάτιο διαθέτει king size κρεβάτι, ένα μονό κρεβάτι καναπέ και ιδιωτικό μπάνιο.',
        sleeps: 3, squareMeters: 26, startingFrom: 95, featuredImage: '/images/room-deluxe-triple.jpg', published: true, order: 2,
        images: ['/images/room-deluxe-triple.jpg', '/images/guesthouse-room.jpg', '/images/reservation-room.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Single Sofa Bed', nameEL: 'Μονό Κρεβάτι Καναπέ', icon: 'Bed' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
    {
        name: 'Deluxe Double Room', slug: 'deluxe-double',
        descriptionEN: 'Our Deluxe Double room has a king size bed and an ensuite bathroom. A cozy retreat perfect for couples exploring Athens.',
        descriptionEL: 'Το Deluxe Double δωμάτιο διαθέτει king size κρεβάτι και ιδιωτικό μπάνιο. Ιδανικό για ζευγάρια.',
        sleeps: 2, squareMeters: 22, startingFrom: 85, featuredImage: '/images/room-deluxe-double.jpg', published: true, order: 3,
        images: ['/images/room-deluxe-double.jpg', '/images/guesthouse-room.jpg', '/images/reservation-room.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
    {
        name: 'The Loft', slug: 'loft',
        descriptionEN: 'This one-story loft features a king-size bed on the upper level and a spacious living room with a double sofa bed on the lower level. Industrial chic design with modern amenities.',
        descriptionEL: 'Αυτό το μονόχωρο loft διαθέτει king-size κρεβάτι στο ανώτερο επίπεδο και σαλόνι με διπλό καναπέ-κρεβάτι.',
        sleeps: 4, squareMeters: 37, startingFrom: 140, featuredImage: '/images/room-loft.jpg', published: true, order: 4,
        images: ['/images/room-loft.jpg', '/images/reservation-room.jpg', '/images/gallery-2.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Double Sofa Bed', nameEL: 'Διπλό Κρεβάτι Καναπέ', icon: 'Bed' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
    {
        name: 'Sailor Room', slug: 'sailor',
        descriptionEN: 'Our Deluxe Triple Sailor Room has a king size bed and a single sofa bed. The bathroom with a shower is ensuite. Nautical themed with maritime charm.',
        descriptionEL: 'Το Sailor Room διαθέτει king size κρεβάτι και μονό καναπέ-κρεβάτι. Ναυτιλιακό θέμα με θαλασσινή γοητεία.',
        sleeps: 3, squareMeters: 32, startingFrom: 100, featuredImage: '/images/room-sailor.jpg', published: true, order: 5,
        images: ['/images/room-sailor.jpg', '/images/reservation-room.jpg', '/images/gallery-2.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Single Sofa Bed', nameEL: 'Μονό Κρεβάτι Καναπέ', icon: 'Bed' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
    {
        name: 'African Room', slug: 'african',
        descriptionEN: 'Our Deluxe Double African Room is a haven of cultural fusion with a king-size bed, ensuite bathroom and shower. Rich textures and warm earth tones create an inviting atmosphere.',
        descriptionEL: 'Το African Room διαθέτει king-size κρεβάτι και ιδιωτικό μπάνιο με ντουζιέρα. Πλούσιες υφές και ζεστές γήινες αποχρώσεις.',
        sleeps: 2, squareMeters: 30, startingFrom: 110, featuredImage: '/images/room-african.jpg', published: true, order: 6,
        images: ['/images/room-african.jpg', '/images/reservation-room.jpg', '/images/gallery-2.jpg'],
        amenities: [{ nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Coffee & Tea', nameEL: 'Καφές & Τσάι', icon: 'Coffee' }, { nameEN: 'Daily Cleaning', nameEL: 'Καθημερινή Καθαριότητα', icon: 'Sparkles' }],
        facilities: [{ nameEN: 'Minibar', nameEL: 'Μίνι μπαρ', icon: 'Wine' }, { nameEN: 'Safety Deposit Box', nameEL: 'Χρηματοκιβώτιο', icon: 'Lock' }, { nameEN: 'Air Conditioning', nameEL: 'Κλιματισμός', icon: 'Wind' }, { nameEN: 'Iron', nameEL: 'Σίδερο', icon: 'Shirt' }, { nameEN: 'Heating', nameEL: 'Θέρμανση', icon: 'Flame' }, { nameEN: 'Flat-screen TV', nameEL: 'Τηλεόραση', icon: 'Tv' }, { nameEN: 'Electric Kettle', nameEL: 'Ηλεκτρικός Βραστήρας', icon: 'Coffee' }, { nameEN: 'Wardrobe/Closet', nameEL: 'Ντουλάπα', icon: 'Archive' }, { nameEN: 'Free WiFi', nameEL: 'Δωρεάν WiFi', icon: 'Wifi' }, { nameEN: 'Hairdryer', nameEL: 'Πιστολάκι', icon: 'Wind' }],
    },
];

async function main() {
    console.log('🌱 Starting seed...');

    // Admin
    const hash = await bcrypt.hash('1f1femsk', 10);
    await prisma.user.upsert({
        where: { email: 'gkozyris@i4ria.com' },
        update: { password: hash, role: 'ADMIN', name: 'George Kozyris' },
        create: { email: 'gkozyris@i4ria.com', password: hash, role: 'ADMIN', name: 'George Kozyris' },
    });
    console.log('✅ Admin user');

    // Rooms
    for (const { images, amenities, facilities, ...room } of roomsData) {
        const existing = await prisma.room.findUnique({ where: { slug: room.slug } });
        if (!existing) {
            await prisma.room.create({
                data: {
                    ...room,
                    images: { create: images.map((url, i) => ({ url, order: i })) },
                    amenities: { create: amenities.map((a, i) => ({ ...a, order: i })) },
                    facilities: { create: facilities.map((f, i) => ({ ...f, order: i })) },
                },
            });
        }
        console.log(`✅ Room: ${room.name}`);
    }

    // POIs
    for (const { visitInfo, tips, nearby, ...poi } of poisData) {
        const existing = await prisma.poi.findUnique({ where: { slug: poi.slug } });
        if (!existing) {
            await prisma.poi.create({
                data: {
                    ...poi,
                    visitInfo: visitInfo ? { create: visitInfo } : undefined,
                    visitorTips: { create: tips.map((t, i) => ({ ...t, order: i })) },
                    nearby: { create: nearby },
                },
            });
        } else {
            // Upsert visit info and re-seed tips/nearby if empty
            if (visitInfo) {
                await prisma.poiVisitInfo.upsert({
                    where: { poiId: existing.id },
                    update: visitInfo,
                    create: { poiId: existing.id, ...visitInfo },
                });
            }
            const tipCount = await prisma.poiVisitorTip.count({ where: { poiId: existing.id } });
            if (tipCount === 0) {
                await prisma.poiVisitorTip.createMany({ data: tips.map((t, i) => ({ poiId: existing.id, ...t, order: i })) });
            }
            const nearbyCount = await prisma.poiNearby.count({ where: { poiId: existing.id } });
            if (nearbyCount === 0) {
                await prisma.poiNearby.createMany({ data: nearby.map(n => ({ poiId: existing.id, ...n })) });
            }
        }
        console.log(`✅ POI: ${poi.titleEN}`);
    }

    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => { console.error('❌', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
