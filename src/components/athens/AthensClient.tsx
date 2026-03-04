"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { MapPin, Clock, Euro, ArrowRight, Tag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

type PoiVisitInfo = { distance: string | null; duration: string | null; price: string | null } | null;
type PoiMedia = { url: string; isHero: boolean };
type Poi = {
    id: string; slug: string; category: string | null;
    titleEL: string; titleEN: string | null;
    subtitleEN: string | null; subtitleEL: string | null;
    shortDescriptionEN: string | null; shortDescriptionEL: string | null;
    featuredImage: string | null;
    tags: string[] | null;
    media: PoiMedia[];
    visitInfo: PoiVisitInfo;
};

type PageMeta = {
    titleEL: string;
    titleEN?: string;
    subtitleEL?: string;
    subtitleEN?: string;
    bodyEL?: string;
    bodyEN?: string;
    heroImage?: string;
    heroVideo?: string;
} | null;

export default function AthensClient({ pois, pageMeta }: { pois: Poi[], pageMeta?: PageMeta }) {
    const heroRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [activeTag, setActiveTag] = useState('All');
    const { t } = useLanguage();

    // Build filter list dynamically from all tags across all POIs, plus "All"
    const allTags = Array.from(
        new Set(pois.flatMap(p => Array.isArray(p.tags) ? p.tags : (p.category ? [p.category] : [])))
    ).sort();
    const filterOptions = ['All', ...allTags];

    const filtered = activeTag === 'All'
        ? pois
        : pois.filter(p => {
            const tags = Array.isArray(p.tags) ? p.tags : [];
            return tags.includes(activeTag) || p.category === activeTag;
        });

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (heroRef.current) {
                gsap.fromTo(heroRef.current.querySelector('.hero-content'), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' });
            }
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!gridRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                gridRef.current!.querySelectorAll('.poi-card'),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' }
            );
        });
        return () => ctx.revert();
    }, [filtered.length, activeTag]);

    return (
        <div className="bg-[#2A2D25] min-h-screen">
            {/* Hero */}
            <div ref={heroRef} className="relative h-[55vh] flex items-end overflow-hidden">
                <div className="absolute inset-0 bg-[#2A2D25]">
                    {pageMeta?.heroVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src={pageMeta.heroVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={pageMeta?.heroImage || "/images/hero-athens-bar.jpg"}
                            alt={t(pageMeta?.titleEN, pageMeta?.titleEL) || 'Athens'}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#2A2D25]/20 to-[#2A2D25]" />
                </div>
                <div className="relative z-10 hero-content px-6 lg:px-16 pb-16 max-w-7xl mx-auto w-full">
                    <span className="label-micro text-[#C9A84C] mb-4 block">
                        {t(pageMeta?.subtitleEN || 'YOUR LOCAL GUIDE', pageMeta?.subtitleEL || 'Ο ΤΟΠΙΚΟΣ ΣΑΣ ΟΔΗΓΟΣ')}
                    </span>
                    <h1 className="font-display text-6xl lg:text-9xl text-[#F9F6EF]">
                        {t(pageMeta?.titleEN || 'ATHENS', pageMeta?.titleEL || 'ΑΘΗΝΑ')}
                    </h1>
                    <p className="font-body text-[#F9F6EF]/70 mt-4 max-w-lg">
                        {t(
                            pageMeta?.bodyEN || 'The best of Athens — hand-picked by The Frogs team. All within walking distance.',
                            pageMeta?.bodyEL || 'Τα καλύτερα της Αθήνας — επιλεγμένα από την ομάδα του The Frogs. Όλα σε απόσταση βόλτας.'
                        )}
                    </p>
                </div>
            </div>

            {/* Filter Bar — built dynamically from POI tags */}
            <div className="px-6 lg:px-16 py-8 border-b border-[#D9D3C6]/10">
                <div className="max-w-7xl mx-auto flex gap-3 flex-wrap">
                    {filterOptions.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setActiveTag(opt)}
                            className={`px-4 py-2 rounded-full font-body text-sm transition-all border ${activeTag === opt
                                ? 'bg-[#C9A84C] border-[#C9A84C] text-[#1C1C1A]'
                                : 'border-[#D9D3C6]/20 text-[#F9F6EF]/60 hover:border-[#C9A84C]/50 hover:text-[#C9A84C]'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div ref={gridRef} className="py-16 lg:py-24 px-6 lg:px-16">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((poi) => {
                        const image = poi.media[0]?.url ?? poi.featuredImage ?? '/images/hero-athens-bar.jpg';
                        const poiTags = Array.isArray(poi.tags) ? poi.tags : (poi.category ? [poi.category] : []);
                        return (
                            <Link
                                key={poi.id}
                                href={`/athens/${poi.slug}`}
                                className="poi-card group relative overflow-hidden rounded-2xl bg-[#1C1C1A] border border-[#D9D3C6]/10 hover:border-[#C9A84C]/30 transition-all duration-500"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={image}
                                        alt={t(poi.titleEN, poi.titleEL)}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1A] via-transparent to-transparent" />

                                    {/* Tags — show up to 2 */}
                                    {poiTags.length > 0 && (
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                                            {poiTags.slice(0, 2).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2A2D25]/80 backdrop-blur-sm border border-[#C9A84C]/30 text-[#C9A84C] text-[10px] font-body"
                                                >
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {poiTags.length > 2 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#2A2D25]/80 text-[#C9A84C]/60 text-[10px] font-body">
                                                    +{poiTags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="mb-3">
                                        {(poi.subtitleEN || poi.subtitleEL) && (
                                            <span className="label-micro text-[#C9A84C] block mb-1">
                                                {t(poi.subtitleEN, poi.subtitleEL)!.toUpperCase()}
                                            </span>
                                        )}
                                        <h3 className="font-display text-2xl text-[#F9F6EF] group-hover:text-[#C9A84C] transition-colors">
                                            {t(poi.titleEN, poi.titleEL).toUpperCase()}
                                        </h3>
                                    </div>

                                    {(poi.shortDescriptionEN || poi.shortDescriptionEL) && (
                                        <p className="font-body text-sm text-[#F9F6EF]/60 leading-relaxed mb-4 line-clamp-2">
                                            {t(poi.shortDescriptionEN, poi.shortDescriptionEL)}
                                        </p>
                                    )}

                                    {poi.visitInfo && (
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            {poi.visitInfo.distance && (
                                                <span className="flex items-center gap-1.5 text-xs text-[#F9F6EF]/50 font-body">
                                                    <MapPin className="w-3 h-3 text-[#C9A84C]" />
                                                    {poi.visitInfo.distance}
                                                </span>
                                            )}
                                            {poi.visitInfo.duration && (
                                                <span className="flex items-center gap-1.5 text-xs text-[#F9F6EF]/50 font-body">
                                                    <Clock className="w-3 h-3 text-[#C9A84C]" />
                                                    {poi.visitInfo.duration}
                                                </span>
                                            )}
                                            {poi.visitInfo.price && (
                                                <span className="flex items-center gap-1.5 text-xs text-[#F9F6EF]/50 font-body">
                                                    <Euro className="w-3 h-3 text-[#C9A84C]" />
                                                    {poi.visitInfo.price}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[#C9A84C] text-sm font-body">
                                        <span>{t('Explore', 'Εξερεύνηση')}</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-body text-[#F9F6EF]/40">
                            {t('No sights in this category yet.', 'Δεν υπάρχουν αξιοθέατα σε αυτή την κατηγορία.')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
