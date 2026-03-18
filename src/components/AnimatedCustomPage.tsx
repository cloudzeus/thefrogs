"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomPageBlock } from "@/app/lib/actions/custom-pages";
import { cn } from "@/lib/utils";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AnimatedCustomPage({ blocks, title }: { blocks: CustomPageBlock[]; title: string }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate title
            gsap.fromTo(".page-title", 
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
            );

            // Animate each block on scroll
            const blockElements = gsap.utils.toArray(".custom-block");
            blockElements.forEach((el: any) => {
                gsap.fromTo(el,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        ease: "power3.out",
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
        <div ref={containerRef} className="space-y-12 pb-24">
            <div className="mb-16">
                <h1 className="page-title font-display text-5xl md:text-7xl text-frogs-text-light tracking-wide mb-4">
                    {title}
                </h1>
                <div className="page-title h-px w-24 bg-frogs-gold/50 mt-8 mb-8" />
            </div>

            <div className="space-y-16">
                {blocks?.map((block: CustomPageBlock) => {
                    switch (block.type) {
                        case "heading":
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
                                    {block.contentEN || block.contentEL}
                                </Tag>
                            );
                            
                        case "richtext":
                            return (
                                <div 
                                    key={block.id} 
                                    className="custom-block prose prose-lg prose-invert max-w-none 
                                        prose-headings:font-display prose-headings:text-[#F9F6EF] prose-headings:font-medium
                                        prose-p:font-body prose-p:text-[1.1rem] prose-p:text-[#F9F6EF]/70 prose-p:leading-loose
                                        prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                                        prose-strong:text-[#F9F6EF] prose-strong:font-bold
                                        prose-ul:text-[#F9F6EF]/70 prose-li:marker:text-[#C9A84C]
                                        prose-li:font-body prose-li:text-[1.1rem] prose-li:leading-loose"
                                    dangerouslySetInnerHTML={{ __html: block.contentEN || block.contentEL || "" }}
                                />
                            );
                            
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
            </div>
        </div>
    );
}
