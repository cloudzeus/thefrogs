import { notFound } from "next/navigation";
import { getCustomPageBySlug } from "@/app/lib/actions/custom-pages";
import { getLegalPage } from "@/app/lib/actions/legal";
import type { Metadata } from 'next';
import AnimatedCustomPage from "@/components/AnimatedCustomPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const p = await params;
    const customPage = await getCustomPageBySlug(p.slug);
    if (customPage) return { title: customPage.titleEN || customPage.titleEL };
    
    const legalPage = await getLegalPage(p.slug);
    if (legalPage) return { title: legalPage.titleEN || legalPage.titleEL };

    return {};
}

export default async function CustomDynamicPage({ params }: { params: Promise<{ slug: string }> }) {
    const p = await params;
    const customPage = await getCustomPageBySlug(p.slug);
    
    if (customPage) {
        return (
            <div className="min-h-screen bg-frogs-dark">
                <AnimatedCustomPage 
                    blocks={customPage.blocks} 
                    titleEL={customPage.titleEL} 
                    titleEN={customPage.titleEN} 
                    heroImage={customPage.heroImage} 
                />
            </div>
        );
    }

    const legalPage = await getLegalPage(p.slug);
    if (legalPage) {
        // Legal pages usually just have Title + single HTML Content block
        return (
            <main className="min-h-screen pt-40 pb-32 max-w-4xl mx-auto px-6 md:px-12 relative z-20 bg-frogs-dark text-frogs-text-light">
                <div className="mb-16">
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#F9F6EF] tracking-wide mb-6">
                        {legalPage.titleEN || legalPage.titleEL}
                    </h1>
                    <div className="h-px w-16 bg-[#C9A84C]/50 mt-6 mb-8" />
                </div>
                <div 
                    className="prose prose-lg prose-invert max-w-none 
                        prose-headings:font-display prose-headings:text-[#F9F6EF] prose-headings:font-medium
                        prose-p:font-body prose-p:text-[#F9F6EF]/70 prose-p:leading-loose
                        prose-a:text-[#C9A84C] prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[#F9F6EF] prose-strong:font-bold
                        prose-ul:text-[#F9F6EF]/70 prose-li:marker:text-[#C9A84C]
                        prose-li:font-body prose-li:leading-loose"
                    dangerouslySetInnerHTML={{ __html: legalPage.contentEN || legalPage.contentEL || "" }}
                />
            </main>
        );
    }

    notFound();
}
