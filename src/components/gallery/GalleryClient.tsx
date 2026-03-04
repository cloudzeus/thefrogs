"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

type GalleryImage = {
    id: string;
    url: string;
    title: string | null;
    category: string | null;
    order: number;
};

export default function GalleryClient({ initialImages, pageMeta }: { initialImages: GalleryImage[], pageMeta?: any }) {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Categories derived from data
    const rawCategories = Array.from(new Set(initialImages.map(img => img.category).filter(Boolean)));
    const categories = [{ id: 'all', labelEN: 'All', labelEL: 'Όλα' }, ...rawCategories.map(c => ({ id: c as string, labelEN: c as string, labelEL: c as string }))];

    const filteredImages = activeCategory === 'all'
        ? initialImages
        : initialImages.filter((img) => img.category === activeCategory);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (heroRef.current) {
                gsap.fromTo(
                    heroRef.current.querySelector('.hero-title'),
                    { y: 60, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
                );
            }

            if (gridRef.current) {
                const items = gridRef.current.querySelectorAll('.gallery-item');
                gsap.fromTo(
                    items,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: 0.05,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: gridRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        });

        return () => ctx.revert();
    }, [activeCategory]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, filteredImages]);

    return (
        <div className="bg-[#2A2D25] min-h-screen pb-32">
            {/* Hero */}
            <section ref={heroRef} className="relative h-[45vh] lg:h-[55vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[#2A2D25]">
                    {pageMeta?.heroVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                            title={t("Gallery introduction video", "Εισαγωγικό βίντεο γκαλερί")}
                        >
                            <source src={pageMeta.heroVideo} type="video/mp4" />
                        </video>
                    ) : (
                        <img
                            src={pageMeta?.heroImage || initialImages[0]?.url || "/images/hero-athens-bar.jpg"}
                            alt={t(`Gallery Hero - Collection of boutique lifestyle photography`, `Gallery Hero - Συλλογή από boutique φωτογραφίες`)}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-[#2A2D25]/60" />
                </div>
                <div className="relative z-10 text-center px-6">
                    <span className="label-micro text-[#C9A84C] mb-4 block tracking-[0.2em]">{t("CURATED COLLECTION", "ΕΠΙΜΕΛΗΜΕΝΗ ΣΥΛΛΟΓΗ")}</span>
                    <h1 className="hero-title font-display text-5xl lg:text-7xl text-[#F9F6EF] tracking-tight">
                        {t("PHOTO GALLERY", "ΓΚΑΛΕΡΙ ΦΩΤΟΓΡΑΦΙΩΝ")}
                    </h1>
                </div>
            </section>

            {/* Filter Tabs */}
            <section className="sticky top-0 z-30 py-6 px-6 lg:px-16 bg-[#2A2D25]/80 backdrop-blur-md border-b border-[#D9D3C6]/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-2 justify-center lg:justify-start" role="tablist" aria-label={t("Gallery categories", "Κατηγορίες γκαλερί")}>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                role="tab"
                                aria-selected={activeCategory === cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    window.scrollTo({ top: heroRef.current?.offsetHeight || 0, behavior: 'smooth' });
                                }}
                                className={`px-6 py-2 rounded-full font-body text-xs uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat.id
                                    ? 'bg-[#C9A84C] text-[#2A2D25] border-[#C9A84C]'
                                    : 'bg-transparent text-[#F9F6EF]/70 border-[#D9D3C6]/20 hover:border-[#C9A84C]/50'
                                    }`}
                            >
                                {t(cat.labelEN, cat.labelEL)}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16 lg:py-24 px-6 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div
                        ref={gridRef}
                        className="grid grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredImages.map((image, index) => (
                            <div
                                key={image.id}
                                className={`gallery-item group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/5]`}
                                onClick={() => setLightboxIndex(index)}
                                role="button"
                                aria-label={`View ${image.title || "gallery image"}`}
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && setLightboxIndex(index)}
                            >
                                <img
                                    src={image.url}
                                    alt={image.title || "Gallery image"}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2D25] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <p className="font-display text-xl text-[#F9F6EF]">
                                        {image.title?.toUpperCase() || ""}
                                    </p>
                                    {image.category && (
                                        <span className="text-[10px] text-[#C9A84C] font-black uppercase tracking-widest">{image.category}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="text-center py-20 bg-[#2A2D25]/30 rounded-3xl border border-dashed border-[#D9D3C6]/20">
                            <p className="font-body text-[#F9F6EF]/50">No images found in this category.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-[#2A2D25]/98 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-300"
                    onClick={() => setLightboxIndex(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image lightbox"
                >
                    <button
                        className="absolute top-8 right-8 w-12 h-12 rounded-full border border-[#D9D3C6]/20 flex items-center justify-center text-[#F9F6EF]/60 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"
                        onClick={() => setLightboxIndex(null)}
                        aria-label="Close lightbox"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="flex items-center gap-6 w-full max-w-7xl h-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={prevImage}
                            className="hidden lg:flex w-14 h-14 rounded-full border border-[#D9D3C6]/20 items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] hover:border-[#C9A84C] transition-all shrink-0"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <div className="relative flex-1 flex flex-col items-center justify-center h-full">
                            <img
                                src={filteredImages[lightboxIndex].url}
                                alt={filteredImages[lightboxIndex].title || "Gallery preview"}
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl shadow-black/50"
                            />
                            <div className="text-center mt-6">
                                <h2 className="font-display text-2xl lg:text-3xl text-[#F9F6EF] mb-1">
                                    {filteredImages[lightboxIndex].title?.toUpperCase()}
                                </h2>
                                <p className="text-[11px] text-[#C9A84C] font-black uppercase tracking-[0.2em]">
                                    {filteredImages[lightboxIndex].category}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={nextImage}
                            className="hidden lg:flex w-14 h-14 rounded-full border border-[#D9D3C6]/20 items-center justify-center text-[#F9F6EF] hover:bg-[#C9A84C] hover:text-[#2A2D25] hover:border-[#C9A84C] transition-all shrink-0"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="absolute bottom-8 flex gap-4 lg:hidden">
                        <button onClick={prevImage} className="w-12 h-12 rounded-full bg-[#2A2D25] border border-[#D9D3C6]/20 flex items-center justify-center text-[#F9F6EF]" aria-label="Previous image">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={nextImage} className="w-12 h-12 rounded-full bg-[#2A2D25] border border-[#D9D3C6]/20 flex items-center justify-center text-[#F9F6EF]" aria-label="Next image">
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
