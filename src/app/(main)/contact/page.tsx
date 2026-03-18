import type { Metadata } from 'next';
import Contact from "@/pages/Contact";
import { getPageMeta } from "@/app/lib/actions/page-meta";
import { buildMetadata, lodgingBusinessSchema, buildBreadcrumbSchema } from "@/lib/metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export async function generateMetadata(): Promise<Metadata> {
    const pageMeta = await getPageMeta('contact');
    return buildMetadata(pageMeta, { canonicalHint: '/contact' });
}

export default async function ContactPage() {
    const pageMeta = await getPageMeta('contact');

    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Contact', url: `${SITE_URL}/contact` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <Contact pageMeta={pageMeta} />
        </>
    );
}
