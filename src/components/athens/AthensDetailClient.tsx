"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, MapPin, Clock, Euro, Sun, Camera, Info, ArrowRight, Tag,
    ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type PoiMedia = { id: string; url: string; isHero: boolean; type: string; order: number };
type PoiTip = { id: string; nameEN: string | null; nameEL: string; order: number };
type PoiVisitInfo = { distance: string | null; duration: string | null; price: string | null; hours: string | null; bestTime: string | null } | null;
type PoiNearby = { id: string; name: string; distance: string | null; order: number };
type Poi = {
    id: string; slug: string; category: string | null;
    titleEL: string; titleEN: string | null;
    subtitleEL: string | null; subtitleEN: string | null;
    shortDescriptionEL: string | null; shortDescriptionEN: string | null;
    descriptionEL: string | null; descriptionEN: string | null;
    featuredImage: string | null;
    media: PoiMedia[];
    visitorTips: PoiTip[];
    visitInfo: PoiVisitInfo;
    nearby: PoiNearby[];
};
type RelatedPoi = { slug: string; titleEN: string | null; titleEL: string; featuredImage: string | null; media: PoiMedia[] };

export default function AthensDetailClient({ poi, relatedPois }: { poi: Poi; relatedPois: RelatedPoi[] }) {
    const router = useRouter();
    const { t } = useLanguage();
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const tipsRef = useRef<HTMLDivElement>(null);
    const relatedRef = useRef<HTMLDivElement>(null);

    // Hero image: prefer isHero media, fall back to first media, then featuredImage
    const heroImage = poi.media.find(m => m.isHero)?.url
        ?? poi.media[0]?.url
        ?? poi.featuredImage
        ?? '/images/hero-athens-bar.jpg';

    // Gallery: all image media items
    const galleryImages = poi.media.filter(m => m.type === 'IMAGE');
    const galleryUrls = galleryImages.map(m => m.url);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);
    const prevImage = () => setLightboxIndex(i => (i - 1 + galleryUrls.length) % galleryUrls.length);
    const nextImage = () => setLightboxIndex(i => (i + 1) % galleryUrls.length);

    // Keyboard nav
    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxOpen, galleryUrls.length]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        document.body.style.overflow = lightboxOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightboxOpen]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const heroTitle = heroRef.current?.querySelector('.hero-title');
            if (heroTitle) {
                gsap.fromTo(heroTitle, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
            }
            if (contentRef.current) {
                gsap.fromTo(
                    contentRef.current.querySelector('.content-main'),
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: contentRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } }
                );
                gsap.fromTo(
                    contentRef.current.querySelectorAll('.detail-card'),
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: contentRef.current.querySelector('.details-grid'), start: 'top 80%', toggleActions: 'play none none reverse' } }
                );
            }
            if (galleryRef.current) {
                gsap.fromTo(
                    galleryRef.current.querySelectorAll('.gallery-item'),
                    { scale: 0.95, opacity: 0 },
                    { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: galleryRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } }
                );
            }
            if (tipsRef.current) {
                gsap.fromTo(
                    tipsRef.current.querySelectorAll('.tip-item'),
                    { x: -20, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: tipsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' } }
                );
            }
            if (relatedRef.current) {
                gsap.fromTo(
                    relatedRef.current.querySelectorAll('.related-card'),
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: relatedRef.current, start: 'top 75%', toggleActions: 'play none none reverse' } }
                );
            }
        });
        return () => ctx.revert();
    }, [poi]);

    useEffect(() => { window.scrollTo(0, 0); }, [poi.slug]);

    return (
        <div className="bg-[#2A2D25] min-h-screen">
            {/* Hero */}
            <div ref={heroRef} className="relative h-[70vh] lg:h-[80vh] overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt={t(poi.titleEN, poi.titleEL)}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#2A2D25]/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25] via-[#2A2D25]/30 to-transparent" />
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
                        <Link href="/athens" className="text-[#F9F6EF]/80 hover:text-[#C9A84C] transition-colors font-body text-sm">
                            {t("All Sights", "Όλα τα Αξιοθέατα")}
                        </Link>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-4">
                            {poi.category && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-body">
                                    <Tag className="w-3 h-3" />
                                    {t(poi.category, poi.category)}
                                </span>
                            )}
                            {(poi.subtitleEN || poi.subtitleEL) && (
                                <span className="label-micro text-[#C9A84C]">
                                    {t(poi.subtitleEN, poi.subtitleEL).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <h1 className="hero-title font-display text-5xl lg:text-8xl text-[#F9F6EF] mb-6">
                            {t(poi.titleEN, poi.titleEL).toUpperCase()}
                        </h1>
                        {(poi.shortDescriptionEN || poi.shortDescriptionEL) && (
                            <p className="font-body text-lg text-[#F9F6EF]/80 max-w-xl mb-8">
                                {t(poi.shortDescriptionEN, poi.shortDescriptionEL)}
                            </p>
                        )}
                        {/* View Gallery button — only shown when there are images */}
                        {galleryImages.length > 0 && (
                            <button
                                onClick={() => openLightbox(0)}
                                className="btn-secondary"
                            >
                                {t("View Gallery", "Δείτε την Γκαλερί")}
                            </button>
                        )}
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
                                <h2 className="font-display text-3xl lg:text-4xl text-[#F9F6EF] mb-8">{t("ABOUT", "ΣΧΕΤΙΚΑ")}</h2>
                                <div className="prose prose-invert max-w-none">
                                    {(t(poi.descriptionEN, poi.descriptionEL) || '').split('\n\n').map((para, i) => (
                                        <p key={i} className="font-body text-[#F9F6EF]/70 leading-relaxed mb-6">{para}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Gallery */}
                            {galleryImages.length > 0 && (
                                <div ref={galleryRef} className="mt-16">
                                    <h3 className="font-display text-2xl lg:text-3xl text-[#F9F6EF] mb-8">{t("GALLERY", "ΓΚΑΛΕΡΙ")}</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {galleryImages.map((img, i) => (
                                            <button
                                                key={img.id}
                                                onClick={() => openLightbox(i)}
                                                className={`gallery-item relative overflow-hidden rounded-xl group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                                            >
                                                <div className={`relative ${i === 0 ? 'aspect-square' : 'aspect-[4/3]'}`}>
                                                    <Image
                                                        src={img.url}
                                                        alt={`${t(poi.titleEN, poi.titleEL)} — ${t('view', 'άποψη')} ${i + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-[#2A2D25]/40 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                    <div className="w-16 h-16 rounded-full bg-[#C9A84C]/90 flex items-center justify-center shadow-lg">
                                                        <span className="font-display text-[#1C1C1A] text-xl">+</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Visitor Tips */}
                            {poi.visitorTips.length > 0 && (
                                <div ref={tipsRef} className="mt-16">
                                    <h3 className="font-display text-2xl lg:text-3xl text-[#F9F6EF] mb-8">{t("VISITOR TIPS", "ΣΥΜΒΟΥΛΕΣ ΕΠΙΣΚΕΠΤΩΝ")}</h3>
                                    <div className="space-y-4">
                                        {poi.visitorTips.map((tip) => (
                                            <div key={tip.id} className="tip-item flex items-start gap-4 p-4 rounded-xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                                <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                                                    <Info className="w-4 h-4 text-[#C9A84C]" />
                                                </div>
                                                <p className="font-body text-[#F9F6EF]/70">{t(tip.nameEN, tip.nameEL)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Visit Info */}
                                {poi.visitInfo && (
                                    <div className="p-6 rounded-2xl bg-[#C9A84C]/5 border border-[#C9A84C]/20">
                                        <h3 className="label-micro text-[#C9A84C] mb-6">{t("VISIT INFO", "ΠΛΗΡΟΦΟΡΙΕΣ ΕΠΙΣΚΕΨΗΣ")}</h3>
                                        <div className="details-grid space-y-4">
                                            {poi.visitInfo.distance && (
                                                <div className="detail-card flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-body text-sm text-[#F9F6EF]/50">{t("Distance", "Απόσταση")}</p>
                                                        <p className="font-body text-[#F9F6EF]">{poi.visitInfo.distance}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {poi.visitInfo.duration && (
                                                <div className="detail-card flex items-start gap-3">
                                                    <Clock className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-body text-sm text-[#F9F6EF]/50">{t("Duration", "Διάρκεια")}</p>
                                                        <p className="font-body text-[#F9F6EF]">{poi.visitInfo.duration}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {poi.visitInfo.price && (
                                                <div className="detail-card flex items-start gap-3">
                                                    <Euro className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-body text-sm text-[#F9F6EF]/50">{t("Price", "Τιμή")}</p>
                                                        <p className="font-body text-[#F9F6EF]">{poi.visitInfo.price}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {poi.visitInfo.hours && (
                                                <div className="detail-card flex items-start gap-3">
                                                    <Sun className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-body text-sm text-[#F9F6EF]/50">{t("Hours", "Ώρες")}</p>
                                                        <p className="font-body text-[#F9F6EF]">{poi.visitInfo.hours}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {poi.visitInfo.bestTime && (
                                                <div className="detail-card flex items-start gap-3">
                                                    <Camera className="w-5 h-5 text-[#C9A84C] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-body text-sm text-[#F9F6EF]/50">{t("Best Time", "Καλύτερη Ώρα")}</p>
                                                        <p className="font-body text-[#F9F6EF]">{poi.visitInfo.bestTime}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Nearby */}
                                {poi.nearby.length > 0 && (
                                    <div className="p-6 rounded-2xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                        <h3 className="label-micro text-[#C9A84C] mb-6">{t("NEARBY", "ΚΟΝΤΑ")}</h3>
                                        <div className="space-y-3">
                                            {poi.nearby.map((place) => (
                                                <div key={place.id} className="flex items-center justify-between">
                                                    <span className="font-body text-[#F9F6EF]">{place.name}</span>
                                                    {place.distance && (
                                                        <span className="font-body text-sm text-[#F9F6EF]/50">{place.distance}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="p-6 rounded-2xl bg-[#2A2D25]/50 border border-[#D9D3C6]/10">
                                    <p className="font-body text-sm text-[#F9F6EF]/60 mb-4">
                                        {t(
                                            "Stay at The Frogs and explore Athens from the perfect location.",
                                            "Μείνετε στο The Frogs και εξερευνήστε την Αθήνα από την τέλεια τοποθεσία."
                                        )}
                                    </p>
                                    <a
                                        href="https://thefrogsguesthouse.reserve-online.net/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary w-full justify-center block text-center"
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
            {relatedPois.length > 0 && (
                <div ref={relatedRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-[#2A2D25]/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <span className="label-micro text-[#C9A84C] mb-4 block">{t("MORE TO EXPLORE", "ΠΕΡΙΣΣΟΤΕΡΑ ΓΙΑ ΕΞΕΡΕΥΝΗΣΗ")}</span>
                            <h2 className="font-display text-4xl lg:text-5xl text-[#F9F6EF]">{t("RELATED SIGHTS", "ΣΧΕΤΙΚΑ ΑΞΙΟΘΕΑΤΑ")}</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {relatedPois.map((r) => {
                                const img = r.media[0]?.url ?? r.featuredImage ?? '/images/hero-athens-bar.jpg';
                                return (
                                    <Link
                                        key={r.slug}
                                        href={`/athens/${r.slug}`}
                                        className="related-card group relative overflow-hidden rounded-xl"
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={img}
                                                alt={t(r.titleEN, r.titleEL)}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25] via-[#2A2D25]/20 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                                            <h3 className="font-display text-2xl text-[#F9F6EF] group-hover:text-[#C9A84C] transition-colors">
                                                {t(r.titleEN, r.titleEL).toUpperCase()}
                                            </h3>
                                            <div className="w-10 h-10 rounded-full border border-[#F9F6EF]/30 flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:border-[#C9A84C] transition-all">
                                                <ArrowRight className="w-5 h-5 text-[#F9F6EF] group-hover:text-[#2A2D25]" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lightbox ────────────────────────────────────────────────────── */}
            {lightboxOpen && galleryUrls.length > 0 && (
                <div
                    className="fixed inset-0 z-[100] bg-[#2A2D25]/98 backdrop-blur-lg flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all z-10"
                        aria-label={t("Close gallery", "Κλείσιμο γκαλερί")}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Prev */}
                    {galleryUrls.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}

                    {/* Image — stopPropagation so clicking the image itself doesn't close */}
                    <div className="relative max-w-[90vw] max-h-[85vh] w-full h-[85vh]" onClick={e => e.stopPropagation()}>
                        <Image
                            src={galleryUrls[lightboxIndex]}
                            alt={t(poi.titleEN, poi.titleEL)}
                            fill
                            sizes="90vw"
                            className="object-contain rounded-lg select-none shadow-2xl"
                            priority
                            draggable={false}
                        />
                    </div>

                    {/* Next */}
                    {galleryUrls.length > 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-6 w-12 h-12 rounded-full bg-[#2A2D25]/50 border border-[#D9D3C6]/30 flex items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] transition-all z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}

                    {/* Counter + dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                        <p className="font-body text-sm text-[#F9F6EF]/50">
                            {lightboxIndex + 1} / {galleryUrls.length}
                        </p>
                        {galleryUrls.length > 1 && (
                            <div className="flex gap-2">
                                {galleryUrls.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                                        className={`h-2 rounded-full transition-all ${i === lightboxIndex ? 'bg-[#C9A84C] w-6' : 'bg-[#F9F6EF]/30 w-2 hover:bg-[#F9F6EF]/60'}`}
                                        aria-label={`Go to image ${i + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
