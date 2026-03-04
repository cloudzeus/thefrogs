import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Euro,
  Camera,
  Sun,
  Info,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const sightsData = {
  'acropolis': {
    id: 'acropolis',
    nameEN: 'The Acropolis',
    nameEL: 'Η Ακρόπολη',
    subtitleEN: 'Crown of Athens',
    subtitleEL: 'Το στέμμα της Αθήνας',
    descriptionEN: 'The Acropolis of Athens is an ancient citadel located on a rocky outcrop above the city of Athens. It contains the remains of several ancient buildings of great architectural and historical significance, the most famous being the Parthenon.',
    descriptionEL: 'Η Ακρόπολη της Αθήνας είναι μια αρχαία ακρόπολη που βρίσκεται σε μια βραχώδη έξαρση πάνω από την πόλη της Αθήνας. Περιλαμβάνει τα ερείπια αρκετών αρχαίων κτιρίων μεγάλης αρχιτεκτονικής και ιστορικής σημασίας, με πιο διάσημο τον Παρθενώνα.',
    fullDescriptionEN: `The Acropolis is the most striking and complete ancient Greek monumental complex still existing in our times. It is situated on a hill of average height (156m) that rises in the basin of Athens. Its overall dimensions are approximately 170 by 350 meters.

The hill is rocky and steep on all sides except for the western side, and has an extensive, nearly flat top. Strong fortification walls have surrounded the summit of the Acropolis for more than 3,300 years.

The first fortification wall was built during the 13th century BC, surrounding the residence of the local Mycenaean ruler. In the 8th century BC, the Acropolis gradually acquired a religious character with the establishment of the cult of Athena, the city's patron goddess.

The most important monuments were built during that time: the Parthenon, built by Ictinus, the Erechtheon, the Propylaea, the monumental entrance to the Acropolis, designed by Mnesicles and the small temple Athena Nike.`,
    fullDescriptionEL: `Η Ακρόπολη είναι το πιο εντυπωσιακό και ολοκληρωμένο αρχαίο ελληνικό μνημειακό συγκρότημα που εξακολουθεί να υπάρχει στην εποχή μας. Βρίσκεται σε ένα λόφο μέσου ύψους (156μ.) που υψώνεται στη λεκάνη της Αθήνας. Οι συνολικές διαστάσεις του είναι περίπου 170 επί 350 μέτρα.

Ο λόφος είναι βραχώδης και απότομος σε όλες τις πλευρές εκτός από τη δυτική, και έχει μια εκτεταμένη, σχεδόν επίπεδη κορυφή. Ισχυρά οχυρωματικά τείχη έχουν περιβάλει την κορυφή της Ακρόπολης για περισσότερα από 3.300 χρόνια.

Το πρώτο οχυρωματικό τείχος χτίστηκε κατά τη διάρκεια του 13ου αιώνα π.Χ., περιβάλλοντας την κατοικία του τοπικού Μυκηναίου ηγεμόνα. Τον 8ο αιώνα π.Χ., η Ακρόπολη απέκτησε σταδιακά θρησκευτικό χαρακτήρα με την καθιέρωση της λατρείας της Αθηνάς, της προστάτιδας θεάς της πόλης.

Τα σημαντικότερα μνημεία χτίστηκαν εκείνη την εποχή: ο Παρθενώνας, χτισμένος από τον Ικτίνο, το Ερέχθειο, τα Προπύλαια, η μνημειακή είσοδος στην Ακρόπολη, σχεδιασμένη από τον Μνησικλή και ο μικρός ναός της Αθηνάς Νίκης.`,
    image: '/images/hero-athens-bar.jpg',
    gallery: [
      '/images/gallery-1.jpg',
      '/images/gallery-2.jpg',
      '/images/gallery-4.jpg',
    ],
    details: {
      distanceEN: '15 min walk from The Frogs',
      distanceEL: '15 λεπτά με τα πόδια από το The Frogs',
      timeEN: '2-3 hours recommended',
      timeEL: 'Συνιστώνται 2-3 ώρες',
      priceEN: '€20 (€10 reduced)',
      priceEL: '€20 (€10 μειωμένο)',
      hoursEN: '8:00 AM - 8:00 PM (Summer)',
      hoursEL: '8:00 π.μ. - 8:00 μ.μ. (Καλοκαίρι)',
      bestTimeEN: 'Early morning or late afternoon',
      bestTimeEL: 'Νωρίς το πρωί ή αργά το απόγευμα',
    },
    tipsEN: [
      'Buy tickets online to skip the queue',
      'Wear comfortable shoes - lots of walking on marble',
      'Bring water and sunscreen',
      'Visit early morning to avoid crowds',
      'The sunset view is spectacular',
    ],
    tipsEL: [
      'Αγοράστε εισιτήρια online για να αποφύγετε την ουρά',
      'Φορέστε άνετα παπούτσια - πολύ περπάτημα σε μάρμαρο',
      'Φέρτε νερό και αντηλιακό',
      'Επισκεφθείτε νωρίς το πρωί για να αποφύγετε τα πλήθη',
      'Η θέα του ηλιοβασιλέματος είναι εντυπωσιακή',
    ],
    nearbyEN: [
      { name: 'Acropolis Museum', distance: '5 min' },
      { name: 'Ancient Agora', distance: '10 min' },
      { name: 'Plaka', distance: '5 min' },
    ],
    nearbyEL: [
      { name: 'Μουσείο Ακρόπολης', distance: '5 λεπτά' },
      { name: 'Αρχαία Αγορά', distance: '10 λεπτά' },
      { name: 'Πλάκα', distance: '5 λεπτά' },
    ],
  },
  'plaka': {
    id: 'plaka',
    nameEN: 'Plaka Neighborhood',
    nameEL: 'Η Γειτονιά της Πλάκας',
    subtitleEN: 'The Old Town',
    subtitleEL: 'Η Παλιά Πόλη',
    descriptionEN: 'Plaka is the old historical neighborhood of Athens, clustered around the northern and eastern slopes of the Acropolis. It features labyrinthine streets and neoclassical architecture.',
    descriptionEL: 'Η Πλάκα είναι η ιστορική παλιά γειτονιά της Αθήνας, συγκεντρωμένη γύρω από τις βόρειες και ανατολικές πλαγιές της Ακρόπολης. Χαρακτηρίζεται από λαβυρινθώδη δρομάκια και νεοκλασική αρχιτεκτονική.',
    fullDescriptionEN: `Plaka is known as the "Neighborhood of the Gods" due to its proximity to the Acropolis and its many archaeological sites. It is the oldest district in Athens, continuously inhabited for over 3,000 years.

The area is characterized by its narrow, winding streets, neoclassical houses, small churches, and ancient ruins scattered throughout. It's a pedestrian-friendly area where you can wander for hours, discovering hidden corners and charming spots.

Plaka is famous for its traditional tavernas, souvenir shops, and cafes. The main streets are crowded with tourists, but venture into the smaller alleys and you'll find quieter, more authentic spots where locals still live and work.

Key areas within Plaka include Anafiotika, a small village-like neighborhood with whitewashed houses, and the Roman Agora, an ancient marketplace.`,
    fullDescriptionEL: `Η Πλάκα είναι γνωστή ως η «Γειτονιά των Θεών» λόγω της εγγύτητάς της στην Ακρόπολη και τους πολλούς αρχαιολογικούς της χώρους. Είναι η παλαιότερη συνοικία της Αθήνας, που κατοικείται συνεχώς για πάνω από 3.000 χρόνια.

Η περιοχή χαρακτηρίζεται από τα στενά, δαιδαλώδη δρομάκια, τα νεοκλασικά σπίτια, τις μικρές εκκλησίες και τα αρχαία ερείπια διάσπαρτα παντού. Είναι μια φιλική προς τους πεζούς περιοχή, όπου μπορείτε να περιπλανηθείτε για ώρες, ανακαλύπτοντας κρυφές γωνιές και γοητευτικά σημεία.

Η Πλάκα είναι διάσημη για τις παραδοσιακές ταβέρνες, τα καταστήματα με σουβενίρ και τα καφέ της. Οι κεντρικοί δρόμοι είναι κατάμεστοι από τουρίστες, αλλά τολμήστε στα μικρότερα σοκάκια και θα βρείτε πιο ήσυχα, πιο αυθεντικά σημεία όπου οι ντόπιοι εξακολουθούν να ζουν και να εργάζονται.

Βασικές περιοχές εντός της Πλάκας περιλαμβάνουν τα Αναφιώτικα, μια μικρή γειτονιά που θυμίζει χωριό με ασπρισμένα σπίτια, και τη Ρωμαϊκή Αγορά.`,
    image: '/images/gallery-1.jpg',
    gallery: [
      '/images/gallery-2.jpg',
      '/images/gallery-6.jpg',
      '/images/guesthouse-room.jpg',
    ],
    details: {
      distanceEN: '5 min walk from The Frogs',
      distanceEL: '5 λεπτά με τα πόδια από το The Frogs',
      timeEN: 'Half day to full day',
      timeEL: 'Μισή έως ολόκληρη ημέρα',
      priceEN: 'Free to explore',
      priceEL: 'Δωρεάν εξερεύνηση',
      hoursEN: 'Always open',
      hoursEL: 'Πάντα ανοιχτά',
      bestTimeEN: 'Any time - great for evening strolls',
      bestTimeEL: 'Οποιαδήποτε στιγμή - υπέροχα για βραδινές βόλτες',
    },
    tipsEN: [
      'Get lost in the small streets - that\'s the charm',
      'Try traditional Greek food at a taverna',
      'Visit the Museum of Greek Folk Instruments',
      'Shop for souvenirs on Adrianou Street',
      'Evening is magical with lights and music',
    ],
    tipsEL: [
      'Χαθείτε στα μικρά σοκάκια - αυτή είναι η γοητεία',
      'Δοκιμάστε παραδοσιακό ελληνικό φαγητό σε μια ταβέρνα',
      'Επισκεφθείτε το Μουσείο Ελληνικών Λαϊκών Μουσικών Οργάνων',
      'Ψωνίστε σουβενίρ στην οδό Αδριανού',
      'Το βράδυ είναι μαγικό με τα φώτα και τη μουσική',
    ],
    nearbyEN: [
      { name: 'Acropolis', distance: '5 min' },
      { name: 'Monastiraki', distance: '10 min' },
      { name: 'Syntagma', distance: '15 min' },
    ],
    nearbyEL: [
      { name: 'Ακρόπολη', distance: '5 λεπτά' },
      { name: 'Μοναστηράκι', distance: '10 λεπτά' },
      { name: 'Σύνταγμα', distance: '15 λεπτά' },
    ],
  },
  'monastiraki': {
    id: 'monastiraki',
    nameEN: 'Monastiraki Flea Market',
    nameEL: 'Παζάρι Μοναστηρακίου',
    subtitleEN: 'Treasure Hunting',
    subtitleEL: 'Κυνήγι Θησαυρού',
    descriptionEN: 'A vibrant marketplace where you can find everything from antiques and souvenirs to local crafts and street food.',
    descriptionEL: 'Μια ζωντανή αγορά όπου μπορείτε να βρείτε τα πάντα, από αντίκες και σουβενίρ μέχρι τοπικά χειροτεχνήματα και street food.',
    fullDescriptionEN: `Monastiraki is one of the most vibrant neighborhoods in Athens, famous for its flea market, antique shops, and bustling atmosphere. The area gets its name from the Pantanassa Church, a small monastery that still stands in the square.

The flea market operates every day, but Sundays are particularly lively when vendors set up stalls selling everything from vintage clothing and antiques to handmade jewelry and souvenirs. It's a treasure hunter's paradise where you can find unique items at bargain prices.

The area is also home to the Monastiraki Metro Station, which features an archaeological exhibit in its concourse, showcasing ruins discovered during the station's construction. Nearby, you'll find the Ancient Agora and the Roman Agora, adding historical depth to your shopping experience.

Street food is a highlight here - try souvlaki, gyros, or loukoumades (Greek donuts) from the many vendors.`,
    fullDescriptionEL: `Το Μοναστηράκι είναι μία από τις πιο ζωντανές γειτονιές της Αθήνας, διάσημη για το παζάρι της, τα παλαιοπωλεία και την έντονη ατμόσφαιρά της. Η περιοχή πήρε το όνομά της από την Εκκλησία της Παντάνασσας, ένα μικρό μοναστήρι που στέκεται ακόμα στην πλατεία.

Η υπαίθρια αγορά λειτουργεί καθημερινά, αλλά οι Κυριακές είναι ιδιαίτερα ζωντανές όταν οι πωλητές στήνουν πάγκους πουλώντας τα πάντα, από vintage ρούχα και αντίκες μέχρι χειροποίητα κοσμήματα και σουβενίρ. Είναι ένας παράδεισος για τους κυνηγούς θησαυρών.

Η περιοχή φιλοξενεί επίσης τον σταθμό του μετρό Μοναστηράκι, ο οποίος διαθέτει μια αρχαιολογική έκθεση, που παρουσιάζει ερείπια που ανακαλύφθηκαν κατά την κατασκευή του σταθμού. Σε κοντινή απόσταση, θα βρείτε την Αρχαία Αγορά και τη Ρωμαϊκή Αγορά.

Το street food είναι ένα από τα highlights εδώ - δοκιμάστε σουβλάκι, γύρο ή λουκουμάδες από τους πολλούς πωλητές.`,
    image: '/images/gallery-3.jpg',
    gallery: [
      '/images/bar-interior.jpg',
      '/images/gallery-5.jpg',
      '/images/contact-coffee.jpg',
    ],
    details: {
      distanceEN: '8 min walk from The Frogs',
      distanceEL: '8 λεπτά με τα πόδια από το The Frogs',
      timeEN: '2-4 hours',
      timeEL: '2-4 ώρες',
      priceEN: 'Free to browse',
      priceEL: 'Δωρεάν περιήγηση',
      hoursEN: 'Shops open 10 AM - 8 PM',
      hoursEL: 'Καταστήματα ανοιχτά 10 π.μ. - 8 μ.μ.',
      bestTimeEN: 'Sunday for the full market',
      bestTimeEL: 'Κυριακή για την πλήρη αγορά',
    },
    tipsEN: [
      'Sunday is the best day for the full market experience',
      'Bargaining is expected in many shops',
      'Try the street food - it\'s delicious and cheap',
      'Watch your belongings in crowded areas',
      'Cash is king for small vendors',
    ],
    tipsEL: [
      'Η Κυριακή είναι η καλύτερη μέρα για την πλήρη εμπειρία της αγοράς',
      'Το παζάρεμα αναμένεται σε πολλά καταστήματα',
      'Δοκιμάστε το street food - είναι νόστιμο και φθηνό',
      'Προσέχετε τα προσωπικά σας αντικείμενα σε περιοχές με συνωστισμό',
      'Τα μετρητά είναι απαραίτητα για τους μικρούς πωλητές',
    ],
    nearbyEN: [
      { name: 'Ancient Agora', distance: '5 min' },
      { name: 'Plaka', distance: '10 min' },
      { name: 'Thissio', distance: '10 min' },
    ],
    nearbyEL: [
      { name: 'Αρχαία Αγορά', distance: '5 λεπτά' },
      { name: 'Πλάκα', distance: '10 λεπτά' },
      { name: 'Θησείο', distance: '10 λεπτά' },
    ],
  },
  'lycabettus': {
    id: 'lycabettus',
    nameEN: 'Mount Lycabettus',
    nameEL: 'Λυκαβηττός',
    subtitleEN: 'Panoramic Views',
    subtitleEL: 'Πανοραμική Θέα',
    descriptionEN: 'The highest point in Athens offering breathtaking 360° views of the city, especially magical at sunset.',
    descriptionEL: 'Το υψηλότερο σημείο της Αθήνας που προσφέρει εκπληκτική θέα 360° στην πόλη, ιδιαίτερα μαγικό κατά το ηλιοβασίλεμα.',
    fullDescriptionEN: `Mount Lycabettus, also known as Lycabettus Hill, is a Cretaceous limestone hill in the center of Athens. At 277 meters (908 feet) above sea level, its summit is the highest point in Central Athens and offers panoramic views of the entire city.

According to legend, the hill was created when Athena accidentally dropped a limestone mountain she was carrying for the construction of the Acropolis. The name "Lycabettus" means "the one walked by wolves" in ancient Greek.

At the top of the hill stands the Chapel of St. George, a whitewashed church that is particularly popular for weddings and baptisms. There's also a restaurant and café where you can enjoy a meal or drink with a view.

You can reach the summit by walking up the winding path (about 20-30 minutes), or take the funicular railway from Aristippou Street. The funicular runs through a tunnel inside the hill, emerging near the top.`,
    fullDescriptionEL: `Ο Λυκαβηττός είναι ένας λόφος από ασβεστόλιθο στο κέντρο της Αθήνας. Στα 277 μέτρα πάνω από την επιφάνεια της θάλασσας, η κορυφή του είναι το υψηλότερο σημείο στην Κεντρική Αθήνα και προσφέρει πανοραμική θέα σε ολόκληρη την πόλη.

Σύμφωνα με το θρύλο, ο λόφος δημιουργήθηκε όταν η Αθηνά έριξε κατά λάθος ένα ασβεστολιθικό βουνό που μετέφερε για την κατασκευή της Ακρόπολης. Το όνομα «Λυκαβηττός» σημαίνει «αυτός στον οποίο περπατούν οι λύκοι».

Στην κορυφή του λόφου βρίσκεται το εκκλησάκι του Αγίου Γεωργίου, μια ασπρισμένη εκκλησία που είναι ιδιαίτερα δημοφιλής για γάμους και βαπτίσεις. Υπάρχει επίσης εστιατόριο και καφέ όπου μπορείτε να απολαύσετε ένα γεύμα ή ποτό με θέα.

Μπορείτε να φτάσετε στην κορυφή περπατώντας το δαιδαλώδες μονοπάτι (περίπου 20-30 λεπτά), ή να πάρετε το τελεφερίκ από την οδό Αριστίππου.`,
    image: '/images/rooftop-skyline.jpg',
    gallery: [
      '/images/gallery-4.jpg',
      '/images/reservation-room.jpg',
      '/images/gallery-2.jpg',
    ],
    details: {
      distanceEN: '20 min walk from The Frogs',
      distanceEL: '20 λεπτά με τα πόδια από το The Frogs',
      timeEN: '1-2 hours',
      timeEL: '1-2 ώρες',
      priceEN: 'Free (€7 funicular round trip)',
      priceEL: 'Δωρεάν (€7 τελεφερίκ με επιστροφή)',
      hoursEN: 'Always open',
      hoursEL: 'Πάντα ανοιχτά',
      bestTimeEN: 'Sunset for the best views',
      bestTimeEL: 'Ηλιοβασίλεμα για την καλύτερη θέα',
    },
    tipsEN: [
      'Take the funicular up and walk down for the best experience',
      'Sunset is the most popular time - arrive early',
      'Bring a jacket - it gets windy at the top',
      'The restaurant requires reservations for dinner',
      'Perfect spot for photography',
    ],
    tipsEL: [
      'Πάρτε το τελεφερίκ για να ανεβείτε και κατεβείτε με τα πόδια για την καλύτερη εμπειρία',
      'Το ηλιοβασίλεμα είναι η πιο δημοφιλής ώρα - φτάστε νωρίς',
      'Πάρτε ένα μπουφάν - έχει αέρα στην κορυφή',
      'Το εστιατόριο απαιτεί κράτηση για δείπνο',
      'Ιδανικό σημείο για φωτογραφίες',
    ],
    nearbyEN: [
      { name: 'Kolonaki', distance: '10 min' },
      { name: 'National Garden', distance: '15 min' },
      { name: 'Syntagma', distance: '20 min' },
    ],
    nearbyEL: [
      { name: 'Κολωνάκι', distance: '10 λεπτά' },
      { name: 'Εθνικός Κήπος', distance: '15 λεπτά' },
      { name: 'Σύνταγμα', distance: '20 λεπτά' },
    ],
  },
  'national-museum': {
    id: 'national-museum',
    nameEN: 'National Archaeological Museum',
    nameEL: 'Εθνικό Αρχαιολογικό Μουσείο',
    subtitleEN: 'Ancient Treasures',
    subtitleEL: 'Αρχαίοι Θησαυροί',
    descriptionEN: 'One of the world\'s most important museums, housing an extensive collection of ancient Greek artifacts.',
    descriptionEL: 'Ένα από τα σημαντικότερα μουσεία του κόσμου, που στεγάζει μια εκτενή συλλογή αρχαίων ελληνικών αντικειμένων.',
    fullDescriptionEN: `The National Archaeological Museum in Athens houses some of the most important artifacts from a variety of archaeological locations around Greece from prehistory to late antiquity. It is considered one of the greatest museums in the world and contains the richest collection of artifacts from Greek antiquity worldwide.

The museum was completed in 1889 and originally housed the collection of the Archaeological Society. Today, it contains over 11,000 exhibits, providing a comprehensive overview of Greek civilization from the beginnings of Prehistory to Late Antiquity.

Highlights include the Mask of Agamemnon, the Antikythera Mechanism (the world's oldest analog computer), the bronze statue of Zeus or Poseidon, and the frescoes from Akrotiri on Santorini. The Mycenaean collection is particularly impressive, featuring gold death masks, weapons, and jewelry.

The museum is organized thematically across multiple floors, with collections dedicated to prehistoric antiquities, sculpture, metalwork, vases and minor arts, Egyptian antiquities, and Cypriot antiquities.`,
    fullDescriptionEL: `Το Εθνικό Αρχαιολογικό Μουσείο στην Αθήνα στεγάζει μερικά από τα σημαντικότερα ευρήματα από διάφορες αρχαιολογικές τοποθεσίες σε όλη την Ελλάδα. Θεωρείται ένα από τα μεγαλύτερα μουσεία στον κόσμο και περιέχει την πλουσιότερη συλλογή αντικειμένων της ελληνικής αρχαιότητας παγκοσμίως.

Το μουσείο ολοκληρώθηκε το 1889. Σήμερα, περιλαμβάνει πάνω από 11.000 εκθέματα, παρέχοντας μια ολοκληρωμένη επισκόπηση του ελληνικού πολιτισμού από τις απαρχές της Προϊστορίας έως την Ύστερη Αρχαιότητα.

Τα σημαντικότερα εκθέματα περιλαμβάνουν τη Μάσκα του Αγαμέμνονα, τον Μηχανισμό των Αντικυθήρων, το χάλκινο άγαλμα του Δία ή του Ποσειδώνα και τις τοιχογραφίες από το Ακρωτήρι της Σαντορίνης. Η Μυκηναϊκή συλλογή είναι ιδιαίτερα εντυπωσιακή, με χρυσές νεκρικές μάσκες, όπλα και κοσμήματα.`,
    image: '/images/gallery-2.jpg',
    gallery: [
      '/images/guesthouse-room.jpg',
      '/images/gallery-6.jpg',
      '/images/reservation-room.jpg',
    ],
    details: {
      distanceEN: '25 min walk from The Frogs',
      distanceEL: '25 λεπτά με τα πόδια από το The Frogs',
      timeEN: '2-4 hours',
      timeEL: '2-4 ώρες',
      priceEN: '€12 (€6 reduced)',
      priceEL: '€12 (€6 μειωμένο)',
      hoursEN: '8:00 AM - 8:00 PM (Tue-Sun)',
      hoursEL: '8:00 π.μ. - 8:00 μ.μ. (Τρ-Κυρ)',
      bestTimeEN: 'Weekday mornings are quieter',
      bestTimeEL: 'Τα πρωινά των καθημερινών είναι πιο ήσυχα',
    },
    tipsEN: [
      'Audio guides are available in multiple languages',
      'The café on the second floor has a nice courtyard',
      'Free admission on first Sunday of each month (Nov-Mar)',
      'Plan at least 2 hours for a quick visit',
      'The gift shop has excellent reproductions',
    ],
    tipsEL: [
      'Διατίθενται ακουστικοί οδηγοί σε πολλές γλώσσες',
      'Το καφέ στον δεύτερο όροφο έχει μια ωραία αυλή',
      'Δωρεάν είσοδος την πρώτη Κυριακή κάθε μήνα (Νοέ-Μάρ)',
      'Προγραμματίστε τουλάχιστον 2 ώρες για μια σύντομη επίσκεψη',
      'Το πωλητήριο έχει εξαιρετικές αναπαραγωγές',
    ],
    nearbyEN: [
      { name: 'Exarcheia', distance: '10 min' },
      { name: 'Omonia Square', distance: '15 min' },
      { name: 'Polytechnic University', distance: '5 min' },
    ],
    nearbyEL: [
      { name: 'Εξάρχεια', distance: '10 λεπτά' },
      { name: 'Ομόνοια', distance: '15 λεπτά' },
      { name: 'Πολυτεχνείο', distance: '5 λεπτά' },
    ],
  },
  'syntagma': {
    id: 'syntagma',
    nameEN: 'Syntagma Square',
    nameEL: 'Πλατεία Συντάγματος',
    subtitleEN: 'Heart of the City',
    subtitleEL: 'Η Καρδιά της Πόλης',
    descriptionEN: 'The central square of Athens, home to the Hellenic Parliament and the famous Changing of the Guard ceremony.',
    descriptionEL: 'Η κεντρική πλατεία της Αθήνας, έδρα του Ελληνικού Κοινοβουλίου και της διάσημης τελετής Αλλαγής της Φρουράς.',
    fullDescriptionEN: `Syntagma Square (Constitution Square) is the central square of Athens. The square is named after the Constitution that Otto, the first King of Greece, was obliged to grant after a popular and military uprising on 3 September 1843.

The square is dominated by the Old Royal Palace, which has housed the Hellenic Parliament since 1934. In front of the Parliament building stands the Tomb of the Unknown Soldier, guarded by the Evzones, the presidential guard in their distinctive traditional uniforms.

The Changing of the Guard ceremony takes place every hour on the hour, with a more elaborate ceremony on Sundays at 11 AM. It's a popular tourist attraction and offers a glimpse into Greek tradition and pageantry.

Syntagma is also the city's main transportation hub, with the Syntagma Metro Station serving as a major interchange. The square is surrounded by hotels, shops, and cafes, making it a bustling center of activity day and night.`,
    fullDescriptionEL: `Η Πλατεία Συντάγματος είναι η κεντρική πλατεία της Αθήνας. Η πλατεία πήρε το όνομά της από το Σύνταγμα που ο Όθων, ο πρώτος βασιλιάς της Ελλάδας, υποχρεώθηκε να παραχωρήσει μετά από λαϊκή και στρατιωτική εξέγερση στις 3 Σεπτεμβρίου 1843.

Στην πλατεία δεσπόζει το Παλαιό Παλάτι, το οποίο στεγάζει τη Βουλή των Ελλήνων από το 1934. Μπροστά από το κτίριο της Βουλής βρίσκεται το Μνημείο του Άγνωστου Στρατιώτη, το οποίο φυλάσσεται από τους Εύζωνες.

Η τελετή αλλαγής φρουράς πραγματοποιείται κάθε ώρα, με μια πιο επίσημη τελετή τις Κυριακές στις 11 π.μ. Είναι ένα δημοφιλές τουριστικό αξιοθέατο.

Το Σύνταγμα είναι επίσης ο κύριος συγκοινωνιακός κόμβος της πόλης, με τον σταθμό του μετρό Σύνταγμα.`,
    image: '/images/gallery-4.jpg',
    gallery: [
      '/images/gallery-1.jpg',
      '/images/rooftop-skyline.jpg',
      '/images/hero-athens-bar.jpg',
    ],
    details: {
      distanceEN: '12 min walk from The Frogs',
      distanceEL: '12 λεπτά με τα πόδια από το The Frogs',
      timeEN: '1 hour',
      timeEL: '1 ώρα',
      priceEN: 'Free',
      priceEL: 'Δωρεάν',
      hoursEN: 'Always open',
      hoursEL: 'Πάντα ανοιχτά',
      bestTimeEN: 'Sunday 11 AM for the full ceremony',
      bestTimeEL: 'Κυριακή 11 π.μ. για την πλήρη τελετή',
    },
    tipsEN: [
      'Arrive 15 minutes early for a good viewing spot',
      'The Sunday ceremony is the most elaborate',
      'Combine with a visit to the National Garden',
      'Great people-watching spot at the cafes',
      'Metro station has archaeological exhibits',
    ],
    tipsEL: [
      'Φτάστε 15 λεπτά νωρίτερα για μια καλή θέση θέασης',
      'Η τελετή της Κυριακής είναι η πιο επίσημη',
      'Συνδυάστε την με μια επίσκεψη στον Εθνικό Κήπο',
      'Εξαιρετικό σημείο για να παρατηρήσετε τον κόσμο στα καφέ',
      'Ο σταθμός του μετρό έχει αρχαιολογικά εκθέματα',
    ],
    nearbyEN: [
      { name: 'National Garden', distance: '5 min' },
      { name: 'Ermou Street', distance: '2 min' },
      { name: 'Plaka', distance: '10 min' },
    ],
    nearbyEL: [
      { name: 'Εθνικός Κήπος', distance: '5 λεπτά' },
      { name: 'Οδός Ερμού', distance: '2 λεπτά' },
      { name: 'Πλάκα', distance: '10 λεπτά' },
    ],
  },
  'anafiotika': {
    id: 'anafiotika',
    nameEN: 'Anafiotika',
    nameEL: 'Αναφιώτικα',
    subtitleEN: 'Hidden Village',
    subtitleEL: 'Κρυμμένο Χωριό',
    descriptionEN: 'A secret village-like neighborhood under the Acropolis with whitewashed houses and narrow alleys reminiscent of the Greek islands.',
    descriptionEL: 'Μια μυστική γειτονιά που θυμίζει χωριό κάτω από την Ακρόπολη, με ασπρισμένα σπίτια και στενά σοκάκια που θυμίζουν ελληνικά νησιά.',
    fullDescriptionEN: `Anafiotika is a scenic tiny neighborhood of Athens, part of the old historical neighborhood called Plaka. It lies in the northeast side of the Acropolis hill. The first houses were built in the era of Otto of Greece, when workers from the island of Anafi came to Athens to work as builders in the construction of the King's Palace.

The neighborhood is built according to the Cycladic architecture, with whitewashed walls, flat roofs, and colorful doors and windows. It's a peaceful oasis in the heart of bustling Athens, where cats lounge in the sun and bougainvillea cascades over walls.

Walking through Anafiotika feels like being transported to a Greek island. The narrow, winding paths are too small for cars, creating a pedestrian paradise. You'll find small churches, traditional houses, and stunning views of the city below.

Despite its central location, Anafiotika remains relatively unknown to many tourists, making it a hidden gem for those who discover it. It's particularly beautiful in the late afternoon when the light turns golden.`,
    fullDescriptionEL: `Τα Αναφιώτικα είναι μια γραφική μικροσκοπική γειτονιά της Αθήνας, μέρος της Πλάκας. Βρίσκεται στη βορειοανατολική πλευρά του λόφου της Ακρόπολης. Τα πρώτα σπίτια χτίστηκαν στην εποχή του Όθωνα, όταν εργάτες από το νησί της Ανάφης ήρθαν στην Αθήνα για να εργαστούν στην ανοικοδόμηση της πόλης.

Η γειτονιά είναι χτισμένη σύμφωνα με την κυκλαδίτικη αρχιτεκτονική, με ασπρισμένους τοίχους, επίπεδες στέγες και χρωματιστές πόρτες και παράθυρα. Είναι μια ειρηνική όαση στην καρδιά της πολυσύχναστης Αθήνας.

Το περπάτημα στα Αναφιώτικα δίνει την αίσθηση μεταφοράς σε ένα ελληνικό νησί. Τα στενά, δαιδαλώδη μονοπάτια είναι πολύ μικρά για αυτοκίνητα.

Παρά την κεντρική του τοποθεσία, τα Αναφιώτικα παραμένουν σχετικά άγνωστα σε πολλούς τουρίστες, καθιστώντας τα ένα κρυμμένο διαμάντι.`,
    image: '/images/gallery-6.jpg',
    gallery: [
      '/images/gallery-2.jpg',
      '/images/guesthouse-room.jpg',
      '/images/gallery-4.jpg',
    ],
    details: {
      distanceEN: '10 min walk from The Frogs',
      distanceEL: '10 λεπτά με τα πόδια από το The Frogs',
      timeEN: '1-2 hours',
      timeEL: '1-2 ώρες',
      priceEN: 'Free',
      priceEL: 'Δωρεάν',
      hoursEN: 'Always open',
      hoursEL: 'Πάντα ανοιχτά',
      bestTimeEN: 'Late afternoon for golden light',
      bestTimeEL: 'Αργά το απόγευμα για το χρυσό φως',
    },
    tipsEN: [
      'Get lost in the maze-like alleys',
      'Perfect for Instagram photos',
      'Very quiet in the early morning',
      'Combine with a visit to the Acropolis',
      'Respect the residents - people live here',
    ],
    tipsEL: [
      'Χαθείτε στα δαιδαλώδη σοκάκια',
      'Ιδανικό για φωτογραφίες στο Instagram',
      'Πολύ ήσυχα νωρίς το πρωί',
      'Συνδυάστε το με μια επίσκεψη στην Ακρόπολη',
      'Σεβαστείτε τους κατοίκους - εδώ μένουν άνθρωποι',
    ],
    nearbyEN: [
      { name: 'Acropolis', distance: '5 min' },
      { name: 'Plaka', distance: '2 min' },
      { name: 'Roman Agora', distance: '5 min' },
    ],
    nearbyEL: [
      { name: 'Ακρόπολη', distance: '5 λεπτά' },
      { name: 'Πλάκα', distance: '2 λεπτά' },
      { name: 'Ρωμαϊκή Αγορά', distance: '5 λεπτά' },
    ],
  },
  'gazi': {
    id: 'gazi',
    nameEN: 'Gazi & Technopolis',
    nameEL: 'Γκάζι & Τεχνόπολις',
    subtitleEN: 'Nightlife Hub',
    subtitleEL: 'Κέντρο Νυχτερινής Ζωής',
    descriptionEN: 'The former gasworks turned cultural center, now Athens\' trendiest nightlife and dining district.',
    descriptionEL: 'Το πρώην εργοστάσιο φωταερίου που μετατράπηκε σε πολιτιστικό κέντρο, τώρα η πιο μοντέρνα περιοχή νυχτερινής ζωής και εστίασης της Αθήνας.',
    fullDescriptionEN: `Gazi is a neighborhood in Athens, Greece, surrounding the old Athens gasworks, which is now the Technopolis cultural complex. The area has been transformed from an industrial zone into one of the city's most vibrant nightlife and entertainment districts.

Technopolis, the former gasworks, has been converted into a major cultural venue hosting concerts, exhibitions, and festivals throughout the year. The industrial architecture has been preserved, creating a unique backdrop for cultural events. The complex includes museums, theaters, and event spaces.

The surrounding Gazi neighborhood is packed with bars, restaurants, and clubs that come alive after dark. It's particularly popular with young Athenians and offers a more contemporary alternative to the traditional tavernas of Plaka. The area is also known for its LGBTQ+ friendly venues.

During the day, Gazi is quieter but still worth exploring for its street art, industrial heritage, and the Benaki Museum branch located in the area. The nearby Kerameikos archaeological site adds historical interest.`,
    fullDescriptionEL: `Το Γκάζι είναι μια γειτονιά της Αθήνας γύρω από το παλιό εργοστάσιο φωταερίου, που τώρα είναι το πολιτιστικό συγκρότημα Τεχνόπολις. Η περιοχή έχει μετατραπεί από βιομηχανική ζώνη σε μία από τις πιο ζωντανές περιοχές νυχτερινής ζωής και ψυχαγωγίας της πόλης.

Η Τεχνόπολις έχει μετατραπεί σε έναν σημαντικό πολιτιστικό χώρο που φιλοξενεί συναυλίες, εκθέσεις και φεστιβάλ καθ' όλη τη διάρκεια του έτους. Η βιομηχανική αρχιτεκτονική έχει διατηρηθεί.

Η γύρω γειτονιά είναι γεμάτη με μπαρ, εστιατόρια και κλαμπ που ζωντανεύουν μετά το σκοτάδι. Είναι ιδιαίτερα δημοφιλής στους νέους Αθηναίους και προσφέρει μια πιο σύγχρονη εναλλακτική λύση.

Κατά τη διάρκεια της ημέρας, το Γκάζι είναι πιο ήσυχο αλλά αξίζει ακόμα να το εξερευνήσετε για το street art και τη βιομηχανική του κληρονομιά.`,
    image: '/images/bar-interior.jpg',
    gallery: [
      '/images/Th_Frogs_86.jpg',
      '/images/Th_Frogs_94.jpg',
      '/images/Th_Frogs_96.jpg',
    ],
    details: {
      distanceEN: '15 min walk from The Frogs',
      distanceEL: '15 λεπτά με τα πόδια από το The Frogs',
      timeEN: 'Evening to late night',
      timeEL: 'Από το βράδυ μέχρι αργά τη νύχτα',
      priceEN: 'Varies by venue',
      priceEL: 'Ποικίλλει ανάλογα με το χώρο',
      hoursEN: 'Venues open from 8 PM',
      hoursEL: 'Οι χώροι ανοίγουν από τις 8 μ.μ.',
      bestTimeEN: 'Weekend nights for the full experience',
      bestTimeEL: 'Τα βράδια του Σαββατοκύριακου για την πλήρη εμπειρία',
    },
    tipsEN: [
      'Start with dinner and stay for drinks',
      'Many venues have live music',
      'Technopolis hosts great events - check their schedule',
      'The area is very safe but can get crowded',
      'Metro station makes it easy to get home',
    ],
    tipsEL: [
      'Ξεκινήστε με δείπνο και μείνετε για ποτό',
      'Πολλοί χώροι έχουν ζωντανή μουσική',
      'Η Τεχνόπολις φιλοξενεί εξαιρετικές εκδηλώσεις - ελέγξτε το πρόγραμμά τους',
      'Η περιοχή είναι πολύ ασφαλής αλλά μπορεί να έχει συνωστισμό',
      'Ο σταθμός του μετρό καθιστά εύκολη την επιστροφή στο σπίτι',
    ],
    nearbyEN: [
      { name: 'Kerameikos', distance: '5 min' },
      { name: 'Thissio', distance: '10 min' },
      { name: 'Monastiraki', distance: '15 min' },
    ],
    nearbyEL: [
      { name: 'Κεραμεικός', distance: '5 λεπτά' },
      { name: 'Θησείο', distance: '10 λεπτά' },
      { name: 'Μοναστηράκι', distance: '15 λεπτά' },
    ],
  },
};

const relatedSights = [
  { id: 'acropolis', nameEN: 'The Acropolis', nameEL: 'Η Ακρόπολη', image: '/images/hero-athens-bar.jpg' },
  { id: 'plaka', nameEN: 'Plaka', nameEL: 'Πλάκα', image: '/images/gallery-1.jpg' },
  { id: 'monastiraki', nameEN: 'Monastiraki', nameEL: 'Μοναστηράκι', image: '/images/gallery-3.jpg' },
  { id: 'lycabettus', nameEN: 'Mount Lycabettus', nameEL: 'Λυκαβηττός', image: '/images/rooftop-skyline.jpg' },
];

export default function AthensDetail() {
  const params = useParams<{ sightId: string }>();
  const sightId = params?.sightId;
  const router = useRouter();
  const { t, language } = useLanguage();
  const sight = sightId ? sightsData[sightId as keyof typeof sightsData] : null;

  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sight) return;

    const ctx = gsap.context(() => {
      // Hero animation
      const heroTitle = heroRef.current?.querySelector('.hero-title');
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
          }
        );
      }

      // Content animations
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.querySelector('.content-main'),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          contentRef.current.querySelectorAll('.detail-card'),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contentRef.current.querySelector('.details-grid'),
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Gallery animation
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current.querySelectorAll('.gallery-item'),
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: galleryRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Tips animation
      if (tipsRef.current) {
        gsap.fromTo(
          tipsRef.current.querySelectorAll('.tip-item'),
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tipsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Related sights animation
      if (relatedRef.current) {
        gsap.fromTo(
          relatedRef.current.querySelectorAll('.related-card'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: relatedRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [sight]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [sightId]);

  if (!sight) {
    return (
      <div className="min-h-screen bg-frogs-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-4xl text-frogs-text-light mb-4">
            {t("Sight Not Found", "Το αξιοθέατο δεν βρέθηκε")}
          </h2>
          <Link href="/athens" className="btn-primary">
            {t("View All Sights", "Προβολή όλων")}
          </Link>
        </div>
      </div>
    );
  }

  const otherRelated = relatedSights.filter(s => s.id !== sight.id).slice(0, 3);

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <div ref={heroRef} className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={sight.image}
            alt={t(sight.nameEN, sight.nameEL)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-frogs-dark/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/30 to-transparent" />
        </div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-frogs-text-light/80 hover:text-frogs-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body text-sm">{t("Back", "Πίσω")}</span>
            </button>
            <Link href="/athens" className="text-frogs-text-light/80 hover:text-frogs-gold transition-colors font-body text-sm">
              {t("All Sights", "Όλα τα αξιοθέατα")}
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 z-10">
          <div className="max-w-4xl">
            <span className="label-micro text-frogs-gold mb-4 block">
              {t(sight.subtitleEN, sight.subtitleEL).toUpperCase()}
            </span>
            <h1 className="hero-title font-display text-5xl lg:text-8xl text-frogs-text-light mb-6">
              {t(sight.nameEN, sight.nameEL).toUpperCase()}
            </h1>
            <p className="font-body text-lg text-frogs-text-light/80 max-w-xl">
              {t(sight.descriptionEN, sight.descriptionEL)}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div ref={contentRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="content-main">
                <h2 className="font-display text-3xl lg:text-4xl text-frogs-text-light mb-8">
                  {t("ABOUT", "ΣΧΕΤΙΚΑ")}
                </h2>
                <div className="prose prose-invert max-w-none">
                  {t(sight.fullDescriptionEN, sight.fullDescriptionEL).split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="font-body text-frogs-text-light/70 leading-relaxed mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Gallery */}
              <div ref={galleryRef} className="mt-16">
                <h3 className="font-display text-2xl lg:text-3xl text-frogs-text-light mb-8">
                  {t("GALLERY", "ΓΚΑΛΕΡΙ")}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {sight.gallery.map((img, index) => (
                    <div
                      key={index}
                      className={`gallery-item relative overflow-hidden rounded-xl ${index === 0 ? 'col-span-2 row-span-2' : ''
                        }`}
                    >
                      <div className={index === 0 ? 'aspect-square' : 'aspect-[4/3]'}>
                        <img
                          src={img}
                          alt={`${t(sight.nameEN, sight.nameEL)} - view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div ref={tipsRef} className="mt-16">
                <h3 className="font-display text-2xl lg:text-3xl text-frogs-text-light mb-8">
                  {t("VISITOR TIPS", "ΣΥΜΒΟΥΛΕΣ ΕΠΙΣΚΕΠΤΩΝ")}
                </h3>
                <div className="space-y-4">
                  {(language === 'GR' ? sight.tipsEL : sight.tipsEN).map((tip: string, index: number) => (
                    <div
                      key={index}
                      className="tip-item flex items-start gap-4 p-4 rounded-xl bg-frogs-dark/50 border border-frogs-border/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-frogs-gold/10 flex items-center justify-center flex-shrink-0">
                        <Info className="w-4 h-4 text-frogs-gold" />
                      </div>
                      <p className="font-body text-frogs-text-light/70">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Details Card */}
                <div className="p-6 rounded-2xl bg-frogs-gold/5 border border-frogs-gold/20">
                  <h3 className="label-micro text-frogs-gold mb-6">{t("VISIT INFO", "ΠΛΗΡΟΦΟΡΙΕΣ ΕΠΙΣΚΕΨΗΣ")}</h3>
                  <div className="details-grid space-y-4">
                    <div className="detail-card flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-frogs-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-body text-sm text-frogs-text-light/50">{t("Distance", "Απόσταση")}</p>
                        <p className="font-body text-frogs-text-light">{t(sight.details.distanceEN, sight.details.distanceEL)}</p>
                      </div>
                    </div>
                    <div className="detail-card flex items-start gap-3">
                      <Clock className="w-5 h-5 text-frogs-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-body text-sm text-frogs-text-light/50">{t("Duration", "Διάρκεια")}</p>
                        <p className="font-body text-frogs-text-light">{t(sight.details.timeEN, sight.details.timeEL)}</p>
                      </div>
                    </div>
                    <div className="detail-card flex items-start gap-3">
                      <Euro className="w-5 h-5 text-frogs-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-body text-sm text-frogs-text-light/50">{t("Price", "Τιμή")}</p>
                        <p className="font-body text-frogs-text-light">{t(sight.details.priceEN, sight.details.priceEL)}</p>
                      </div>
                    </div>
                    <div className="detail-card flex items-start gap-3">
                      <Sun className="w-5 h-5 text-frogs-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-body text-sm text-frogs-text-light/50">{t("Hours", "Ωράριο")}</p>
                        <p className="font-body text-frogs-text-light">{t(sight.details.hoursEN, sight.details.hoursEL)}</p>
                      </div>
                    </div>
                    <div className="detail-card flex items-start gap-3">
                      <Camera className="w-5 h-5 text-frogs-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-body text-sm text-frogs-text-light/50">{t("Best Time", "Καλύτερη Ώρα")}</p>
                        <p className="font-body text-frogs-text-light">{t(sight.details.bestTimeEN, sight.details.bestTimeEL)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nearby Card */}
                <div className="p-6 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10">
                  <h3 className="label-micro text-frogs-gold mb-6">{t("NEARBY", "ΚΟΝΤΑ")}</h3>
                  <div className="space-y-3">
                    {(language === 'GR' ? sight.nearbyEL : sight.nearbyEN).map((place: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-body text-frogs-text-light">{place.name}</span>
                        <span className="font-body text-sm text-frogs-text-light/50">{place.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Card */}
                <div className="p-6 rounded-2xl bg-frogs-dark/50 border border-frogs-border/10">
                  <p className="font-body text-sm text-frogs-text-light/60 mb-4">
                    {t("Stay at The Frogs and explore Athens from the perfect location.", "Μείνετε στο The Frogs και εξερευνήστε την Αθήνα από την ιδανική τοποθεσία.")}
                  </p>
                  <a
                    href="https://thefrogsguesthouse.reserve-online.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full justify-center"
                  >
                    {t("Book Your Stay", "Κάντε Κράτηση")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Sights */}
      <div ref={relatedRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-micro text-frogs-gold mb-4 block">{t("MORE TO EXPLORE", "ΠΕΡΙΣΣΟΤΕΡΑ")}</span>
            <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light">
              {t("RELATED SIGHTS", "ΣΧΕΤΙΚΑ ΑΞΙΟΘΕΑΤΑ")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherRelated.map((related) => (
              <Link key={related.id}
                href={`/athens/${related.id}`}
                className="related-card group relative overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={related.image}
                    alt={t(related.nameEN, related.nameEL)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl text-frogs-text-light group-hover:text-frogs-gold transition-colors">
                    {t(related.nameEN, related.nameEL).toUpperCase()}
                  </h3>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-frogs-gold/0 border border-frogs-text-light/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-frogs-gold group-hover:border-frogs-gold transition-all">
                  <ArrowRight className="w-5 h-5 text-frogs-text-light group-hover:text-frogs-dark" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
