import { getHomeSections } from '@/app/lib/actions/home-sections';
import { getGalleryImages } from '@/app/lib/actions/gallery';
import { getRooms } from '@/app/lib/actions/room';
import type { HomeSectionRow } from '@/types/home-section';
import Hero from '@/sections/Hero';
import StayAndDrink from '@/sections/StayAndDrink';
import RoomsShowcase from '@/sections/RoomsShowcase';
import Guesthouse from '@/sections/Guesthouse';
import Bar from '@/sections/Bar';
import Location from '@/sections/Location';
import Amenities from '@/sections/Amenities';
import Testimonials from '@/sections/Testimonials';
import Gallery from '@/sections/Gallery';
import ContactCTA from '@/sections/ContactCTA';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const rawSections = await getHomeSections();
  const galleryImages = await getGalleryImages();
  const dbRooms = await getRooms();
  // Build a key→row map for easy lookup
  const s: Record<string, HomeSectionRow> = Object.fromEntries(
    rawSections.map((row: HomeSectionRow) => [row.key, row])
  );

  return (
    <main className="relative">
      <Hero data={s.hero} />
      <StayAndDrink data={s.stayAndDrink} />
      <RoomsShowcase data={s.rooms} dbRooms={dbRooms} />
      <Guesthouse data={s.guesthouse} />
      <Bar data={s.bar} />
      <Location data={s.location} />
      <Amenities data={s.amenities} />
      <Testimonials data={s.testimonials} />
      <Gallery data={s.gallery} dbImages={galleryImages} />
      <ContactCTA data={s.contactCta} />
    </main>
  );
}
