"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { getLegalPage, LegalPageItem } from "@/app/lib/actions/legal";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, X } from "lucide-react";

export function LegalDialog({ slug, open, onOpenChange }: { slug: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [page, setPage] = useState<LegalPageItem | null>(null);
    const [loading, setLoading] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        if (open && slug) {
            setLoading(true);
            getLegalPage(slug)
                .then(setPage)
                .catch((err) => {
                    console.error("Failed to fetch legal page:", err);
                    setPage(null);
                })
                .finally(() => setLoading(false));
        } else if (!open) {
            setPage(null);
        }
    }, [open, slug]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                showCloseButton={false}
                className="max-w-[100vw] sm:!max-w-[70vw] w-full h-[100dvh] sm:h-[85vh] rounded-none sm:rounded-[2.5rem] bg-frogs-dark border-frogs-border/20 text-frogs-text-light p-0 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border-frogs-gold/5 flex flex-col"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-frogs-gold/5 via-transparent to-transparent pointer-events-none z-0" />
                
                {/* Custom Header with X button */}
                <div className="relative sticky top-0 bg-frogs-dark/95 backdrop-blur-md px-8 lg:px-16 pt-10 pb-6 z-30 border-b border-frogs-gold/10 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="label-micro text-frogs-gold/60 tracking-[0.3em] font-black">{t("THE FROGS GUESTHOUSE", "THE FROGS GUESTHOUSE")}</span>
                        <DialogTitle className="font-display text-2xl lg:text-4xl text-frogs-gold uppercase tracking-tighter">
                            {loading ? "..." : (language === 'EN' && page?.titleEN ? page.titleEN : page?.titleEL)}
                        </DialogTitle>
                    </div>
                    
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="w-12 h-12 rounded-full border border-frogs-gold/20 flex items-center justify-center text-frogs-gold/60 hover:text-frogs-gold hover:border-frogs-gold/60 hover:bg-frogs-gold/10 transition-all duration-300 shadow-lg"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative z-10 overscroll-contain">
                    <div className="px-8 lg:px-16 py-12 lg:py-16 max-w-4xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center p-32 gap-6">
                                <div className="relative w-12 h-12">
                                    <div className="absolute inset-0 border-2 border-frogs-gold/20 rounded-full" />
                                    <Loader2 className="w-12 h-12 animate-spin text-frogs-gold relative" />
                                </div>
                                <span className="text-xs uppercase tracking-[0.4em] text-frogs-gold/40 font-black">Loading Content</span>
                            </div>
                        ) : page ? (
                            <div 
                                className="prose prose-invert max-w-none 
                                    text-frogs-text-light/90
                                    [&_*]:!bg-transparent 
                                    [&_span]:!text-inherit [&_p]:!text-inherit [&_h1]:!text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit
                                    [&_p]:font-body [&_p]:text-base lg:text-lg [&_p]:leading-[1.8] [&_p]:mb-6 [&_p]:text-justify
                                    [&_h2]:font-display [&_h2]:!text-frogs-gold [&_h2]:text-2xl lg:text-3xl [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:tracking-tight
                                    [&_h3]:font-display [&_h3]:!text-frogs-text-light [&_h3]:text-xl lg:text-2xl [&_h3]:mt-10 [&_h3]:mb-4
                                    [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-8 [&_ul]:space-y-3
                                    [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-8 [&_ol]:space-y-3
                                    [&_li]:font-body [&_li]:text-base lg:text-lg [&_li]:leading-relaxed
                                    [&_br]:hidden [&_p+p]:mt-4
                                    prose-lead:text-frogs-text-light/90"
                                dangerouslySetInnerHTML={{ 
                                    __html: (language === 'EN' && page.contentEN ? page.contentEN : page.contentEL) || "" 
                                }} 
                            />
                        ) : (
                            <div className="p-32 text-center">
                                <p className="text-frogs-text-light/30 uppercase tracking-[0.4em] text-sm font-black italic">Content not found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
