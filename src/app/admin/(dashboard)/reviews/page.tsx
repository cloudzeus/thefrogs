import { getReviews } from "@/app/lib/actions/review";
import { DataTableReviews } from "@/components/admin/reviews/data-table-reviews";

export default async function ReviewsPage() {
    const reviews = await getReviews();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Reviews</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage guest reviews with bilingual content and DeepSeek translations.</p>
            </div>
            <DataTableReviews data={reviews} />
        </div>
    );
}
