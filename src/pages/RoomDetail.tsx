"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Maximize,
  Check,
  ArrowLeft,
  Bed,
  Bath,
  Wifi,
  Wind,
  Coffee,
  Sparkles,
  X,
  Send
} from 'lucide-react';
import BookingModal from '../components/BookingModal';

gsap.registerPlugin(ScrollTrigger);

const roomsData = {
  'deluxe-suite': {
    id: 'deluxe-suite',
    name: 'Deluxe Suite',
    label: 'MAIN BUILDING • EST. 2018',
    size: 30,
    maxGuests: 4,
    beds: '1 King + 2 Sofa Beds',
    bathroom: 'Ensuite with separate shower',
    description: 'Our Deluxe Suite has a separate room with a king size bed and a living room with 2 Single Sofa Beds. Can accommodate up to 4 people and has an ensuite bathroom with a separate shower room. Always aiming for the best quality and comfort of our guests — all our linens & towels are 100% cotton. The stylish décor inspired from the Greek art combines natural fibers and colourful textiles. The room has a private terrace that offers a view to the urban side of the centre of Athens.',
    images: [
      '/images/room-deluxe-suite.jpg',
      '/images/guesthouse-room.jpg',
      '/images/reservation-room.jpg',
      '/images/gallery-2.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Terrace', '2 Single Sofa Beds', 'Free WiFi', 'Hairdryer'
    ],
    price: 'From €120/night',
  },
  'deluxe-triple': {
    id: 'deluxe-triple',
    name: 'Deluxe Triple Room',
    label: 'MAIN BUILDING • EST. 2018',
    size: 26,
    maxGuests: 3,
    beds: '1 King + 1 Single Sofa Bed',
    bathroom: 'Ensuite bathroom',
    description: 'Our Deluxe Triple room has a king size bed, a single sofa bed and an ensuite bathroom. Perfect for small groups or families looking for comfort and style in the heart of Athens.',
    images: [
      '/images/room-deluxe-triple.jpg',
      '/images/guesthouse-room.jpg',
      '/images/reservation-room.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Single Sofa Bed', 'Free WiFi', 'Hairdryer'
    ],
    price: 'From €95/night',
  },
  'deluxe-double': {
    id: 'deluxe-double',
    name: 'Deluxe Double Room',
    label: 'MAIN BUILDING • EST. 2018',
    size: 22,
    maxGuests: 2,
    beds: '1 King Bed',
    bathroom: 'Ensuite bathroom',
    description: 'Our Deluxe Double room has a king size bed and an ensuite bathroom. A cozy retreat perfect for couples exploring Athens.',
    images: [
      '/images/room-deluxe-double.jpg',
      '/images/guesthouse-room.jpg',
      '/images/reservation-room.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Free WiFi', 'Hairdryer'
    ],
    price: 'From €85/night',
  },
  'loft': {
    id: 'loft',
    name: 'The Loft',
    label: 'NEXT DOOR • NEW APARTMENTS',
    size: 37,
    maxGuests: 4,
    beds: '1 King (upper) + 1 Double Sofa (lower)',
    bathroom: 'Ensuite bathroom',
    description: 'This one-story loft features a king-size bed on the upper level and a spacious living room with a double sofa bed on the lower level, accommodating up to 4 people. Industrial chic design with modern amenities.',
    images: [
      '/images/room-loft.jpg',
      '/images/reservation-room.jpg',
      '/images/gallery-2.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Double Sofa Bed', 'Free WiFi', 'Hairdryer'
    ],
    price: 'From €140/night',
  },
  'sailor': {
    id: 'sailor',
    name: 'Deluxe Triple Sailor Room',
    label: 'NEXT DOOR • NEW APARTMENTS',
    size: 32,
    maxGuests: 3,
    beds: '1 King + 1 Single Sofa Bed',
    bathroom: 'Ensuite shower',
    description: 'Our Deluxe Triple Sailor Room has a king size bed and a single sofa bed which are in the same space. The bathroom with a shower can be found ensuite. Nautical themed with maritime charm.',
    images: [
      '/images/room-sailor.jpg',
      '/images/reservation-room.jpg',
      '/images/gallery-2.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Single Sofa Bed', 'Free WiFi', 'Hairdryer'
    ],
    price: 'From €100/night',
  },
  'african': {
    id: 'african',
    name: 'Deluxe Double African Room',
    label: 'NEXT DOOR • NEW APARTMENTS',
    size: 30,
    maxGuests: 2,
    beds: '1 King Bed',
    bathroom: 'Ensuite bathroom & shower',
    description: 'Our Deluxe Double African Room is a haven of cultural fusion. This stylish curated room features a king-size bed accompanied by an ensuite bathroom and shower. Rich textures and warm earth tones create an inviting atmosphere.',
    images: [
      '/images/room-african.jpg',
      '/images/reservation-room.jpg',
      '/images/gallery-2.jpg',
    ],
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Wind, label: 'Air Conditioning' },
      { icon: Coffee, label: 'Coffee & Tea' },
      { icon: Sparkles, label: 'Daily Cleaning' },
    ],
    facilities: [
      'Minibar', 'Safety Deposit Box', 'Air Conditioning', 'Iron',
      'Heating', 'Flat-screen TV', 'Electric Kettle', 'Wardrobe/Closet',
      'Free WiFi', 'Hairdryer'
    ],
    price: 'From €110/night',
  },
};

const relatedRooms = [
  { id: 'deluxe-suite', name: 'Deluxe Suite', image: '/images/room-deluxe-suite.jpg' },
  { id: 'deluxe-triple', name: 'Deluxe Triple', image: '/images/room-deluxe-triple.jpg' },
  { id: 'deluxe-double', name: 'Deluxe Double', image: '/images/room-deluxe-double.jpg' },
  { id: 'loft', name: 'The Loft', image: '/images/room-loft.jpg' },
];

export default function RoomDetail() {
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId;
  const router = useRouter();
  const room = roomId ? roomsData[roomId as keyof typeof roomsData] : null;

  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    if (!room) return;

    const ctx = gsap.context(() => {
      // Hero animation
      const heroTitle = heroRef.current?.querySelector('.hero-title');
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
          }
        );
      }

      // Info section animations
      if (infoRef.current) {
        gsap.fromTo(
          infoRef.current.querySelector('.info-header'),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          infoRef.current.querySelectorAll('.info-card'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: infoRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        gsap.fromTo(
          infoRef.current.querySelectorAll('.facility-item'),
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: infoRef.current.querySelector('.facilities-grid'),
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Gallery animation
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: galleryRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Related rooms animation
      if (relatedRef.current) {
        gsap.fromTo(
          relatedRef.current.querySelectorAll('.related-card'),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: relatedRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [room]);

  // Reset scroll when room changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setCurrentImage(0);
  }, [roomId]);

  if (!room) {
    return (
      <div className="min-h-screen bg-frogs-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-4xl text-frogs-text-light mb-4">Room Not Found</h2>
          <Link href="/rooms" className="btn-primary">View All Rooms</Link>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const otherRelatedRooms = relatedRooms.filter(r => r.id !== room.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-frogs-dark">
      {/* Hero Section with Image Gallery */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {room.images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ${index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={img}
                alt={`${room.name} - View ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-frogs-dark/60 to-transparent" />
        </div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-6 lg:p-8 z-20">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-frogs-text-light/80 hover:text-frogs-gold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-body text-sm">Back</span>
            </button>
            <Link href="/rooms" className="text-frogs-text-light/80 hover:text-frogs-gold transition-colors font-body text-sm">
              All Rooms
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-16 z-10">
          <div className="max-w-4xl">
            <span className="label-micro text-frogs-gold mb-4 block">{room.label}</span>
            <h1 className="hero-title font-display text-5xl lg:text-8xl text-frogs-text-light mb-6">
              {room.name.toUpperCase()}
            </h1>
            <p className="font-body text-lg text-frogs-text-light/80 max-w-xl mb-8">
              {room.description.slice(0, 150)}...
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-frogs-text-light/70">
                <Maximize className="w-5 h-5" />
                <span className="font-body">{room.size} m²</span>
              </div>
              <div className="flex items-center gap-2 text-frogs-text-light/70">
                <Users className="w-5 h-5" />
                <span className="font-body">Up to {room.maxGuests} guests</span>
              </div>
              <div className="flex items-center gap-2 text-frogs-text-light/70">
                <Bed className="w-5 h-5" />
                <span className="font-body">{room.beds}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setBookingModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Book Now — {room.price}
              </button>
              <button
                onClick={() => openLightbox(currentImage)}
                className="btn-secondary"
              >
                View Gallery
              </button>
            </div>
          </div>
        </div>

        {/* Image Navigation */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
          <button
            onClick={prevImage}
            className="w-12 h-12 rounded-full bg-frogs-dark/50 backdrop-blur-sm border border-frogs-border/30 flex items-center justify-center text-frogs-text-light hover:bg-frogs-gold hover:border-frogs-gold hover:text-frogs-dark transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {room.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentImage ? 'bg-frogs-gold w-6' : 'bg-frogs-text-light/30'
                  }`}
              />
            ))}
          </div>
          <button
            onClick={nextImage}
            className="w-12 h-12 rounded-full bg-frogs-dark/50 backdrop-blur-sm border border-frogs-border/30 flex items-center justify-center text-frogs-text-light hover:bg-frogs-gold hover:border-frogs-gold hover:text-frogs-dark transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="w-6 h-10 rounded-full border-2 border-frogs-text-light/30 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-frogs-gold rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* Room Info Section */}
      <div ref={infoRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="info-header mb-12">
                <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light mb-6">
                  ABOUT THIS ROOM
                </h2>
                <p className="font-body text-lg text-frogs-text-light/70 leading-relaxed">
                  {room.description}
                </p>
              </div>

              {/* Room Details Cards */}
              <div className="grid sm:grid-cols-3 gap-4 mb-12">
                <div className="info-card p-6 rounded-xl bg-frogs-dark/50 border border-frogs-border/10">
                  <Maximize className="w-6 h-6 text-frogs-gold mb-3" />
                  <p className="label-micro text-frogs-text-light/50 mb-1">SIZE</p>
                  <p className="font-display text-2xl text-frogs-text-light">{room.size} m²</p>
                </div>
                <div className="info-card p-6 rounded-xl bg-frogs-dark/50 border border-frogs-border/10">
                  <Users className="w-6 h-6 text-frogs-gold mb-3" />
                  <p className="label-micro text-frogs-text-light/50 mb-1">GUESTS</p>
                  <p className="font-display text-2xl text-frogs-text-light">Up to {room.maxGuests}</p>
                </div>
                <div className="info-card p-6 rounded-xl bg-frogs-dark/50 border border-frogs-border/10">
                  <Bath className="w-6 h-6 text-frogs-gold mb-3" />
                  <p className="label-micro text-frogs-text-light/50 mb-1">BATHROOM</p>
                  <p className="font-body text-sm text-frogs-text-light">{room.bathroom}</p>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-12">
                <h3 className="font-heading text-2xl text-frogs-text-light mb-6">Key Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {room.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-frogs-gold/10 text-frogs-gold"
                    >
                      <amenity.icon className="w-4 h-4" />
                      <span className="font-body text-sm">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Facilities */}
              <div>
                <h3 className="font-heading text-2xl text-frogs-text-light mb-6">All Facilities</h3>
                <div className="facilities-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="facility-item flex items-center gap-2 text-frogs-text-light/70"
                    >
                      <Check className="w-4 h-4 text-frogs-gold flex-shrink-0" />
                      <span className="font-body text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-8 rounded-2xl bg-frogs-gold/5 border border-frogs-gold/20">
                <p className="label-micro text-frogs-gold mb-2">STARTING FROM</p>
                <p className="font-display text-4xl text-frogs-text-light mb-2">{room.price}</p>
                <p className="font-body text-sm text-frogs-text-light/50 mb-6">per night, including taxes</p>

                <button
                  onClick={() => setBookingModalOpen(true)}
                  className="btn-primary w-full justify-center mb-4 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Inquiry
                </button>

                <div className="space-y-3 pt-6 border-t border-frogs-border/10">
                  <div className="flex items-center gap-3 text-frogs-text-light/70">
                    <Check className="w-4 h-4 text-frogs-gold" />
                    <span className="font-body text-sm">Free cancellation</span>
                  </div>
                  <div className="flex items-center gap-3 text-frogs-text-light/70">
                    <Check className="w-4 h-4 text-frogs-gold" />
                    <span className="font-body text-sm">Best price guarantee</span>
                  </div>
                  <div className="flex items-center gap-3 text-frogs-text-light/70">
                    <Check className="w-4 h-4 text-frogs-gold" />
                    <span className="font-body text-sm">Instant confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Section */}
      <div ref={galleryRef} className="py-20 lg:py-32 px-6 lg:px-16 bg-frogs-dark/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="label-micro text-frogs-gold mb-4 block">TAKE A LOOK</span>
              <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light">
                ROOM GALLERY
              </h2>
            </div>
            <p className="hidden lg:block font-body text-frogs-text-light/50">
              Click any image to view full size
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {room.images.map((img, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className={`relative overflow-hidden rounded-xl group ${index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
              >
                <div className={index === 0 ? 'aspect-square' : 'aspect-[4/3]'}>
                  <img
                    src={img}
                    alt={`${room.name} view ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-frogs-dark/40 opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full bg-frogs-gold/90 flex items-center justify-center">
                    <span className="font-display text-frogs-dark text-lg">+</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Related Rooms */}
      <div ref={relatedRef} className="py-20 lg:py-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="label-micro text-frogs-gold mb-4 block">YOU MIGHT ALSO LIKE</span>
            <h2 className="font-display text-4xl lg:text-5xl text-frogs-text-light">
              RELATED ROOMS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherRelatedRooms.map((relatedRoom) => (
              <Link key={relatedRoom.id}
                href={`/rooms/${relatedRoom.id}`}
                className="related-card group relative overflow-hidden rounded-xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={relatedRoom.image}
                    alt={relatedRoom.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-frogs-dark via-frogs-dark/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl text-frogs-text-light group-hover:text-frogs-gold transition-colors">
                    {relatedRoom.name.toUpperCase()}
                  </h3>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-frogs-gold/0 border border-frogs-text-light/30 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-frogs-gold group-hover:border-frogs-gold transition-all">
                  <ChevronRight className="w-5 h-5 text-frogs-text-light group-hover:text-frogs-dark" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-frogs-dark/98 backdrop-blur-lg">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-frogs-dark/50 border border-frogs-border/30 flex items-center justify-center text-frogs-text-light hover:bg-frogs-gold hover:border-frogs-gold hover:text-frogs-dark transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="h-full flex items-center justify-center p-6 lg:p-16">
            <button
              onClick={() => setLightboxIndex((prev) => (prev - 1 + room.images.length) % room.images.length)}
              className="absolute left-6 w-12 h-12 rounded-full bg-frogs-dark/50 border border-frogs-border/30 flex items-center justify-center text-frogs-text-light hover:bg-frogs-gold hover:border-frogs-gold hover:text-frogs-dark transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={room.images[lightboxIndex]}
              alt={`${room.name} - Full view`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />

            <button
              onClick={() => setLightboxIndex((prev) => (prev + 1) % room.images.length)}
              className="absolute right-6 w-12 h-12 rounded-full bg-frogs-dark/50 border border-frogs-border/30 flex items-center justify-center text-frogs-text-light hover:bg-frogs-gold hover:border-frogs-gold hover:text-frogs-dark transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {room.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setLightboxIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === lightboxIndex ? 'bg-frogs-gold w-6' : 'bg-frogs-text-light/30'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        roomName={room.name}
      />
    </div>
  );
}
