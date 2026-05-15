"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Wrench, Lightbulb, Wind, Sparkles, Paintbrush, Hammer,
  Camera, Wifi, Search, CheckCircle2, Shield, Star,
  TrendingUp, Users, CalendarCheck, ChevronDown,
  ArrowRight, MapPin, Clock, BadgeCheck, Menu, X,
  Zap, DollarSign, ThumbsUp, HeartHandshake, Phone, Mail
} from "lucide-react";
import Link from "next/link";

/* ─── Fade-Up Wrapper ─────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── Count-Up ────────────────────────────────────────────── */
function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = target / 80;
    const t = setInterval(() => { c += step; if (c >= target) { setCount(target); clearInterval(t); } else setCount(Math.floor(c)); }, 20);
    return () => clearInterval(t);
  }, [inView, target]);
  return count;
}

/* ─── Navbar ──────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <motion.header initial={{ y: -64, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-[68px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-[#5B4DFF] flex items-center justify-center shadow-sm group-hover:shadow-[0_0_0_4px_#5B4DFF22] transition-all">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl text-[#111827] tracking-tight">Kaam<span className="text-[#5B4DFF]">AI</span></span>
        </Link>
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["Services", "How It Works", "Providers", "FAQ"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium text-[#6B7280] hover:text-[#111827] transition-colors">{item}</a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth" className="text-sm font-semibold text-[#6B7280] hover:text-[#111827] px-4 py-2 rounded-xl hover:bg-[#F3F4F6] transition-all">Sign In</Link>
          <Link href="/auth" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[#5B4DFF] hover:bg-[#4A3DE8] shadow-sm hover:shadow-md transition-all active:scale-95">Get Started</Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[#6B7280] hover:text-[#111827]">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden bg-white border-t border-[#E5E7EB] px-6 py-5 space-y-1">
            {["Services", "How It Works", "Providers", "FAQ"].map(item => (
              <a key={item} href="#" onClick={() => setOpen(false)} className="block py-2.5 text-sm font-medium text-[#374151] hover:text-[#5B4DFF] transition-colors">{item}</a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/auth" className="text-center text-sm font-semibold text-[#374151] border border-[#E5E7EB] py-2.5 rounded-xl">Sign In</Link>
              <Link href="/auth" className="text-center text-sm font-semibold text-white bg-[#5B4DFF] py-2.5 rounded-xl">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── Hero ────────────────────────────────────────────────── */
function Hero() {
  const workers = [
    { name: "Ahmad Raza", service: "Plumbing", rating: 4.9, reviews: 128, location: "F-10, Islamabad", badge: "Top Rated" },
    { name: "Bilal Khan", service: "Electrical", rating: 4.8, reviews: 94, location: "DHA, Lahore", badge: "Verified" },
    { name: "Usman Ali", service: "AC Repair", rating: 4.9, reviews: 211, location: "Gulshan, Karachi", badge: "Pro" },
  ];
  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#F8F9FC] pt-20 overflow-hidden">
      {/* Soft background shape */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-[#5B4DFF]/8 via-[#8B7FFF]/5 to-transparent rounded-bl-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-gradient-to-tr from-[#5B4DFF]/5 to-transparent rounded-tr-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div className="space-y-7">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5B4DFF]/8 border border-[#5B4DFF]/15 text-[#5B4DFF] text-sm font-semibold">
            <MapPin className="w-3.5 h-3.5" /> Pakistan&apos;s Smart Service Marketplace
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-black text-[#111827] leading-[1.08] tracking-tight">
            Trusted Local<br />Services,<br />
            <span className="text-[#5B4DFF]">Without the Hassle.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#6B7280] leading-relaxed max-w-lg">
            Find verified plumbers, electricians, AC technicians, cleaners and more — all in one place. Book in minutes, not hours.
          </motion.p>

          {/* Search bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
            className="flex gap-3 max-w-lg">
            <div className="flex-1 flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3.5 shadow-sm hover:border-[#5B4DFF]/40 transition-colors">
              <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              <input type="text" placeholder="e.g. Plumber, AC Repair, Electrician..." className="flex-1 text-sm text-[#111827] placeholder-[#9CA3AF] bg-transparent outline-none" readOnly />
            </div>
            <Link href="/auth" className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#5B4DFF] text-white font-semibold text-sm hover:bg-[#4A3DE8] shadow-sm hover:shadow-md transition-all whitespace-nowrap active:scale-95">
              Find Now
            </Link>
          </motion.div>

          {/* Trust pills */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-wrap gap-4 pt-2">
            {[
              { icon: BadgeCheck, label: "Verified Workers" },
              { icon: Clock, label: "Fast Booking" },
              { icon: MapPin, label: "Available in Pakistan" },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-sm text-[#6B7280] font-medium">
                <t.icon className="w-4 h-4 text-[#5B4DFF]" /> {t.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Marketplace UI Mockup */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-[#111827] text-sm">Available Professionals</p>
              <span className="text-xs text-[#5B4DFF] font-semibold bg-[#5B4DFF]/8 px-3 py-1 rounded-full">3 nearby</span>
            </div>
            {/* Worker cards */}
            {workers.map((w, i) => (
              <motion.div key={w.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-[#F3F4F6] hover:border-[#5B4DFF]/25 hover:shadow-[0_4px_20px_rgba(91,77,255,0.07)] transition-all cursor-pointer bg-[#FAFAFA]">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5B4DFF]/15 to-[#8B7FFF]/15 flex items-center justify-center font-bold text-[#5B4DFF] text-sm shrink-0">
                  {w.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-[#111827] text-sm truncate">{w.name}</p>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full shrink-0">{w.badge}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-[#6B7280]">{w.service}</p>
                    <span className="text-[#E5E7EB]">•</span>
                    <p className="text-xs text-[#6B7280]">{w.location}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span className="text-sm font-bold text-[#111827]">{w.rating}</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">{w.reviews} reviews</p>
                </div>
              </motion.div>
            ))}
            {/* Book button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="pt-1">
              <button className="w-full py-3 rounded-2xl bg-[#5B4DFF] text-white font-semibold text-sm hover:bg-[#4A3DE8] transition-colors shadow-sm hover:shadow-md">
                Book a Service →
              </button>
            </motion.div>
            {/* Footer tag */}
            <p className="text-center text-xs text-[#9CA3AF] pt-1">✓ No payment until service is complete</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Stats Strip ─────────────────────────────────────────── */
function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const b = useCountUp(10000, inView);
  const p = useCountUp(2500, inView);
  const s = useCountUp(98, inView);
  return (
    <section ref={ref} className="py-12 bg-white border-y border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${b.toLocaleString()}+`, label: "Bookings Completed" },
            { value: `${p.toLocaleString()}+`, label: "Verified Providers" },
            { value: `${s}%`, label: "Satisfaction Rate" },
            { value: "10+ Cities", label: "Across Pakistan" },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl font-black text-[#5B4DFF] mb-1">{stat.value}</p>
              <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Services Grid ───────────────────────────────────────── */
function Services() {
  const services = [
    { icon: Wrench, name: "Plumbing", desc: "Leakage, pipe fitting, bathroom", color: "#3B82F6", bg: "#EFF6FF" },
    { icon: Lightbulb, name: "Electrical", desc: "Wiring, fans, MCB, lighting", color: "#F59E0B", bg: "#FFFBEB" },
    { icon: Wind, name: "AC Repair", desc: "Gas filling, service, installation", color: "#06B6D4", bg: "#ECFEFF" },
    { icon: Sparkles, name: "Cleaning", desc: "Deep cleaning, sofas, carpets", color: "#22C55E", bg: "#F0FDF4" },
    { icon: Paintbrush, name: "Painting", desc: "Interior & exterior painting", color: "#EC4899", bg: "#FDF2F8" },
    { icon: Hammer, name: "Carpentry", desc: "Furniture, doors, wood work", color: "#8B5CF6", bg: "#F5F3FF" },
    { icon: Camera, name: "CCTV Install", desc: "Security cameras & maintenance", color: "#F97316", bg: "#FFF7ED" },
    { icon: Wifi, name: "Internet Setup", desc: "WiFi router, fiber, issues", color: "#10B981", bg: "#F0FDF4" },
  ];
  return (
    <section id="services" className="py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <FadeUp><p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-3">Services</p></FadeUp>
          <FadeUp delay={0.08}><h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">Popular Home Services</h2></FadeUp>
          <FadeUp delay={0.14}><p className="text-[#6B7280] text-lg max-w-xl mx-auto">From plumbing to painting — find the right professional for every home need.</p></FadeUp>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {services.map((s, i) => (
            <FadeUp key={s.name} delay={i * 0.05}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}
                className="group bg-white border border-[#E5E7EB] rounded-2xl p-5 cursor-pointer hover:border-[#5B4DFF]/30 hover:shadow-[0_8px_30px_rgba(91,77,255,0.08)] transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ backgroundColor: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="font-bold text-[#111827] text-sm mb-1">{s.name}</p>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">{s.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.3}>
          <div className="text-center mt-10">
            <Link href="/auth" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5B4DFF] hover:text-[#4A3DE8] transition-colors group">
              View all services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── How It Works ────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { icon: Search, step: "01", title: "Search a Service", desc: "Tell us what you need — search by service type or describe your problem." },
    { icon: Users, step: "02", title: "Choose a Provider", desc: "Browse verified professionals with real ratings, reviews, and profiles." },
    { icon: CalendarCheck, step: "03", title: "Book Instantly", desc: "Pick a time, confirm the booking, and the professional comes to you." },
  ];
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <FadeUp><p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-3">Simple Process</p></FadeUp>
          <FadeUp delay={0.08}><h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">How KaamAI Works</h2></FadeUp>
          <FadeUp delay={0.14}><p className="text-[#6B7280] text-lg">Book a verified professional in 3 simple steps.</p></FadeUp>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px bg-gradient-to-r from-[#E5E7EB] via-[#5B4DFF]/30 to-[#E5E7EB]" />
          {steps.map((s, i) => (
            <FadeUp key={s.step} delay={i * 0.12}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350 }}
                className="relative bg-[#F8F9FC] border border-[#E5E7EB] rounded-2xl p-8 hover:border-[#5B4DFF]/30 hover:shadow-[0_8px_30px_rgba(91,77,255,0.07)] transition-all">
                <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mb-6 shadow-sm">
                  <s.icon className="w-6 h-6 text-[#5B4DFF]" />
                </div>
                <span className="absolute top-6 right-6 text-3xl font-black text-[#E5E7EB]">{s.step}</span>
                <h3 className="text-lg font-bold text-[#111827] mb-3">{s.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── For Providers ───────────────────────────────────────── */
function ForProviders() {
  const features = [
    { icon: TrendingUp, title: "Get More Leads", desc: "Reach customers actively looking for your services." },
    { icon: BadgeCheck, title: "Build Your Reputation", desc: "Collect reviews, display certifications, grow trust." },
    { icon: CalendarCheck, title: "Easy Booking Management", desc: "Accept or decline jobs directly from your dashboard." },
    { icon: DollarSign, title: "Grow Your Income", desc: "Fill your calendar with consistent, quality jobs." },
  ];
  return (
    <section id="providers" className="py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div>
              <p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-4">For Providers</p>
              <h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-5 leading-tight">Grow Your Service Business</h2>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">Join KaamAI and connect with thousands of customers looking for trusted professionals in your area.</p>
              <Link href="/auth" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#5B4DFF] text-white font-semibold hover:bg-[#4A3DE8] shadow-sm hover:shadow-md transition-all active:scale-95 group">
                Become a Provider <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -3 }} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 hover:border-[#5B4DFF]/25 hover:shadow-[0_8px_30px_rgba(91,77,255,0.07)] transition-all">
                  <div className="w-11 h-11 rounded-xl bg-[#5B4DFF]/8 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-[#5B4DFF]" />
                  </div>
                  <h3 className="font-bold text-[#111827] text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust & Safety ──────────────────────────────────────── */
function TrustSafety() {
  const features = [
    { icon: BadgeCheck, title: "Verified Professionals", desc: "Every service provider is background-checked and identity-verified before joining." },
    { icon: Shield, title: "Secure Booking", desc: "Your personal information is always protected. No payment until work is done." },
    { icon: Star, title: "Real Customer Reviews", desc: "Read authentic ratings and reviews from customers who've used the service." },
    { icon: HeartHandshake, title: "Reliable Support", desc: "Our team is available to help resolve any issue with your booking." },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <FadeUp><p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-3">Trust & Safety</p></FadeUp>
          <FadeUp delay={0.08}><h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight mb-4">Your Safety is Our Priority</h2></FadeUp>
          <FadeUp delay={0.14}><p className="text-[#6B7280] text-lg max-w-xl mx-auto">We take security seriously so you can focus on getting things done.</p></FadeUp>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <motion.div whileHover={{ y: -4 }} className="bg-[#F8F9FC] border border-[#E5E7EB] rounded-2xl p-7 hover:border-[#5B4DFF]/25 hover:shadow-[0_8px_30px_rgba(91,77,255,0.07)] transition-all text-center">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm flex items-center justify-center mx-auto mb-5">
                  <f.icon className="w-6 h-6 text-[#5B4DFF]" />
                </div>
                <h3 className="font-bold text-[#111827] text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ────────────────────────────────────────── */
function Testimonials() {
  const reviews = [
    { name: "Ali Hassan", city: "Lahore", initials: "AH", rating: 5, text: "Found a plumber within minutes. The professional arrived on time, fixed everything, and the price was very fair. Will definitely use KaamAI again." },
    { name: "Hammad Sheikh", city: "Islamabad", initials: "HS", rating: 5, text: "My AC was not cooling. Booked a technician through KaamAI — he came the same day. Super professional and affordable. Highly recommended!" },
    { name: "Sana Mirza", city: "Karachi", initials: "SM", rating: 5, text: "As a working woman, I was nervous about letting strangers in. KaamAI's verification process gave me real confidence. Excellent experience overall." },
  ];
  return (
    <section className="py-24 bg-[#F8F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <FadeUp><p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-3">Reviews</p></FadeUp>
          <FadeUp delay={0.08}><h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight">What Customers Say</h2></FadeUp>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <FadeUp key={r.name} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:border-[#5B4DFF]/25 hover:shadow-[0_8px_30px_rgba(91,77,255,0.07)] transition-all">
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />)}
                </div>
                <p className="text-[#374151] text-sm leading-relaxed mb-6">&ldquo;{r.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F3F4F6]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4DFF]/15 to-[#8B7FFF]/15 flex items-center justify-center font-bold text-sm text-[#5B4DFF]">
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#111827] text-sm">{r.name}</p>
                    <p className="text-xs text-[#9CA3AF]">{r.city}, Pakistan</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E] ml-auto" />
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: "How do I book a service?", a: "Simply search for the service you need, browse available providers in your area, choose one based on their rating and reviews, and book instantly. It takes less than 2 minutes." },
    { q: "Are all service providers verified?", a: "Yes. Every provider goes through identity verification, skill assessment, and background checks before they can accept bookings on KaamAI." },
    { q: "What if I am not satisfied with the service?", a: "Your satisfaction is our priority. If you have any issue, our support team is available to mediate and ensure a fair resolution. Payment is held until you confirm completion." },
    { q: "Which cities are available?", a: "We are currently live in Lahore, Islamabad, Rawalpindi, Karachi, Faisalabad, and Peshawar, with more cities coming soon." },
    { q: "How can I join as a service provider?", a: "Click 'Become a Provider', fill out your profile with your skills and certifications, complete the verification process, and start receiving bookings in your area." },
  ];
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <FadeUp><p className="text-sm font-bold text-[#5B4DFF] uppercase tracking-widest mb-3">FAQ</p></FadeUp>
          <FadeUp delay={0.08}><h2 className="text-4xl md:text-5xl font-black text-[#111827] tracking-tight">Common Questions</h2></FadeUp>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="bg-[#F8F9FC] border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#5B4DFF]/25 transition-colors">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
                  <span className="font-semibold text-[#111827] text-sm leading-snug">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-[#9CA3AF] shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="px-6 pb-5 text-[#6B7280] text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─────────────────────────────────────────────────── */
function CTA() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F8F9FC]">
      <FadeUp>
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#5B4DFF] to-[#7C6FFF] p-14 text-center relative overflow-hidden shadow-[0_20px_60px_rgba(91,77,255,0.25)]">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">Get Started Today</p>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Need a trusted professional today?
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">Join thousands of Pakistanis who book reliable home services with KaamAI.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#5B4DFF] font-bold text-sm hover:bg-white/90 transition-all shadow-md hover:shadow-lg active:scale-95">
                Find a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-all">
                <Zap className="w-4 h-4" /> Join as Provider
              </Link>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────── */
function Footer() {
  const cols = [
    { heading: "Services", links: ["Plumbing", "Electrical", "AC Repair", "Cleaning", "Painting"] },
    { heading: "Company", links: ["About Us", "Blog", "Careers", "Press"] },
    { heading: "Support", links: ["Help Center", "Contact Us", "Safety", "Terms of Service", "Privacy Policy"] },
  ];
  return (
    <footer className="bg-[#111827] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#5B4DFF] flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Kaam<span className="text-[#8B7FFF]">AI</span></span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6">Pakistan&apos;s trusted marketplace for local home services. Connecting customers with verified professionals.</p>
            <div className="flex flex-col gap-2">
              <a href="#" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Phone className="w-3.5 h-3.5" /> +92 311 0000000
              </a>
              <a href="#" className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <Mail className="w-3.5 h-3.5" /> hello@kaamai.pk
              </a>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.heading}>
              <h4 className="font-bold text-white text-sm mb-5">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-sm text-white/40 hover:text-white/70 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">KaamAI © 2026 — Built for Pakistan 🇵🇰</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map(item => (
              <a key={item} href="#" className="text-white/20 text-xs hover:text-white/40 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-[#F8F9FC]">
      <Navbar />
      <Hero />
      <StatsStrip />
      <Services />
      <HowItWorks />
      <ForProviders />
      <TrustSafety />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
