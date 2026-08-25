import { ArrowRight, CalendarDays, ChevronDown, HeartPulse, Leaf, LocateFixed, MapPin, MoreHorizontal, Palette, Scissors, Search, ShieldCheck, Smile, Sparkles, Star, WandSparkles, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SalonCard } from "../components/Cards";
import { BeautyPortrait } from "../components/Visuals";
import { fetchFeatured } from "../data/api";

export function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("New York, USA");
  const { data, isError, isLoading } = useQuery({ queryKey: ["featured"], queryFn: fetchFeatured });
  const salons = data?.salons ?? [];
  const cities = ["New York, USA", "Brooklyn, USA", "Manhattan, USA", "Queens, USA"];
  const categories = [
    { label: "Hair", Icon: Scissors },
    { label: "Makeup", Icon: Palette },
    { label: "Nails", Icon: WandSparkles },
    { label: "Facial", Icon: Smile },
    { label: "Massage", Icon: HeartPulse },
    { label: "Spa", Icon: Leaf },
    { label: "More", Icon: MoreHorizontal }
  ];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/salons?q=${encodeURIComponent(query)}` : "/salons");
  }

  function handleCategorySearch(category: string) {
    navigate(category === "More" ? "/salons" : `/salons?category=${encodeURIComponent(category)}`);
  }

  return (
    <div className="space-y-10">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-badge"><Sparkles className="text-brand-500" size={22} /> AI-Powered Beauty Booking</span>
          <div>
            <h1 className="hero-title">Find. Book. <span>Glow.</span></h1>
            <p className="hero-subtitle">Beauty that fits your vibe.</p>
          </div>
          <p className="hero-description">Top salons, expert stylists and premium beauty services in one place.</p>
          <div className="hero-actions">
            <Link to="/booking" className="btn-dark hero-cta-dark">Book Now <ArrowRight size={25} /></Link>
            <Link to="/salons" className="btn-outline hero-cta-light">Explore Salons <Sparkles size={22} /></Link>
          </div>
          <div className="hero-customers">
            <div className="hero-avatar-stack">
              {[
                "/images/emma-wilson.jpg",
                "/images/sophia-martinez.jpg",
                "/images/olivia-brown.jpg"
              ].map((src) => <BeautyPortrait key={src} className="avatar-md border-2 border-white" src={src} />)}
            </div>
            <span className="hero-customer-count">1M+</span>
            <p><strong className="block">Happy Customers</strong><span className="text-muted">Trusted by millions of beauty lovers</span></p>
          </div>
        </div>
        <div className="hero-art">
          <img className="hero-collage" src="/images/home-hero-collage.png" alt="Beauty services collage" />
        </div>

        <form className="search-panel home-search-panel" onSubmit={handleSearch}>
          <div className="grid gap-4 lg:grid-cols-[320px_1fr_88px]">
            <label className="home-search-control">
              <MapPin className="text-brand-500" size={24} />
              <select className="min-w-0 flex-1 appearance-none bg-transparent text-base font-black text-ink outline-none" value={city} onChange={(event) => setCity(event.target.value)}>
                {cities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <ChevronDown className="text-muted" size={18} />
              <LocateFixed className="text-muted" size={20} />
            </label>
            <label className="home-search-control">
              <Search className="text-muted" size={26} />
              <input className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-slate-400" placeholder="Search for salons, services..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            </label>
            <button className="btn-primary home-search-submit" type="submit" aria-label="Search salons"><Search size={30} /></button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 md:grid-cols-7">
            {categories.map(({ label, Icon }) => <button className="home-service-chip" key={label} type="button" onClick={() => handleCategorySearch(label)}><Icon size={28} />{label}</button>)}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">Trending Salons <span className="text-brand-500">🔥</span></h2>
          <Link to="/salons" className="font-bold text-brand-500">View All</Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? <p className="text-muted">Loading salons...</p> : null}
          {isError ? (
            <div className="card p-6 text-muted md:col-span-2 lg:col-span-4">
              Unable to load salons. Please make sure the API server is running on port 4000 and MySQL has been seeded.
            </div>
          ) : null}
          {!isLoading && !isError && salons.length === 0 ? (
            <div className="card p-6 text-muted md:col-span-2 lg:col-span-4">
              No salons found. Run the database seed to add the Glam Rapido sample salons.
            </div>
          ) : null}
          {!isLoading && !isError ? salons.map((salon, index) => <SalonCard key={salon.slug} salon={salon} index={index} />) : null}
        </div>
      </section>

      <section className="promo-banner">
        <img src="/images/promo-girl.jpg" alt="" />
        <div>
          <p className="font-bold uppercase">New here? Get</p>
          <strong>30% OFF</strong>
          <p>on your first booking</p>
        </div>
        <span>Use Code: <b>GLAM30</b></span>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          [Star, "Top Rated Salons", "Handpicked top salons for you"],
          [CalendarDays, "Easy Booking", "Book appointments in just a few clicks"],
          [ShieldCheck, "Verified Reviews", "Real reviews from real customers"],
          [Wallet, "Secure Payments", "Safe, secure and hassle-free"]
        ].map(([Icon, title, copy]) => (
          <div className="card flex items-center gap-4 p-5" key={String(title)}>
            <span className="feature-icon"><Icon size={26} /></span>
            <p><strong className="block">{String(title)}</strong><span className="text-sm text-muted">{String(copy)}</span></p>
          </div>
        ))}
      </section>
    </div>
  );
}
