"use client";

import { supabase } from './supabase';
import { useState, useEffect } from "react";

const NAV_LINKS = ["Home", "Services", "Testimonials", "FAQ"];

const SERVICES = [
  { icon: "🪟", title: "Window Cleaning", desc: "Streak-free residential and commercial window cleaning — inside, outside, and hard-to-reach panes." },
  { icon: "🍂", title: "Eavestrough Cleaning", desc: "Full gutter flush and debris removal to protect your foundation and prevent costly water damage." },
  { icon: "🔧", title: "Eavestrough Repair & Replacement", desc: "Sealing leaks, re-pitching, refastening, and full section replacements with quality aluminum materials." },
  { icon: "🏠", title: "Aluminum Siding Cleaning", desc: "Soft-wash treatment that lifts oxidation, mildew, and road grime without damaging your siding finish." },
  { icon: "🚿", title: "Commercial Power-Washing", desc: "High-pressure washing for driveways, parking lots, storefronts, and commercial exterior surfaces." },
];

const SERVICE_OPTIONS = [
  "Window Cleaning",
  "Eavestrough Cleaning",
  "Eavestrough Repair & Replacement",
  "Aluminum Siding Cleaning",
  "Commercial Power-Washing",
];

const HERO_IMAGES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];

const FAQS = [
  { question: "How often should eavestroughs be cleaned?", answer: "Most GTA homes do well with two cleanings a year — once in late spring after seed pods drop, and once in late fall after the leaves come down. Homes surrounded by mature trees sometimes benefit from a mid-summer check too." },
  { question: "Are your estimates really free?", answer: "Yes. We'll take a look at your property, talk through what it needs, and give you a clear price before any work begins — no obligation to book." },
  { question: "Is T-Rex fully insured?", answer: "Yes, we carry full liability insurance, and our crews are trained in proper ladder and roof-edge safety on every job." },
  { question: "What areas do you service?", answer: "We serve Toronto and the surrounding GTA, including North York, Scarborough, and Etobicoke. If you're just outside these areas, reach out anyway — we often make exceptions for returning customers." },
  { question: "Do I need to be home while you work?", answer: "Not at all. As long as we can safely access the areas being cleaned, most jobs are completed without you needing to be there." },
  { question: "Can I set up a recurring cleaning schedule?", answer: "Definitely. Many of our clients book us automatically for spring and fall visits every year so they never have to think about it. Just mention it on your quote request and we'll set it up." },
];

// Smooth scroll with a brief dark flash between sections
function useNavScroll() {
  const [flashing, setFlashing] = useState(false);

  function scrollTo(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    setFlashing(true);
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => setFlashing(false), 400);
    }, 120);
  }

  return { flashing, scrollTo };
}

export default function Home() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());
  const [heroReady, setHeroReady] = useState(false);

  const { flashing, scrollTo } = useNavScroll();

  // Single, global Intersection Observer for all animations
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            
            setTimeout(() => el.classList.add("is-visible"), Number(delay));
            obs.unobserve(el);
          }
        });
      },
      { 
        threshold: 0.05, 
        rootMargin: "0px" 
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Hero entrance — just a one-shot fade on mount, no scroll needed
  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Hero slideshow interval
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckboxChange = (s: string) =>
    setSelectedServices(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const toggleFaq = (idx: number) =>
    setOpenFaqs(p => { const n = new Set(p); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const svcList = selectedServices.map(s => s === "Other" ? `Other: ${otherText}` : s);
      const servicePayload = svcList.length > 0 ? svcList.join(", ") : "Window Cleaning";
      const { error } = await supabase.from("leads").insert([{
        name: form.name, phone: form.phone, email: form.email,
        address: form.address, service_needed: servicePayload, status: "New",
      }]);
      if (error) throw error;
      await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, service: servicePayload }) });
      setForm({ name: "", phone: "", email: "", address: "" });
      setSelectedServices([]); setOtherText(""); setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Global reveal styles — only transition/transform, no keyframes needed */}
      <style>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .nav-flash {
          position: fixed; inset: 0; z-index: 9999;
          background: #0B1629;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* Nav flash overlay */}
      <div
        className="nav-flash"
        style={{ opacity: flashing ? 0.2 : 0 }}
        aria-hidden="true"
      />

      <div className="min-h-screen bg-[#EAE3D3] font-sans text-[#0B1629]">

        {/* ── HEADER ── */}
        <header className="sticky top-0 z-50 bg-[#0B1629] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src="/trex-logo.png" alt="T-Rex Window Cleaning Logo" className="w-14 h-14 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-extrabold text-base sm:text-lg leading-tight tracking-tight whitespace-nowrap">T-Rex Window &amp; Eaves</p>
                <p className="text-[#C8882A] font-semibold text-xs sm:text-sm tracking-widest uppercase">Cleaning INC.</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={(e) => scrollTo(e, link.toLowerCase())}
                  className="text-slate-300 hover:text-[#E09A30] text-sm font-medium tracking-wide transition-colors duration-150">
                  {link}
                </a>
              ))}
              <a href="tel:4165318739" className="ml-2 inline-flex items-center gap-2 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap">
                <PhoneIcon /> 416-531-TREX
              </a>
            </nav>
            <a href="tel:4165318739" className="md:hidden inline-flex items-center gap-1.5 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              <PhoneIcon /> Call Now
            </a>
          </div>
        </header>

        {/* ── HERO ── */}
        <section id="home" className="relative w-full bg-[#0F2040] overflow-hidden py-20 lg:min-h-screen lg:flex lg:items-center">
          {HERO_IMAGES.map((img, i) => (
            <div key={img} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
              style={{ backgroundImage: `url('${img}')`, backgroundPosition: "center", backgroundSize: "cover" }}>
              <div className="absolute inset-0 bg-[#0B1629]/75 mix-blend-multiply" />
            </div>
          ))}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E09A30] z-20" />

          {/* Hero content fades in on mount — no scroll needed since it's above the fold */}
          <div className={`relative z-10 max-w-7xl mx-auto px-4 flex flex-col justify-center w-full transition-all duration-700 ease-out ${heroReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="inline-flex items-center gap-2 text-[#E09A30] text-xs font-bold uppercase tracking-[0.2em] mb-5">
              <span className="w-6 h-px bg-[#C8882A]" /> Serving the GTA Since 2007
            </p>
            <h1 className="text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight max-w-3xl mb-6">
              Premium Residential &amp; Commercial{" "}
              <span className="text-[#E09A30]">Window &amp; Eavestrough</span>{" "}
              Maintenance in the GTA
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
              Trusted, family-owned &amp; fully insured service — delivered with care and professionalism since 2007.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pb-10">
              <a href="#estimate" onClick={(e) => scrollTo(e, "estimate")}
                className="inline-flex justify-center items-center gap-2 bg-[#1A9E4F] hover:bg-[#22C06A] text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-105">
                Get a Free Estimate <ArrowIcon />
              </a>
              <a href="tel:4165318739"
                className="inline-flex justify-center items-center gap-2 border-2 border-[#C8882A] text-[#E09A30] hover:bg-[#C8882A] hover:text-white text-base font-semibold px-8 py-4 rounded-xl transition-all duration-200">
                <PhoneIcon /> 416-531-8739
              </a>
            </div>
            <div className="flex flex-wrap gap-6 mt-4">
              {["Fully Insured", "Family-Owned", "17+ Years Experience", "Free Estimates"].map((b) => (
                <div key={b} className="flex items-center gap-2 text-slate-300 text-sm"><CheckIcon /> {b}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 sm:py-28 bg-[#EAE3D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mb-14">
              <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">What We Do</p>
              <h2 className="text-[#0B1629] font-extrabold text-3xl sm:text-4xl mb-4">Our Services</h2>
              <div className="w-12 h-1 bg-[#C8882A] rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((svc, idx) => (
                <div key={svc.title} data-reveal data-delay={idx * 80}
                  className="group bg-[#F7F2E7] rounded-2xl shadow-sm hover:shadow-xl border border-[#DDD3BC] hover:border-[#C8882A]/30 p-7 hover:-translate-y-1 transition-[transform,box-shadow] duration-200">
                  <div className="w-14 h-14 rounded-xl bg-[#0F2040] flex items-center justify-center text-2xl mb-5 group-hover:bg-[#C8882A] transition-colors duration-300">{svc.icon}</div>
                  <div className="w-8 h-0.5 bg-[#C8882A] rounded-full mb-4 group-hover:w-14 transition-all duration-300" />
                  <h3 className="text-[#0B1629] font-bold text-lg mb-2">{svc.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              ))}
              <div data-reveal data-delay={SERVICES.length * 80} className="bg-[#0F2040] rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <p className="text-[#E09A30] text-xs font-bold uppercase tracking-widest mb-3">Not Listed?</p>
                  <h3 className="text-white font-bold text-lg mb-3 leading-snug">Have a unique job?<br />We&apos;ll take a look.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">Call us or send a quote request and we&apos;ll let you know what we can do.</p>
                </div>
                <a href="#estimate" onClick={(e) => scrollTo(e, "estimate")}
                  className="mt-6 inline-flex items-center gap-2 text-[#22C06A] font-semibold text-sm hover:text-white transition-colors">
                  Request a Quote <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── ESTIMATE ── */}
        <section id="estimate" className="py-20 sm:py-28 bg-[#0B1629] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#C8882A]/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1A9E4F]/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-[#E09A30]/4 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="text-center mb-12">
              <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">No Obligation</p>
              <h2 className="text-white font-extrabold text-3xl sm:text-4xl mb-4">Get a Free Quote</h2>
              <p className="text-slate-400 text-base max-w-md mx-auto">Fill in the form below and we&apos;ll get back to you within one business day.</p>
            </div>
            {submitted ? (
              <div data-reveal className="bg-[#162B50] rounded-2xl border border-[#1A9E4F]/40 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1A9E4F]/20 flex items-center justify-center mx-auto mb-5"><CheckIcon large /></div>
                <h3 className="text-white font-bold text-2xl mb-2">Request Received!</h3>
                <p className="text-slate-400">Thanks for reaching out. We&apos;ll be in touch at the contact info you provided.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} data-reveal data-delay="80"
                className="bg-[#162B50] rounded-2xl border border-white/10 p-8 sm:p-10 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Full Name" name="name" type="text" placeholder="Jane Smith" value={form.name} onChange={handleChange} />
                  <FormField label="Phone Number" name="phone" type="tel" placeholder="416-555-0100" value={form.phone} onChange={handleChange} />
                  <FormField label="Email Address" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} />
                  <FormField label="Property Address" name="address" type="text" placeholder="123 Main St, Toronto, ON" value={form.address} onChange={handleChange} />
                  <div className="sm:col-span-2 mt-2">
                    <label className="block text-slate-300 text-sm font-semibold mb-3">Services Needed (Select all that apply)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SERVICE_OPTIONS.map((opt) => (
                        <label key={opt} className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${selectedServices.includes(opt) ? "bg-[#0F2040] border-[#C8882A] text-white" : "bg-[#0F2040]/50 border-white/10 text-slate-300 hover:border-white/20"}`}>
                          <input type="checkbox" checked={selectedServices.includes(opt)} onChange={() => handleCheckboxChange(opt)}
                            className="h-4 w-4 rounded border-white/20 bg-[#0F2040] text-[#C8882A] focus:ring-offset-[#162B50] focus:ring-[#C8882A]" />
                          <span className="text-sm font-medium">{opt}</span>
                        </label>
                      ))}
                      <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all select-none ${selectedServices.includes("Other") ? "bg-[#0F2040] border-[#C8882A] text-white" : "bg-[#0F2040]/50 border-white/10 text-slate-300 hover:border-white/20"}`}>
                        <input type="checkbox" checked={selectedServices.includes("Other")} onChange={() => handleCheckboxChange("Other")}
                          className="h-4 w-4 rounded border-white/20 bg-[#0F2040] text-[#C8882A] focus:ring-offset-[#162B50] focus:ring-[#C8882A]" />
                        <span className="text-sm font-medium">Other / Custom Service</span>
                      </label>
                    </div>
                  </div>
                  {selectedServices.includes("Other") && (
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 text-sm font-semibold mb-1.5">Specify Custom Requirements</label>
                      <input type="text" required value={otherText} onChange={(e) => setOtherText(e.target.value)}
                        placeholder="e.g., Skylight Detailing, Screen Mesh Repair..."
                        className="w-full bg-[#0F2040] text-white placeholder-slate-500 border border-[#C8882A]/50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8882A] transition" />
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading}
                  className="mt-8 w-full bg-[#1A9E4F] hover:bg-[#22C06A] disabled:bg-slate-600 text-white font-bold text-base py-4 rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Submitting..." : "Submit Quote Request"}
                </button>
                <p className="text-slate-500 text-xs text-center mt-4">We respect your privacy. Your information is never shared.</p>
              </form>
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="py-20 sm:py-28 bg-[#EAE3D3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mb-14">
              <p className="text-[#C8882A] text-xs font-bold uppercase tracking-[0.2em] mb-3">What Our Clients Say</p>
              <h2 className="text-[#0B1629] font-extrabold text-3xl sm:text-4xl mb-4">Testimonials</h2>
              <div className="w-12 h-1 bg-[#C8882A] rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sarah M.", location: "North York", quote: "T-Rex has been cleaning our windows for three years. Punctual, professional, and the results are always spotless." },
                { name: "David K.", location: "Etobicoke", quote: "They saved us from a very costly water damage situation — our eavestroughs were completely clogged. Highly recommend." },
                { name: "Linda T.", location: "Scarborough", quote: "Friendly team, fair price, and they even cleaned up after themselves. Will definitely call them again in the fall." },
              ].map((t, idx) => (
                <div key={t.name} data-reveal data-delay={idx * 100} className="bg-[#F7F2E7] rounded-2xl border border-[#DDD3BC] shadow-sm p-7">
                  <div className="flex gap-0.5 mb-4">{Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}</div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0F2040] flex items-center justify-center text-white text-xs font-bold">{t.name[0]}</div>
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

        {/* ── FAQ ── */}
        <section id="faq" className="py-20 sm:py-28 bg-[#0F2040] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#C8882A]/5 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#1A9E4F]/5 translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div data-reveal className="mb-14 text-center">
              <p className="text-[#E09A30] text-xs font-bold uppercase tracking-[0.2em] mb-3">Common Questions</p>
              <h2 className="text-white font-extrabold text-3xl sm:text-4xl mb-4">Frequently Asked Questions</h2>
              <div className="w-12 h-1 bg-[#C8882A] rounded-full mx-auto" />
            </div>
            <div className="lg:grid lg:grid-cols-[1fr_2fr] lg:gap-16 lg:items-start">
              <div className="hidden lg:flex flex-col gap-6 sticky top-28">
                <div data-reveal data-delay="80" className="bg-[#162B50] rounded-2xl p-6 border border-white/10">
                  <p className="text-[#E09A30] text-xs font-bold uppercase tracking-widest mb-4">By the numbers</p>
                  {[
                    { num: "17+",  label: "Years in the GTA" },
                    { num: "1 day", label: "Quote turnaround time" },
                    { num: "500+",  label: "Properties serviced" },
                    { num: "2×",    label: "Recommended per year" },
                  ].map(({ num, label }) => (
                    <div key={label} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                      <span className="text-[#E09A30] font-extrabold text-2xl w-16 flex-shrink-0">{num}</span>
                      <span className="text-slate-400 text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                <div data-reveal data-delay="160" className="bg-[#1A9E4F]/10 border border-[#1A9E4F]/30 rounded-2xl p-6">
                  <p className="text-white font-bold mb-2">Still have questions?</p>
                  <p className="text-slate-400 text-sm mb-4">We&apos;re happy to talk through your specific situation.</p>
                  <a href="tel:4165318739" className="inline-flex items-center gap-2 text-[#22C06A] font-semibold text-sm hover:text-white transition-colors">
                    <PhoneIcon /> 416-531-TREX
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaqs.has(idx);
                  return (
                    <div key={faq.question} data-reveal data-delay={idx * 60} className="rounded-xl border border-white/10 bg-[#162B50] overflow-hidden">
                      <button type="button" onClick={() => toggleFaq(idx)} aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 text-white font-semibold text-base hover:text-[#E09A30] transition-colors">
                        {faq.question}
                        <span className={`flex-shrink-0 text-[#E09A30] text-2xl leading-none transition-transform duration-300 ${isOpen ? "rotate-45" : "rotate-0"}`}>+</span>
                      </button>
                      <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <div className="overflow-hidden">
                          <p className="text-slate-300 text-sm leading-relaxed px-6 pb-5">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-[#0B1629] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
              <div data-reveal>
                <p className="text-white font-extrabold text-base mb-1">T-Rex Window &amp; Eaves Cleaning INC.</p>
                <p className="text-[#C8882A] text-xs font-semibold uppercase tracking-widest mb-4">Est. 2007</p>
                <p className="text-slate-500 text-sm leading-relaxed">Family-owned, fully insured exterior cleaning services across Toronto and the Greater Toronto Area.</p>
              </div>
              <div data-reveal data-delay="80">
                <p className="text-slate-300 font-bold text-sm uppercase tracking-wide mb-4">Contact</p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="tel:4165318739" className="hover:text-[#E09A30] transition-colors">📞 416-531-TREX (8739)</a></li>
                  <li><a href="mailto:info@trexcanada.com" className="hover:text-[#E09A30] transition-colors">✉️ info@trexcanada.com</a></li>
                </ul>
              </div>
              <div data-reveal data-delay="160">
                <p className="text-slate-300 font-bold text-sm uppercase tracking-wide mb-4">Service Areas</p>
                <ul className="space-y-1 text-sm text-slate-400">
                  {["Toronto", "North York", "Scarborough", "Etobicoke", "Surrounding GTA"].map((area) => (
                    <li key={area} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#C8882A]" />{area}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>© {new Date().getFullYear()}&nbsp;T-Rex Window &amp; Eaves Cleaning INC. All rights reserved.</p>
              <p className="flex items-center gap-2"><ShieldIcon /> Fully Insured · Proudly Serving the GTA</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

function FormField({ label, name, type, placeholder, value, onChange }: {
  label: string; name: string; type: string; placeholder: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-semibold mb-1.5">{label}</label>
      <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full bg-[#0F2040] text-white placeholder-slate-500 border border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8882A] transition" />
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
function CheckIcon({ large = false }: { large?: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${large ? "w-8 h-8" : "w-4 h-4"} text-[#22C06A]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#E09A30]" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#22C06A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}