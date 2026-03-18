import type { Metadata } from 'next';
import { getHomeSections } from '@/app/lib/actions/home-sections';
import { getGalleryImages } from '@/app/lib/actions/gallery';
import { getRooms } from '@/app/lib/actions/room';
import { getPageMeta } from '@/app/lib/actions/page-meta';
import { buildMetadata, lodgingBusinessSchema, buildFaqSchema } from '@/lib/metadata';
import type { HomeSectionRow } from '@/types/home-section';
import Hero from '@/sections/Hero';
import StayAndDrink from '@/sections/StayAndDrink';
import RoomsShowcase from '@/sections/RoomsShowcase';
import Guesthouse from '@/sections/Guesthouse';
import SecondBuilding from '@/sections/SecondBuilding';
import Bar from '@/sections/Bar';
import Location from '@/sections/Location';
import Amenities from '@/sections/Amenities';
import Testimonials from '@/sections/Testimonials';
import Gallery from '@/sections/Gallery';
import ContactCTA from '@/sections/ContactCTA';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const pageMeta = await getPageMeta('home');
  return buildMetadata(pageMeta);
}

export default async function Home() {
  const rawSections = await getHomeSections();
  const galleryImages = await getGalleryImages();
  const dbRooms = await getRooms();
  const pageMeta = await getPageMeta('home');
  const faqQuestions = Array.isArray((pageMeta as any)?.faqSuggestions)
    ? (pageMeta as any).faqSuggestions as string[]
    : [];
  const faqSchema = buildFaqSchema(faqQuestions);

  return (
    <main className="relative">
      {/* JSON-LD: LodgingBusiness (every page) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingBusinessSchema) }}
      />
      {/* JSON-LD: FAQPage (only if FAQ suggestions exist) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {rawSections
        .filter((sec: HomeSectionRow) => sec.published)
        .map((sec: HomeSectionRow) => {
          switch (sec.key) {
            case 'hero':
              return <Hero key={sec.key} data={sec} />;
            case 'stayAndDrink':
              return <StayAndDrink key={sec.key} data={sec} />;
            case 'rooms':
              return <RoomsShowcase key={sec.key} data={sec} dbRooms={dbRooms} />;
            case 'guesthouse':
              return <Guesthouse key={sec.key} data={sec} />;
            case 'secondBuilding':
              return <SecondBuilding key={sec.key} data={sec} />;
            case 'bar':
              return <Bar key={sec.key} data={sec} />;
            case 'location':
              return <Location key={sec.key} data={sec} />;
            case 'amenities':
              return <Amenities key={sec.key} data={sec} />;
            case 'testimonials':
              return <Testimonials key={sec.key} data={sec} />;
            case 'gallery':
              return <Gallery key={sec.key} data={sec} dbImages={galleryImages} />;
            case 'contactCta':
              return <ContactCTA key={sec.key} data={sec} />;
            default:
              return null;
          }
        })}
    </main>
  );
}

