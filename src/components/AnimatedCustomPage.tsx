"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomPageBlock } from "@/app/lib/actions/custom-pages";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedCustomPage({ blocks, titleEL, titleEN, heroImage }: { blocks: CustomPageBlock[]; titleEL: string; titleEN?: string | null; heroImage?: string | null }) {
    const { language } = useLanguage();
    const title = language === 'EN' && titleEN ? titleEN : titleEL;
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate hero title
            gsap.fromTo('.hero-title', 
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
            );

            // Animate each block on scroll
            const blockElements = gsap.utils.toArray(".custom-block");
            blockElements.forEach((el: any) => {
                gsap.fromTo(el,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: el,
                            start: "top 85%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [blocks]);

    return (
        <div ref={containerRef} className="bg-frogs-dark min-h-screen pb-24 relative z-10">
            {/* Hero */}
            <section className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={heroImage || "/images/hero-athens-bar.jpg"}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-frogs-dark/70" />
                </div>
                <div className="relative z-10 text-center px-6 mt-16">
                    <h1 className="hero-title font-display text-5xl md:text-6xl lg:text-7xl text-frogs-text-light mb-4 uppercase tracking-wider">
                        {title}
                    </h1>
                    <div className="hero-title mx-auto h-px w-24 bg-frogs-gold/50 mt-8 mb-8" />
                </div>
            </section>

            {/* Content Blocks */}
            <main className="relative z-20 pt-16 max-w-4xl mx-auto px-6 md:px-12 space-y-16">
                {blocks?.map((block: CustomPageBlock) => {
                    switch (block.type) {
                        case "heading": {
                            const hasEN = block.contentEN && block.contentEN.replace(/<[^>]*>?/gm, '').trim().length > 0;
                            const content = language === 'EN' && hasEN ? block.contentEN : block.contentEL;
                            const Tag = block.level;
                            return (
                                <Tag key={block.id} className={cn(
                                    "custom-block font-display tracking-wide text-frogs-text-light",
                                    block.level === "h1" && "text-5xl md:text-6xl text-frogs-gold",
                                    block.level === "h2" && "text-4xl md:text-5xl",
                                    block.level === "h3" && "text-2xl md:text-3xl",
                                    block.level === "h4" && "text-xl md:text-2xl",
                                    block.level === "h5" && "text-lg md:text-xl",
                                    block.level === "h6" && "text-base font-bold"
                                )}>
                                    {content}
                                </Tag>
                            );
                        }
                            
                        case "richtext": {
                            const hasEN = block.contentEN && block.contentEN.replace(/<[^>]*>?/gm, '').trim().length > 0;
                            const content = language === 'EN' && hasEN ? block.contentEN : block.contentEL;
                            return (
                                <div 
                                    key={block.id} 
                                    className="custom-block prose prose-lg prose-invert max-w-none 
                                        text-[#F9F6EF]/80 [&_span]:!text-inherit [&_p]:!text-inherit [&_h1]:!text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_*]:!bg-transparent
                                        prose-headings:font-display prose-headings:text-[#F9F6EF] prose-headings:font-medium
                                        prose-p:font-body prose-p:leading-loose prose-p:text-justify
                                        prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                                        prose-strong:text-[#F9F6EF] prose-strong:font-bold
                                        [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:list-decimal [&_ol]:pl-8 [&_li]:list-item
                                        prose-li:marker:text-[#C9A84C] prose-li:font-body prose-li:text-[1.1rem] prose-li:leading-loose"
                                    dangerouslySetInnerHTML={{ __html: content || "" }}
                                />
                            );
                        }
                            
                        case "gallery":
                            return (
                                <div 
                                    key={block.id} 
                                    className="custom-block grid gap-6" 
                                    style={{ gridTemplateColumns: `repeat(${block.columns}, minmax(0, 1fr))` }}
                                >
                                    {block.images?.map((img, i) => (
                                        <a key={i} href={img.url} target="_blank" rel="noreferrer" 
                                            className="relative aspect-square overflow-hidden group block"
                                        >
                                            <div className="absolute inset-0 bg-frogs-dark/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                                            <img 
                                                src={img.url} 
                                                alt={img.alt || "Gallery Image"} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            />
                                        </a>
                                    ))}
                                </div>
                            );

                        default:
                            return null;
                    }
                })}
            </main>
        </div>
    );
}
