import { getRooms } from "@/app/lib/actions/room";
import { DataTableRooms } from "@/components/admin/rooms/data-table-rooms";

export const dynamic = "force-dynamic";

export default async function RoomsAdminPage() {
    const rooms = await getRooms();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tighter text-zinc-800 dark:text-zinc-100">Rooms</h1>
                <p className="text-sm text-zinc-500 mt-1">Manage hotel rooms, descriptions, pricing and gallery images.</p>
            </div>
            <DataTableRooms data={rooms} />
        </div>
    );
}
