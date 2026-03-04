"use client";
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const form = formRef.current;
    const info = infoRef.current;

    if (!hero) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        hero.querySelector('.hero-title'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
        }
      );

      if (info) {
        gsap.fromTo(
          info.querySelectorAll('.info-item'),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: info,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (form) {
        gsap.fromTo(
          form,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: form,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="bg-frogs-dark min-h-screen">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative h-[50vh] lg:h-[60vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="/images/contact-coffee.jpg"
            alt="Contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-frogs-dark/60" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="hero-title font-display text-giant text-frogs-text-light mb-4">
            CONTACT US
          </h1>
          <p className="font-body text-lg text-frogs-text-light/80 max-w-xl mx-auto">
            Always a pleasure to hear from you. For any special requests or other
            enquiries do not hesitate to drop us a line.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 lg:py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Info Cards */}
            <div ref={infoRef} className="lg:col-span-1 space-y-6">
              <div className="info-item p-6 rounded-lg bg-[#33352A] border border-frogs-border/10">
                <MapPin className="w-6 h-6 text-frogs-gold mb-4" />
                <h3 className="font-heading text-xl text-frogs-text-light mb-2">
                  Address
                </h3>
                <p className="font-body text-frogs-text-light">
                  4 Aristofanous Str.
                  <br />
                  Athens, Greece 10554
                </p>
              </div>

              <div className="info-item p-6 rounded-lg bg-[#33352A] border border-frogs-border/10">
                <Phone className="w-6 h-6 text-frogs-gold mb-4" />
                <h3 className="font-heading text-xl text-frogs-text-light mb-2">
                  Call Us
                </h3>
                <a
                  href="tel:+302114019607"
                  className="font-body text-frogs-text-light hover:text-frogs-gold transition-colors"
                >
                  +30 21 1401 9607
                </a>
                <br />
                <a
                  href="https://wa.me/+306976908878"
                  className="font-body text-frogs-text-light hover:text-frogs-gold transition-colors"
                >
                  WhatsApp: +30 697 690 8878
                </a>
              </div>

              <div className="info-item p-6 rounded-lg bg-[#33352A] border border-frogs-border/10">
                <Mail className="w-6 h-6 text-frogs-gold mb-4" />
                <h3 className="font-heading text-xl text-frogs-text-light mb-2">
                  Email
                </h3>
                <a
                  href="mailto:thefrogs.guesthouse@gmail.com"
                  className="font-body text-frogs-text-light hover:text-frogs-gold transition-colors"
                >
                  thefrogs.guesthouse@gmail.com
                </a>
              </div>

              <div className="info-item p-6 rounded-lg bg-[#33352A] border border-frogs-border/10">
                <Clock className="w-6 h-6 text-frogs-gold mb-4" />
                <h3 className="font-heading text-xl text-frogs-text-light mb-2">
                  Reception Hours
                </h3>
                <p className="font-body text-frogs-text-light">
                  24/7 Check-in Available
                  <br />
                  Front Desk: 8:00 AM – 10:00 PM
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-8 lg:p-12 rounded-lg bg-[#33352A] border border-frogs-border/10"
              >
                <h2 className="font-heading text-2xl text-frogs-text-light mb-8">
                  Send us a message
                </h2>

                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="label-micro text-frogs-text-light mb-2 block"
                    >
                      NAME
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/30 rounded-lg text-frogs-text-light placeholder-frogs-text-light/60 focus:outline-none focus:border-frogs-gold transition-colors"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="label-micro text-frogs-text-light mb-2 block"
                    >
                      EMAIL
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/30 rounded-lg text-frogs-text-light placeholder-frogs-text-light/60 focus:outline-none focus:border-frogs-gold transition-colors"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label
                    htmlFor="message"
                    className="label-micro text-frogs-text-light mb-2 block"
                  >
                    MESSAGE
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/30 rounded-lg text-frogs-text-light placeholder-frogs-text-light/60 focus:outline-none focus:border-frogs-gold transition-colors resize-none"
                    placeholder="Tell us about your enquiry..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={submitted}
                >
                  {submitted ? (
                    <>Message Sent!</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[50vh] lg:h-[60vh]">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3145.054054054054!2d23.7214!3d37.9781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDU4JzQxLjIiTiAyM8KwNDMnMTcuMCJF!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="The Frogs Guesthouse Location"
        />
      </section>
    </div>
  );
}
