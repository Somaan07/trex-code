"use client";
import { supabase } from './supabase';
import { useState } from "react";

// ─── Colour & design tokens (mirrored in Tailwind classes below) ───────────────
// Navy:      #0B1629  /  #0F2040  /  #162B50
// Gold:      #C8882A  /  #E09A30  (warm orange-gold)
// Green CTA: #1A9E4F  /  #22C06A
// Smoke:     #F4F6FA  (off-white section bg)
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Home", "Services", "Testimonials"];

const SERVICES = [
  {
    icon: "🪟",
    title: "Window Cleaning",
    desc: "Streak-free residential and commercial window cleaning — inside, outside, and hard-to-reach panes.",
  },
  {
    icon: "🍂",
    title: "Eavestrough Cleaning",
    desc: "Full gutter flush and debris removal to protect your foundation and prevent costly water damage.",
  },
  {
    icon: "🔧",
    title: "Eavestrough Repair & Replacement",
    desc: "Sealing leaks, re-pitching, refastening, and full section replacements with quality aluminum materials.",
  },
  {
    icon: "🏠",
    title: "Aluminum Siding Cleaning",
    desc: "Soft-wash treatment that lifts oxidation, mildew, and road grime without damaging your siding finish.",
  },
  {
    icon: "💦",
    title: "Commercial Power-Washing",
    desc: "High-pressure washing for driveways, parking lots, storefronts, and commercial exterior surfaces.",
  },
];

const SERVICE_OPTIONS = [
  "Window Cleaning",
  "Eavestrough Cleaning",
  "Eavestrough Repair & Replacement",
  "Aluminum Siding Cleaning",
  "Commercial Power-Washing",
];

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    service: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // This acts as our gatekeeper tracker

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    // If the form is already sending data, stop immediately to prevent duplicates
    if (loading) return; 
    setLoading(true); 
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            service_needed: form.service || 'Window Cleaning',
            status: 'New'
          }
        ]);

      if (error) throw error;
      // Ping our internal secure server route to shoot the email to Mom instantly
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          service: form.service
        })
      });

      setForm({ name: "", phone: "", email: "", address: "", service: "" });
      setSubmitted(true);
      
    } catch (err) {
      console.error('Error saving quote to database:', err);
      alert('Something went wrong. Please try again!');
    } finally {
      setLoading(false); // Re-open the gatekeeper after completion
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-sans text-[#0B1629]">

      {/* ══════════════════════════════════════════════════════════════════════
          HEADER / NAV
      ══════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#0B1629] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">

          {/* Logo + wordmark */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Mascot Image */}
            <img 
              src="/trex-logo.png" 
              alt="T-Rex Window Cleaning Logo" 
              className="w-14 h-14 object-contain flex-shrink-0"
            />

            {/* Wordmark */}
            <div className="min-w-0">
              <p className="text-white font-extrabold text-base sm:text-lg leading-tight tracking-tight whitespace-nowrap">
                T-Rex Window &amp; Eaves
              </p>
              <p className="text-[#C8882A] font-semibold text-xs sm:text-sm tracking-widest uppercase">
                Cleaning INC.
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-slate-300 hover:text-[#E09A30] text-sm font-medium tracking-wide transition-colors duration-150"
              >
                {link}
              </a>
            ))}

            {/* CTA phone button */}
            <a
              href="tel:4165318739"
              className="ml-2 inline-flex items-center gap-2 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap"
            >
              <PhoneIcon />
              416-531-TREX
            </a>
          </nav>

          {/* Mobile phone button only */}
          <a
            href="tel:4165318739"
            className="md:hidden inline-flex items-center gap-1.5 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            <PhoneIcon />
            Call Now
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative bg-[#0F2040] overflow-hidden"
      >
        {/* Decorative angled sweep — the "wipe" signature motif */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Large transparent water-drop sweep */}
          <div className="absolute -top-24 -right-32 w-[600px] h-[600px] rounded-full bg-[#162B50] opacity-60" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#C8882A] via-[#E09A30] to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          {/* Eyebrow */}
          <p className="inline-flex items-center gap-2 text-[#E09A30] text-xs font-bold uppercase tracking-[0.2em] mb-5">
            <span className="w-6 h-px bg-[#C8882A]" />
            Serving the GTA Since 2007
          </p>

          {/* Headline */}
          <h1 className="text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-3xl mb-6">
            Premium Residential &amp; Commercial{" "}
            <span className="text-[#E09A30]">Window &amp; Eavestrough</span>{" "}
            Maintenance in the GTA
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
            Trusted, family-owned &amp; fully insured service — delivered with
            care and professionalism since 2007.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#estimate"
              className="inline-flex justify-center items-center gap-2 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              Get a Free Estimate
              <ArrowIcon />
            </a>
            <a
              href="tel:4165318739"
              className="inline-flex justify-center items-center gap-2 border-2 border-[#C8882A] text-[#E09A30] hover:bg-[#C8882A] hover:text-white text-base font-semibold px-8 py-4 rounded-xl transition-all duration-200"
            >
              <PhoneIcon />
              416-531-8739
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-12">
            {["Fully Insured", "Family-Owned", "17+ Years Experience", "Free Estimates"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-slate-400 text-sm">
                <CheckIcon />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SERVICES
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 sm:py-28 bg-[#F4F6FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-14">
            <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              What We Do
            </p>
            <h2 className="text-[#0B1629] font-extrabold text-3xl sm:text-4xl mb-4">
              Our Services
            </h2>
            <div className="w-12 h-1 bg-[#C8882A] rounded-full" />
          </div>

          {/* Service cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc) => (
              <div
                key={svc.title}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-[#C8882A]/30 p-7 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon bubble */}
                <div className="w-14 h-14 rounded-xl bg-[#0F2040] flex items-center justify-center text-2xl mb-5 group-hover:bg-[#C8882A] transition-colors duration-300">
                  {svc.icon}
                </div>

                {/* Clean-streak accent line */}
                <div className="w-8 h-0.5 bg-[#C8882A] rounded-full mb-4 group-hover:w-14 transition-all duration-300" />

                <h3 className="text-[#0B1629] font-bold text-lg mb-2">
                  {svc.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            ))}

            {/* "More on request" card */}
            <div className="bg-[#0F2040] rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <p className="text-[#E09A30] text-xs font-bold uppercase tracking-widest mb-3">
                  Not Listed?
                </p>
                <h3 className="text-white font-bold text-lg mb-3 leading-snug">
                  Have a unique job?<br />We&apos;ll take a look.
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Call us or send a quote request and we&apos;ll let you know what we can do.
                </p>
              </div>
              <a
                href="#estimate"
                className="mt-6 inline-flex items-center gap-2 text-[#22C06A] font-semibold text-sm hover:text-white transition-colors"
              >
                Request a Quote <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ESTIMATE FORM
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="estimate"
        className="py-20 sm:py-28 bg-[#0B1629]"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              No Obligation
            </p>
            <h2 className="text-white font-extrabold text-3xl sm:text-4xl mb-4">
              Get a Free Quote
            </h2>
            <p className="text-slate-400 text-base max-w-md mx-auto">
              Fill in the form below and we&apos;ll get back to you within one business day.
            </p>
          </div>

          {/* Card */}
          {submitted ? (
            <div className="bg-[#162B50] rounded-2xl border border-[#1A9E4F]/40 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A9E4F]/20 flex items-center justify-center mx-auto mb-5">
                <CheckIcon large />
              </div>
              <h3 className="text-white font-bold text-2xl mb-2">
                Request Received!
              </h3>
              <p className="text-slate-400">
                Thanks for reaching out. We&apos;ll be in touch at the contact info you provided.
              </p>
            </div>
          ) : (
            <div className="bg-[#162B50] rounded-2xl border border-white/10 p-8 sm:p-10 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                />
                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="416-555-0100"
                  value={form.phone}
                  onChange={handleChange}
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
                <FormField
                  label="Property Address"
                  name="address"
                  type="text"
                  placeholder="123 Main St, Toronto, ON"
                  value={form.address}
                  onChange={handleChange}
                />

                {/* Service dropdown — full width */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">
                    Service Needed
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full bg-[#0F2040] text-white border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8882A] transition appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      — Select a service —
                    </option>
                    {SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-8 w-full bg-[#1A9E4F] hover:bg-[#22C06A] disabled:bg-slate-600 text-white font-bold text-base py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Quote Request"}
              </button>

              <p className="text-slate-500 text-xs text-center mt-4">
                We respect your privacy. Your information is never shared.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS (placeholder section)
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-20 sm:py-28 bg-[#F4F6FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">
              What Our Clients Say
            </p>
            <h2 className="text-[#0B1629] font-extrabold text-3xl sm:text-4xl mb-4">
              Testimonials
            </h2>
            <div className="w-12 h-1 bg-[#C8882A] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                location: "North York",
                quote:
                  "T-Rex has been cleaning our windows for three years. Punctual, professional, and the results are always spotless.",
              },
              {
                name: "David K.",
                location: "Etobicoke",
                quote:
                  "They saved us from a very costly water damage situation — our eavestroughs were completely clogged. Highly recommend.",
              },
              {
                name: "Linda T.",
                location: "Scarborough",
                quote:
                  "Friendly team, fair price, and they even cleaned up after themselves. Will definitely call them again in the fall.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F2040] flex items-center justify-center text-white text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-[#0B1629] font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#0B1629] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <p className="text-white font-extrabold text-base mb-1">
                T-Rex Window &amp; Eaves Cleaning INC.
              </p>
              <p className="text-[#C8882A] text-xs font-semibold uppercase tracking-widest mb-4">
                Est. 2007
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Family-owned, fully insured exterior cleaning services across
                Toronto and the Greater Toronto Area.
              </p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-slate-300 font-bold text-sm uppercase tracking-wide mb-4">
                Contact
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="tel:4165318739"
                    className="hover:text-[#E09A30] transition-colors"
                  >
                    📞 416-531-TREX (8739)
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@trexcanada.com"
                    className="hover:text-[#E09A30] transition-colors"
                  >
                    ✉️ info@trexcanada.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Service areas */}
            <div>
              <p className="text-slate-300 font-bold text-sm uppercase tracking-wide mb-4">
                Service Areas
              </p>
              <ul className="space-y-1 text-sm text-slate-400">
                {[
                  "Toronto",
                  "North York",
                  "Scarborough",
                  "Etobicoke",
                  "Surrounding GTA",
                ].map((area) => (
                  <li key={area} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8882A]" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} T-Rex Window &amp; Eaves Cleaning INC. All rights reserved.
            </p>
            <p className="flex items-center gap-2">
              <ShieldIcon />
              Fully Insured · Proudly Serving the GTA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Reusable sub-components ─────────────────────────────────────────────── */

function FormField({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-semibold mb-1.5">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-[#0F2040] text-white placeholder-slate-500 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8882A] transition"
      />
    </div>
  );
}

/* ─── Inline SVG icon components ─────────────────────────────────────────── */

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ large = false }: { large?: boolean }) {
  const size = large ? "w-8 h-8" : "w-4 h-4";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${size} text-[#22C06A]`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 text-[#E09A30]"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 text-[#22C06A]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}