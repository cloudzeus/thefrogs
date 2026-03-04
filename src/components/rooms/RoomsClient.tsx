"use client";
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { Check, Users, Maximize, ArrowRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

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
    facilities: { nameEN: string | null; nameEL: string }[];
    images: { url: string }[];
};

export default function RoomsClient({ rooms, pageMeta }: { rooms: Room[], pageMeta?: any }) {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (heroRef.current) {
                gsap.fromTo(
                    heroRef.current.querySelector('.hero-content'),
                    { y: 80, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
                );
            }
            if (cardsRef.current) {
                gsap.fromTo(
                    cardsRef.current.querySelectorAll('.room-card'),
                    { y: 60, opacity: 0 },
                    {
                        y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
                        scrollTrigger: { trigger: cardsRef.current, start: 'top 75%' },
                    }
                );
            }
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="bg-[#2A2D25] min-h-screen">
            {/* Hero */}
            <div ref={heroRef} className="relative h-[60vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#2A2D25]/40 to-[#2A2D25]" />
                <div className="absolute inset-0">
                    {pageMeta?.heroVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            title={t("Rooms overview video", "Εισαγωγικό βίντεο δωματίων")}
                        >
                            <source src={pageMeta.heroVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={pageMeta?.heroImage || "/images/guesthouse-room.jpg"}
                            alt={t("Boutique rooms with minimalist design and authentic character", "Boutique δωμάτια με μινιμαλιστικό σχεδιασμό και αυθεντικό χαρακτήρα")}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="relative z-10 hero-content px-6 lg:px-16 pb-16 max-w-7xl mx-auto w-full">
                    <span className="label-micro text-[#C9A84C] mb-4 block">THE FROGS GUESTHOUSE</span>
                    <h1 className="font-display text-6xl lg:text-9xl text-[#F9F6EF]">{t("OUR ROOMS", "ΤΑ ΔΩΜΑΤΙΑ ΜΑΣ")}</h1>
                    <p className="font-body text-[#F9F6EF]/70 mt-4 max-w-lg">
                        {t(
                            "Six unique rooms across two buildings in the heart of Athens — each with its own character.",
                            "Έξι μοναδικά δωμάτια σε δύο κτίρια στην καρδιά της Αθήνας — το καθένα με το δικό του χαρακτήρα."
                        )}
                    </p>
                </div>
            </div>

            {/* Rooms Grid */}
            <div ref={cardsRef} className="py-20 lg:py-32 px-6 lg:px-16">
                <div className="max-w-7xl mx-auto space-y-20">
                    {rooms.map((room, idx) => {
                        const image = room.featuredImage || room.images?.[0]?.url || '/images/guesthouse-room.jpg';
                        const price = room.startingFrom ? t(`From €${room.startingFrom}/night`, `Από €${room.startingFrom}/νύχτα`) : null;

                        return (
                            <div
                                key={room.id}
                                className={`room-card grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${idx % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                                    }`}
                            >
                                {/* Image */}
                                <div className={`relative overflow-hidden rounded-2xl aspect-[4/3] group ${idx % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                                    <img
                                        src={image}
                                        alt={t(`Interior view of ${room.nameEN || room.name}`, `Εσωτερική άποψη του ${room.nameEL || room.name}`)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25]/60 to-transparent" />
                                    {price && (
                                        <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-[#C9A84C]/90 backdrop-blur-sm">
                                            <span className="font-body text-sm font-medium text-[#1C1C1A]">{price}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                                    <span className="label-micro text-[#C9A84C] mb-4 block">
                                        {idx < 3
                                            ? t('MAIN BUILDING • EST. 2018', 'ΚΥΡΙΟ ΚΤΙΡΙΟ • EST. 2018')
                                            : t('NEXT DOOR • NEW APARTMENTS', 'NEXT DOOR • ΝΕΑ ΔΙΑΜΕΡΙΣΜΑΤΑ')
                                        }
                                    </span>
                                    <h2 className="font-display text-4xl lg:text-6xl text-[#F9F6EF] mb-6">
                                        {t(room.nameEN || room.name, room.nameEL || room.name).toUpperCase()}
                                    </h2>

                                    <div className="flex items-center gap-6 mb-6">
                                        {room.squareMeters && (
                                            <div className="flex items-center gap-2 text-[#F9F6EF]/60">
                                                <Maximize className="w-4 h-4" aria-hidden="true" />
                                                <span className="font-body text-sm">{room.squareMeters} m²</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-[#F9F6EF]/60">
                                            <Users className="w-4 h-4" aria-hidden="true" />
                                            <span className="font-body text-sm">
                                                {t(`Up to ${room.sleeps} guests`, `Έως ${room.sleeps} άτομα`)}
                                            </span>
                                        </div>
                                    </div>

                                    {(room.descriptionEN || room.descriptionEL) && (
                                        <p className="font-body text-[#F9F6EF]/70 leading-relaxed mb-8">
                                            {t(room.descriptionEN, room.descriptionEL)?.slice(0, 200)}...
                                        </p>
                                    )}

                                    {room.facilities.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mb-8" aria-label={t("Room facilities", "Παροχές δωματίου")}>
                                            {room.facilities.slice(0, 6).map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[#F9F6EF]/60">
                                                    <Check className="w-3 h-3 text-[#C9A84C] flex-shrink-0" aria-hidden="true" />
                                                    <span className="font-body text-xs">{t(f.nameEN, f.nameEL)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <Link
                                        href={`/rooms/${room.slug}`}
                                        className="inline-flex items-center gap-3 group/link"
                                        aria-label={t(`View details for ${room.nameEN || room.name}`, `Δείτε λεπτομέρειες για το ${room.nameEL || room.name}`)}
                                    >
                                        <span className="btn-primary">{t("View Room", "Δείτε το Δωμάτιο")}</span>
                                        <div className="w-12 h-12 rounded-full border border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] group-hover/link:bg-[#C9A84C] group-hover/link:border-[#C9A84C] group-hover/link:text-[#1C1C1A] transition-all" aria-hidden="true">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
