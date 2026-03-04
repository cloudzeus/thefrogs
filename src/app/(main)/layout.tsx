import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import FrogsBodyStyle from '@/components/FrogsBodyStyle';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative bg-[#2A2D25] text-[#F9F6EF]">
            {/* Apply dark body colours client-side */}
            <FrogsBodyStyle />

            {/* Grain Overlay */}
            <div className="grain-overlay" />

            {/* Persistent Navigation */}
            <Navigation />

            {/* Page Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Persistent Footer */}
            <Footer />
        </div>
    );
}
