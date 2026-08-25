import { ArrowLeft, BadgeCheck, Briefcase, CalendarDays, ChevronRight, Clock, Crown, Gift, Heart, Image, MapPin, Navigation, Scissors, Share2, Star, Ticket, UserRound, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingPanel } from "../components/BookingPanel";
import { ServiceRow, StylistCard } from "../components/Cards";
import { SalonImage } from "../components/Visuals";
import { dollars, fetchSalon, type Offer, type Salon, type Service } from "../data/api";

type Tab = "overview" | "services" | "stylists" | "offers" | "reviews";

export function SalonDetailPage({ tab }: { tab: Tab }) {
  const { slug = "the-glam-studio" } = useParams();
  const { data: salon, isLoading } = useQuery({ queryKey: ["salon", slug], queryFn: () => fetchSalon(slug) });

  if (isLoading || !salon) return <div className="card p-8 text-muted">Loading salon details...</div>;

  const isOverview = tab === "overview";

  return (
    <div className="salon-detail-page space-y-7">
      <div className="salon-detail-topbar">
        <Link to="/salons" className="inline-flex items-center gap-2 font-semibold"><ArrowLeft size={18} /> Back to Salons</Link>
        <div className="flex gap-3"><button className="detail-action-btn"><Heart size={18} /> Save</button><button className="detail-action-btn"><Share2 size={18} /> Share</button></div>
      </div>
      {isOverview ? <OverviewHero salon={salon} /> : <CompactHero salon={salon} />}
      <section className={`salon-detail-layout grid gap-7 ${isOverview ? "lg:grid-cols-[1fr_360px]" : "lg:grid-cols-[1fr_420px]"}`}>
        <div className="salon-detail-content card overflow-hidden">
          <Tabs activeTab={tab} salon={salon} />
          <div className="salon-detail-body p-6">
            {tab === "overview" ? <Overview salon={salon} /> : null}
            {tab === "services" ? <Services salon={salon} /> : null}
            {tab === "stylists" ? <Stylists salon={salon} /> : null}
            {tab === "offers" ? <Offers salon={salon} /> : null}
            {tab === "reviews" ? <Reviews salon={salon} /> : null}
          </div>
        </div>
        <BookingPanel salon={salon} />
      </section>
    </div>
  );
}

function Tabs({ activeTab, salon }: { activeTab: Tab; salon: Salon }) {
  const tabs = [
    ["Overview", `/salons/${salon.slug}`, BadgeCheck],
    ["Services", `/salons/${salon.slug}/services`, Crown],
    [`Reviews (${salon.reviewCount})`, `/salons/${salon.slug}/reviews`, Star],
    ["Stylists", `/salons/${salon.slug}/stylists`, UserRound],
    ["Photos", `/salons/${salon.slug}`, Image],
    ["Offers", `/salons/${salon.slug}/offers`, CalendarDays]
  ] as const;

  return (
    <nav className="grid grid-cols-3 border-b border-pink-100 md:grid-cols-6">
      {tabs.map(([label, to, Icon]) => {
        const active = label.toLowerCase().startsWith(activeTab) || (activeTab === "reviews" && label.startsWith("Reviews"));
        return <Link key={label} to={to} className={`tab-link ${active ? "active" : ""}`}><Icon size={19} /> {label}</Link>;
      })}
    </nav>
  );
}

function Overview({ salon }: { salon: Salon }) {
  const services = salon.services ?? [];
  const stylists = salon.stylists ?? [];
  const offers = salon.offers ?? [];
  const firstReview = salon.reviews?.[0];

  return (
    <div className="space-y-9">
      <section>
        <h2 className="section-title">About {salon.name}</h2>
        <p className="salon-about-copy mt-3 max-w-3xl leading-7 text-slate-700">{salon.description}</p>
        <div className="salon-feature-grid mt-6 grid gap-4 md:grid-cols-4">
          {[[Scissors, "Hygienic", "Environment"], [Briefcase, "Premium", "Products"], [Users, "Expert", "Stylists"], [Heart, "Personalized", "Care"]].map(([Icon, title, subtitle]) => <div className="mini-feature icon-feature" key={String(title)}><Icon size={20} /><span>{String(title)}<br /><small>{String(subtitle)}</small></span></div>)}
        </div>
        <div className="expert-strip">
          <div className="flex -space-x-3">{stylists.map((stylist) => <img key={stylist.id} src={stylist.imageUrl ?? "/images/emma-wilson.jpg"} alt={stylist.name} />)}</div>
          <p><strong>{stylists.length || "20+"} Expert Stylists</strong><span>Professionals with years of experience</span></p>
          <Link to={`/salons/${salon.slug}/stylists`} className="btn-outline ml-auto px-6 py-3">View All <ChevronRight size={16} /></Link>
        </div>
      </section>
      <section>
        <div className="mb-4 flex justify-between"><h2 className="section-title">Popular Services</h2><Link className="font-bold text-brand-500" to={`/salons/${salon.slug}/services`}>View All Services</Link></div>
        <div className="salon-service-grid grid gap-5 md:grid-cols-4">{services.slice(0, 4).map((service) => <ServiceMiniCard key={service.id} service={service} />)}</div>
      </section>
      <section>
        <div className="mb-4 flex justify-between"><h2 className="section-title">Best Offers for You</h2><Link className="font-bold text-brand-500" to={`/salons/${salon.slug}/offers`}>View All Offers</Link></div>
        <div className="salon-offer-grid grid gap-4 md:grid-cols-[1fr_0.7fr]">{offers.slice(0, 2).map((offer) => <OfferStrip key={offer.id} offer={offer} />)}</div>
      </section>
      <section>
        <div className="mb-4 flex justify-between"><h2 className="section-title">What Our Customers Say</h2><Link className="font-bold text-brand-500" to={`/salons/${salon.slug}/reviews`}>View All Reviews</Link></div>
        <div className="review-overview-grid">
          <div className="rating-card"><strong>{salon.rating}</strong><p>★★★★★</p><span>({salon.reviewCount} Reviews)</span></div>
          <div className="review-card"><img src={firstReview?.user?.avatarUrl ?? "/images/sarah-johnson.jpg"} alt="" /><div><strong>{firstReview?.user?.name ?? "Sarah Johnson"} <span className="pill">Verified</span></strong><small>Recent review</small><p className="text-brand-500">★★★★★</p><p>{firstReview?.comment ?? "Amazing service and beautiful ambiance."}</p></div><button className="icon-btn"><ChevronRight size={18} /></button></div>
        </div>
      </section>
    </div>
  );
}

function ServiceMiniCard({ service }: { service: Service }) {
  return (
    <article className="service-mini-card">
      <img src={service.imageUrl ?? "/images/service-haircut.jpg"} alt={service.name} />
      <div>
        <strong>{service.name}</strong>
        <p><span>{dollars(service.priceCents)}</span><small><Clock size={14} /> {service.durationMin} min</small></p>
      </div>
    </article>
  );
}

function OfferStrip({ offer }: { offer: Offer }) {
  return <div className="offer-strip"><span>{offer.discountPct}% OFF</span><div><strong>{offer.title}</strong><p>Use code {offer.code} at checkout</p><small>Valid till {new Date(offer.expiresAt).toLocaleDateString()}</small></div><button className="btn-outline">Grab Offer <Gift size={16} /></button></div>;
}

function CompactHero({ salon }: { salon: Salon }) {
  return (
    <div className="grid gap-5 md:grid-cols-[340px_1fr]">
      <div className="relative">
        <SalonImage large salon={{ ...salon, offer: salon.offers?.[0] ? `${salon.offers[0].discountPct}% OFF` : undefined, palette: "pink" }} />
        <button className="play-btn">▶</button>
      </div>
      <SalonIntro salon={salon} />
    </div>
  );
}

function OverviewHero({ salon }: { salon: Salon }) {
  return (
    <div className="space-y-6">
      <div className="detail-gallery">
        <div className="gallery-main"><img src={salon.imageUrl ?? "/images/the-glam-studio.jpg"} alt={salon.name} /><span className="discount">{salon.offers?.[0]?.discountPct ?? 20}% OFF</span><button className="gallery-photos">View All Photos (24)</button></div>
        <div className="gallery-stack"><img src={salon.imageUrl ?? "/images/the-glam-studio.jpg"} alt="" /><img src="/images/bella-beauty-studio.jpg" alt="" /></div>
        <div className="gallery-side">
          <div className="map-card"><MapPin size={44} /></div>
          <div className="location-card"><p className="flex items-center gap-2 font-black text-emerald-500"><Clock size={18} /> Open Now</p><p className="text-muted">Closes at 9:00 PM</p><hr /><p className="flex gap-2"><MapPin size={20} /> {salon.address}<br />{salon.city}</p><a className="font-bold text-brand-500">Get Directions <Navigation size={15} className="inline" /></a></div>
        </div>
      </div>
      <div className="salon-intro-row grid gap-5 md:grid-cols-[130px_1fr]">
        <div className="studio-logo"><span>{salon.name.split(" ").slice(0, 3).map((word) => <span key={word}>{word}</span>)}</span></div>
        <SalonIntro salon={salon} />
      </div>
    </div>
  );
}

function SalonIntro({ salon }: { salon: Salon }) {
  const serviceCategories = salon.services?.map((service) => service.category) ?? [];
  const categories = ["Hair", "Makeup", "Nails", "Facial"].filter((category) => serviceCategories.length === 0 || category === "Makeup" || serviceCategories.includes(category)).join(" · ");
  return (
    <div className="salon-intro self-center">
      <h1>{salon.name} <BadgeCheck className="inline text-brand-500" size={24} /></h1>
      <p className="salon-meta"><span className="text-brand-500">★ {salon.rating}</span> ({salon.reviewCount} Reviews) <span>·</span> {salon.distanceKm.toFixed(1)} km away</p>
      <p className="salon-categories">{categories || "Hair · Makeup · Nails · Facial"}</p>
      <div className="salon-badges">{[[Crown, "Premium Salon"], [BadgeCheck, "Top Rated"]].map(([Icon, item]) => <span className="badge" key={String(item)}><Icon size={16} />{String(item)}</span>)}</div>
    </div>
  );
}

function Services({ salon }: { salon: Salon }) {
  const [activeCategory, setActiveCategory] = useState("All Services");
  const categories = ["All Services", "Hair", "Makeup", "Nails", "Facial", "Body", "Others"];
  const filteredServices = useMemo(() => {
    const services = salon.services ?? [];
    if (activeCategory === "All Services") return services;
    if (activeCategory === "Others") return services.filter((service) => !["Hair", "Makeup", "Nails", "Facial", "Body"].includes(service.category));
    return services.filter((service) => service.category === activeCategory);
  }, [activeCategory, salon.services]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><div><h2 className="section-title">Our Services</h2><p className="text-muted">Premium beauty services crafted by expert professionals.</p></div><button className="btn-outline"><Ticket size={18} /> Packages & Combos</button></div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-7">
        {categories.map((category) => (
          <button className={`category-chip ${activeCategory === category ? "active" : ""}`} key={category} onClick={() => setActiveCategory(category)} type="button">{category}</button>
        ))}
      </div>
      {filteredServices.length ? filteredServices.map((service) => <ServiceRow key={service.id} service={service} showAction={false} />) : <div className="card p-6 text-muted">No services found in {activeCategory}.</div>}
    </div>
  );
}

function Stylists({ salon }: { salon: Salon }) {
  return (
    <div>
      <h2 className="section-title">Our Expert Stylists</h2>
      <p className="mt-2 text-muted">Meet our certified professionals dedicated to making you look and feel your best.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{(salon.stylists ?? []).map((stylist) => <StylistCard key={stylist.id} stylist={stylist} />)}</div>
    </div>
  );
}

function Offers({ salon }: { salon: Salon }) {
  return (
    <div className="space-y-5">
      <h2 className="section-title">Special Offers & Deals</h2>
      <div className="grid gap-5 md:grid-cols-2">
        {(salon.offers ?? []).map((offer) => (
          <article className="card flex gap-5 p-4" key={offer.id}>
            <img className="h-28 w-32 shrink-0 rounded-lg object-cover" src={salon.imageUrl ?? "/images/the-glam-studio.jpg"} alt="" />
            <div className="flex-1">
              <h3 className="text-xl font-extrabold">{offer.title}</h3>
              <p className="mt-1 text-muted">Valid till {new Date(offer.expiresAt).toLocaleDateString()}</p>
              <div className="mt-4 flex gap-3"><span className="coupon">{offer.code}</span><button className="btn-outline">Copy</button></div>
              <p className="mt-2 text-sm text-muted">{offer.discountPct}% discount available</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Reviews({ salon, compact = false }: { salon: Salon; compact?: boolean }) {
  return (
    <div className="space-y-5">
      <h2 className="section-title">Customer Reviews</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-6"><strong className="text-5xl">{salon.rating}</strong><p className="mt-2 text-brand-500">★★★★★</p><p className="text-muted">({salon.reviewCount} Reviews)</p></div>
        <div className="card p-6"><strong className="text-4xl">100%</strong><p className="mt-2 text-muted">of customers recommend {salon.name}</p></div>
      </div>
      {!compact ? (salon.reviews ?? []).map((review) => (
        <article className="border-t border-pink-100 py-5" key={review.id}>
          <div className="flex justify-between"><strong>{review.user?.name ?? "Customer"} <span className="pill">Verified</span></strong><span className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</span></div>
          <p className="mt-2 text-brand-500">{"★".repeat(review.rating)}</p>
          <p className="mt-2 max-w-2xl text-slate-700">{review.comment}</p>
        </article>
      )) : null}
    </div>
  );
}
