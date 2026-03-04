import Directory from "@/pages/Directory";
import { getPageMeta } from "@/app/lib/actions/page-meta";

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
    const pageMeta = await getPageMeta("directory");
    return <Directory pageMeta={pageMeta} />;
}
