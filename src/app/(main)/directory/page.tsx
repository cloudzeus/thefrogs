import type { Metadata } from 'next';
import Directory from "@/pages/Directory";
import { getPageMeta } from "@/app/lib/actions/page-meta";
import { getDirectoryItems } from "@/app/lib/actions/directory";
import { buildMetadata, lodgingBusinessSchema, buildBreadcrumbSchema } from "@/lib/metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://frogs.wwa.gr';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const pageMeta = await getPageMeta('directory');
    return buildMetadata(pageMeta, { canonicalHint: '/directory' });
}

export default async function DirectoryPage() {
    const [pageMeta, items] = await Promise.all([
        getPageMeta('directory'),
        getDirectoryItems(),
    ]);

    const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: SITE_URL },
        { name: 'Guest Directory', url: `${SITE_URL}/directory` },
    ]);

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
            <Directory pageMeta={pageMeta} items={items} />
        </>
    );
}
