"use client";
import { useState } from 'react';
import { X, Calendar, Users, Send, Check } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
}

export default function BookingModal({ isOpen, onClose, roomName }: BookingModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    room: roomName || '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: '2',
        room: '',
        message: '',
      });
      onClose();
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-frogs-dark/90 backdrop-blur-lg"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-frogs-dark border border-frogs-border/20 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-frogs-dark border-b border-frogs-border/10">
          <div>
            <span className="label-micro text-frogs-gold mb-2 block">BOOKING INQUIRY</span>
            <h2 className="font-display text-2xl lg:text-3xl text-frogs-text-light">
              {roomName ? roomName.toUpperCase() : 'SEND YOUR INQUIRY'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-frogs-border/20 flex items-center justify-center text-frogs-text-light/60 hover:border-frogs-gold hover:text-frogs-gold transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-frogs-gold/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-frogs-gold" />
              </div>
              <h3 className="font-display text-2xl text-frogs-text-light mb-2">
                INQUIRY SENT!
              </h3>
              <p className="font-body text-frogs-text-light/60">
                We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light placeholder-frogs-text-light/30 focus:outline-none focus:border-frogs-gold transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light placeholder-frogs-text-light/30 focus:outline-none focus:border-frogs-gold transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="label-micro text-frogs-text-light/50 mb-2 block">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light placeholder-frogs-text-light/30 focus:outline-none focus:border-frogs-gold transition-colors"
                  placeholder="+30 69X XXX XXXX"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                {/* Check In */}
                <div>
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    CHECK IN
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frogs-text-light/40" />
                    <input
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light focus:outline-none focus:border-frogs-gold transition-colors"
                    />
                  </div>
                </div>

                {/* Check Out */}
                <div>
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    CHECK OUT
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frogs-text-light/40" />
                    <input
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light focus:outline-none focus:border-frogs-gold transition-colors"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    GUESTS
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-frogs-text-light/40" />
                    <select
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light focus:outline-none focus:border-frogs-gold transition-colors appearance-none"
                    >
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Selection (if not pre-selected) */}
              {!roomName && (
                <div className="mb-4">
                  <label className="label-micro text-frogs-text-light/50 mb-2 block">
                    PREFERRED ROOM
                  </label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light focus:outline-none focus:border-frogs-gold transition-colors appearance-none"
                  >
                    <option value="">Any Room</option>
                    <option value="Deluxe Suite">Deluxe Suite</option>
                    <option value="Deluxe Triple Room">Deluxe Triple Room</option>
                    <option value="Deluxe Double Room">Deluxe Double Room</option>
                    <option value="The Loft">The Loft</option>
                    <option value="Sailor Room">Sailor Room</option>
                    <option value="African Room">African Room</option>
                  </select>
                </div>
              )}

              {/* Message */}
              <div className="mb-6">
                <label className="label-micro text-frogs-text-light/50 mb-2 block">
                  SPECIAL REQUESTS (OPTIONAL)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-frogs-dark border border-frogs-border/20 rounded-lg text-frogs-text-light placeholder-frogs-text-light/30 focus:outline-none focus:border-frogs-gold transition-colors resize-none"
                  placeholder="Any special requests or questions..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary w-full justify-center flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Inquiry
              </button>

              <p className="text-center font-body text-xs text-frogs-text-light/40 mt-4">
                We'll get back to you within 24 hours with availability and pricing.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
