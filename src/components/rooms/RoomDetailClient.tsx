"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
    ChevronLeft, ChevronRight, Users, Maximize, Check,
    ArrowLeft, Bed, Bath, Wifi, Wind, Coffee, Sparkles, X, ArrowRight,
    Tv, Refrigerator, ShowerHead, VolumeX, Sun, Lock, BellRing,
    Martini, Plane, ConciergeBell, Ban, Luggage, Building2, Utensils
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

const AMENITY_ICONS: Record<string, React.ElementType> = {
    Wifi, Wind, Coffee, Sparkles, Bed, Bath,
    Tv, Refrigerator, ShowerHead, VolumeX, Sun, Lock, BellRing,
    Martini, Plane, ConciergeBell, Ban, Luggage, Building2, Utensils
};

type RoomImage = { id: string; url: string; order: number };
type RoomAmenity = { id: string; nameEN: string | null; nameEL: string; icon: string | null };
type RoomFacility = { id: string; nameEN: string | null; nameEL: string; icon: string | null };
type Room = {
    id: string;
    slug: string;
    name: string;
    nameEN: string | null;
    nameEL: string | null;
    descriptionEN: string | null;
    descriptionEL: string | null;
    sleeps: number;
    squareMeters: number | null;
    startingFrom: number | null;
    featuredImage: string | null;
    images: RoomImage[];
    amenities: RoomAmenity[];
    facilities: RoomFacility[];
};
type RelatedRoom = { slug: string; name: string; nameEN?: string | null; nameEL?: string | null; featuredImage: string | null };

export default function RoomDetailClient({
    room,
    relatedRooms,
}: {
    room: Room;
    relatedRooms: RelatedRoom[];
}) {
    const router = useRouter();
    const { t } = useLanguage();
    const heroRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const relatedRef = useRef<HTMLDivElement>(null);

    const allImages = room.images.length > 0
        ? room.images.map(i => i.url)
        : room.featuredImage
            ? [room.featuredImage]
            : ['/images/guesthouse-room.jpg'];

    const [currentImage, setCurrentImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const heroTitle = heroRef.current?.querySelector('.hero-title');
            if (heroTitle) {
                gsap.fromTo(heroTitle, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
            }
            if (infoRef.current) {
                gsap.fromTo(
                    infoRef.current.querySelector('.info-header'),
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: infoRef.current, start: 'top 75%' } }
                );
                gsap.fromTo(
                    infoRef.current.querySelectorAll('.info-card'),
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: infoRef.current, start: 'top 65%' } }
                );
                gsap.fromTo(
                    infoRef.current.querySelectorAll('.facility-item'),
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, stagger: 0.03, ease: 'power2.out', scrollTrigger: { trigger: infoRef.current.querySelector('.facilities-grid'), start: 'top 80%' } }
                );
            }
            if (galleryRef.current) {
                gsap.fromTo(galleryRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: galleryRef.current, start: 'top 75%' } });
            }
            if (relatedRef.current) {
                gsap.fromTo(
                    relatedRef.current.querySelectorAll('.related-card'),
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: relatedRef.current, start: 'top 75%' } }
                );
            }
        });
        return () => ctx.revert();
    }, [room]);

    useEffect(() => {
        window.scrollTo(0, 0);
        setCurrentImage(0);
    }, [room.slug]);

    const price = room.startingFrom ? t(`From €${room.startingFrom}/night`, `Από €${room.startingFrom}/νύχτα`) : null;

    return (
        <div className="min-h-screen bg-[#2A2D25]">
            {/* Hero Section */}
            <div ref={heroRef} className="relative h-screen overflow-hidden">
                <div className="absolute inset-0">
                    {allImages.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-all duration-1000 ${index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                }`}
                        >
                            <img src={img} alt={t(`${room.nameEN || room.name} - View ${index + 1}`, `${room.nameEL || room.name} - Άποψη ${index + 1}`)} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25] via-[#2A2D25]/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2A2D25]/60 to-transparent" />
                </div>

                {/* Nav */}
                <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 z-20">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-[#F9F6EF]/80 hover:text-[#C9A84C] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-body text-sm">{t("Back", "Πίσω")}</span>
                        </button>
                        <Link href="/rooms" className="text-[#F9F6EF]/80 hover:text-[#C9A84C] transition-colors font-body text-sm">
                            {t("All Rooms", "Όλα τα Δωμάτια")}
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 z-10">
                    <div className="max-w-4xl">
                        <h1 className="hero-title font-display text-5xl lg:text-8xl text-[#F9F6EF] mb-6">
                            {t(room.nameEN || room.name, room.nameEL || room.name).toUpperCase()}
                        </h1>
                        {(room.descriptionEN || room.descriptionEL) && (
                            <p className="font-body text-lg text-[#F9F6EF]/80 max-w-xl mb-8">
                                {t(room.descriptionEN, room.descriptionEL)?.slice(0, 150)}...
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-6 mb-8">
                            {room.squareMeters && (
                                <div className="flex items-center gap-2 text-[#F9F6EF]/70">
                                    <Maximize className="w-5 h-5" />
                                    <span className="font-body">{room.squareMeters} m²</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[#F9F6EF]/70">
                                <Users className="w-5 h-5" />
                                <span className="font-body">{t(`Up to ${room.sleeps} guests`, `Έως ${room.sleeps} άτομα`)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#F9F6EF]/70">
                                <Bed className="w-5 h-5" />
                                <span className="font-body">{t("King Bed", "King Κρεβάτι")}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://thefrogsguesthouse.reserve-online.net/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary"
                            >
                                {price ? `${t("Book Now", "Κάντε Κράτηση")} — ${price}` : t('Book Now', 'Κάντε Κράτηση')}
                            </a>
                            <button onClick={() => { setLightboxIndex(currentImage); setLightboxOpen(true); }} className="btn-secondary">
                                {t("View Gallery", "Δείτε την Γκαλερί")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Image Nav */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
                        <button
                            onClick={() => setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length)}
                            className="w-12 h-12 rounded-full bg-[#2A2D25]/50 backdrop-blur-sm border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:border-[#C9A84C] hover:text-[#2A2D25] transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex gap-2">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImage(i)}
                                    className={`h-2 rounded-full transition-all ${i === currentImage ? 'bg-[#C9A84C] w-6' : 'bg-[#F9F6EF]/30 w-2'}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentImage((p) => (p + 1) % allImages.length)}
                            className="w-12 h-12 rounded-full bg-[#2A2D25]/50 backdrop-blur-sm border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:border-[#C9A84C] hover:text-[#2A2D25] transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div ref={infoRef} className="py-20 lg:py-32 px-6 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Main */}
                        <div className="lg:col-span-2">
                            <div className="info-header mb-12">
                                <h2 className="font-display text-4xl lg:text-5xl text-[#F9F6EF] mb-6">{t("ABOUT THIS ROOM", "ΣΧΕΤΙΚΑ ΜΕ ΑΥΤΟ ΤΟ ΔΩΜΑΤΙΟ")}</h2>
                                <p className="font-body text-lg text-[#F9F6EF]/70 leading-relaxed">
                                    {t(room.descriptionEN, room.descriptionEL)}
                                </p>
                            </div>

                            {/* Details cards */}
                            <div className="grid sm:grid-cols-3 gap-4 mb-12">
                                <div className="info-card p-6 rounded-xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                    <Maximize className="w-6 h-6 text-[#C9A84C] mb-3" />
                                    <p className="label-micro text-[#F9F6EF]/50 mb-1">{t("SIZE", "ΜΕΓΕΘΟΣ")}</p>
                                    <p className="font-display text-2xl text-[#F9F6EF]">{room.squareMeters ?? '—'} m²</p>
                                </div>
                                <div className="info-card p-6 rounded-xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                    <Users className="w-6 h-6 text-[#C9A84C] mb-3" />
                                    <p className="label-micro text-[#F9F6EF]/50 mb-1">{t("GUESTS", "ΑΤΟΜΑ")}</p>
                                    <p className="font-display text-2xl text-[#F9F6EF]">{t(`Up to ${room.sleeps}`, `Έως ${room.sleeps}`)}</p>
                                </div>
                                <div className="info-card p-6 rounded-xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                    <Bath className="w-6 h-6 text-[#C9A84C] mb-3" />
                                    <p className="label-micro text-[#F9F6EF]/50 mb-1">{t("BATHROOM", "ΜΠΑΝΙΟ")}</p>
                                    <p className="font-body text-sm text-[#F9F6EF]">{t("Ensuite", "Ιδιωτικό")}</p>
                                </div>
                            </div>

                            {/* Amenities */}
                            {room.amenities.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="font-heading text-2xl text-[#F9F6EF] mb-6">{t("Key Amenities", "Βασικές Παροχές")}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {room.amenities.map((a) => {
                                            const Icon = a.icon ? (AMENITY_ICONS[a.icon] ?? Sparkles) : Sparkles;
                                            return (
                                                <div key={a.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]">
                                                    <Icon className="w-4 h-4" />
                                                    <span className="font-body text-sm">{t(a.nameEN, a.nameEL)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Facilities */}
                            {room.facilities.length > 0 && (
                                <div>
                                    <h3 className="font-heading text-2xl text-[#F9F6EF] mb-6">{t("All Facilities", "Όλες οι Εγκαταστάσεις")}</h3>
                                    <div className="facilities-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {room.facilities.map((f) => (
                                            <div key={f.id} className="facility-item flex items-center gap-2 text-[#F9F6EF]/70">
                                                <Check className="w-4 h-4 text-[#C9A84C] flex-shrink-0" />
                                                <span className="font-body text-sm">{t(f.nameEN, f.nameEL)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 p-8 rounded-2xl bg-[#C9A84C]/5 border border-[#C9A84C]/20">
                                <p className="label-micro text-[#C9A84C] mb-2">{t("STARTING FROM", "ΑΠΟ")}</p>
                                <p className="font-display text-4xl text-[#F9F6EF] mb-2">
                                    {room.startingFrom ? `€${room.startingFrom}` : t('On Request', 'Κατόπιν Ζήτησης')}
                                </p>
                                <p className="font-body text-sm text-[#F9F6EF]/50 mb-6">{t("per night, including taxes", "ανά νύχτα, συμπεριλαμβανομένων των φόρων")}</p>
                                <a
                                    href="https://thefrogsguesthouse.reserve-online.net/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary w-full justify-center mb-4 block text-center"
                                >
                                    {t("Book Now", "Κάντε Κράτηση")}
                                </a>
                                <div className="space-y-3 pt-6 border-t border-[#D9D3C6]/10">
                                    {[
                                        t('Free cancellation', 'Δωρεάν ακύρωση'),
                                        t('Best price guarantee', 'Εγγύηση καλύτερης τιμής'),
                                        t('Instant confirmation', 'Άμεση επιβεβαίωση')
                                    ].map((text) => (
                                        <div key={text} className="flex items-center gap-3 text-[#F9F6EF]/70">
                                            <Check className="w-4 h-4 text-[#C9A84C]" />
                                            <span className="font-body text-sm">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            {allImages.length > 1 && (
                <div ref={galleryRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-[#2A2D25]/30">
                    <div className="max-w-7xl mx-auto">
                        <span className="label-micro text-[#C9A84C] mb-4 block">{t("TAKE A LOOK", "Ρίξτε Μια Ματιά")}</span>
                        <h2 className="font-display text-4xl lg:text-5xl text-[#F9F6EF] mb-12">{t("ROOM GALLERY", "ΓΚΑΛΕΡΙ ΔΩΜΑΤΙΟΥ")}</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}
                                    className={`relative overflow-hidden rounded-xl group ${index === 0 ? 'col-span-2 row-span-2' : ''}`}
                                >
                                    <div className={index === 0 ? 'aspect-square' : 'aspect-[4/3]'}>
                                        <img src={img} alt={t(`${room.nameEN || room.name} view ${index + 1}`, `${room.nameEL || room.name} άποψη ${index + 1}`)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    </div>
                                    <div className="absolute inset-0 bg-[#2A2D25]/40 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/90 flex items-center justify-center">
                                            <span className="font-display text-[#1C1C1A] text-lg">+</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Related Rooms */}
            {relatedRooms.length > 0 && (
                <div ref={relatedRef} className="py-20 lg:py-32 px-6 lg:px-16">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="label-micro text-[#C9A84C] mb-4 block">{t("YOU MIGHT ALSO LIKE", "ΜΠΟΡΕΙ ΕΠΙΣΗΣ ΝΑ ΣΑΣ ΑΡΕΣΟΥΝ")}</span>
                            <h2 className="font-display text-4xl lg:text-5xl text-[#F9F6EF]">{t("RELATED ROOMS", "ΣΧΕΤΙΚΑ ΔΩΜΑΤΙΑ")}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedRooms.map((r) => (
                                <Link key={r.slug} href={`/rooms/${r.slug}`} className="related-card group relative overflow-hidden rounded-xl">
                                    <div className="aspect-[4/3]">
                                        <img
                                            src={r.featuredImage || '/images/guesthouse-room.jpg'}
                                            alt={t(r.nameEN || r.name, r.nameEL || r.name)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25] via-[#2A2D25]/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                                        <h3 className="font-display text-2xl text-[#F9F6EF] group-hover:text-[#C9A84C] transition-colors">
                                            {t(r.nameEN || r.name, r.nameEL || r.name).toUpperCase()}
                                        </h3>
                                        <div className="w-10 h-10 rounded-full border border-[#F9F6EF]/30 flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:border-[#C9A84C] transition-all">
                                            <ArrowRight className="w-5 h-5 text-[#F9F6EF] group-hover:text-[#2A2D25]" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-[#2A2D25]/98 backdrop-blur-lg flex items-center justify-center">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setLightboxIndex((p) => (p - 1 + allImages.length) % allImages.length)}
                        className="absolute left-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <img src={allImages[lightboxIndex]} alt={t(`${room.nameEN || room.name} full view`, `${room.nameEL || room.name} πλήρης άποψη`)} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
                    <button
                        onClick={() => setLightboxIndex((p) => (p + 1) % allImages.length)}
                        className="absolute right-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, i) => (
                            <button key={i} onClick={() => setLightboxIndex(i)} className={`h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-[#C9A84C] w-6' : 'bg-[#F9F6EF]/30 w-2'}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
