import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FrogsBodyStyle from '@/components/FrogsBodyStyle';
import { getMenuLinks } from '@/app/lib/actions/menu';
import { getLegalPages, type LegalPageItem } from '@/app/lib/actions/legal';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    let menuLinks = [];
    try {
        menuLinks = await getMenuLinks();
    } catch (e) {
        // Fallback in case "npx prisma db push" wasn't run yet for MenuLink
        menuLinks = [
            { labelEN: 'Home', labelEL: 'Αρχική', href: '/' },
            { labelEN: 'Rooms', labelEL: 'Δωμάτια', href: '/rooms' },
            { labelEN: 'Gallery', labelEL: 'Γκαλερί', href: '/gallery' },
            { labelEN: 'Athens', labelEL: 'Αθήνα', href: '/athens' },
            { labelEN: 'Directory', labelEL: 'Οδηγός', href: '/directory' },
            { labelEN: 'Contact', labelEL: 'Επικοινωνία', href: '/contact' },
        ];
    }
    let legalPages: LegalPageItem[] = [];
    try {
        legalPages = await getLegalPages();
    } catch (e) {}
    return (
        <div className="relative bg-[#2A2D25] text-[#F9F6EF]">
            {/* Apply dark body colours client-side */}
            <FrogsBodyStyle />

            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Persistent Navigation */}
            <Navigation navLinks={menuLinks} />

            {/* Page Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Persistent Footer */}
            <Footer legalPages={legalPages} />
        </div>
    );
}
