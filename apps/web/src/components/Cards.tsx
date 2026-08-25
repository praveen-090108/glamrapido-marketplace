import { Clock, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { SalonImage, ServiceImage } from "./Visuals";
import { dollars, stylistSlug, type Salon, type Service, type Stylist } from "../data/api";

export function SalonCard({ salon, index }: { salon: Salon; index: number }) {
  const offer = salon.offers?.[0] ? `${salon.offers[0].discountPct}% OFF` : undefined;
  const tags = salon.services?.map((service) => service.category).filter((value, idx, arr) => arr.indexOf(value) === idx).slice(0, 3) ?? [];
  return (
    <article className="card overflow-hidden">
      <div className="relative">
        <SalonImage salon={{ ...salon, offer }} />
        <button className="icon-btn absolute right-3 top-3"><Heart size={19} /></button>
        <span className="rank">{index + 1}</span>
      </div>
      <div className="space-y-3 p-4">
        <Link to={`/salons/${salon.slug}`} className="text-lg font-extrabold">{salon.name}</Link>
        <div className="flex items-center justify-between text-sm text-muted">
          <span className="flex items-center gap-1 text-brand-500"><Star size={15} fill="currentColor" /> {salon.rating} <span className="text-muted">({salon.reviewCount})</span></span>
          <span>{salon.distanceKm.toFixed(1)} km</span>
        </div>
        <p className="text-sm text-muted">{tags.length ? tags.join("  ·  ") : "Hair  ·  Makeup  ·  Nails"}</p>
        <Link to="/booking" className="btn-primary w-full py-3 text-sm">Book Now</Link>
      </div>
    </article>
  );
}

export function ServiceRow({ service, action = "Add", showAction = true }: { service: Service; action?: string; showAction?: boolean }) {
  return (
    <article className="flex items-center gap-5 rounded-lg border border-pink-100 bg-white p-3 shadow-sm">
      <ServiceImage type={service.category.toLowerCase()} src={service.imageUrl ?? undefined} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold">{service.name}</h3>
          <span className="pill">{service.category}</span>
        </div>
        <p className="mt-1 text-sm text-muted">{service.description}</p>
      </div>
      <span className="hidden items-center gap-1 text-sm text-muted sm:flex"><Clock size={16} /> {service.durationMin} min</span>
      <strong className="text-lg">{dollars(service.priceCents)}</strong>
      {showAction ? <span className="btn-outline min-w-24">{action}</span> : null}
    </article>
  );
}

export function StylistCard({ stylist }: { stylist: Stylist }) {
  return (
    <article className="card p-5 text-center">
      <button className="ml-auto block"><Heart size={20} /></button>
      <div className="mx-auto mb-3 h-32 w-32 rounded-full bg-gradient-to-br from-pink-100 to-rose-300 p-2">
        <div className="beauty-portrait h-full w-full">
          <img src={stylist.imageUrl ?? "/images/emma-wilson.jpg"} alt={stylist.name} />
        </div>
      </div>
      <h3 className="text-xl font-extrabold">{stylist.name}</h3>
      <p className="text-muted">{stylist.title}</p>
      <span className="mt-3 inline-flex rounded-md bg-brand-50 px-3 py-1 text-sm font-bold text-brand-500">{stylist.years}+ Years Exp.</span>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {stylistSpecialties(stylist).map((item) => <span className="pill" key={item}>{item}</span>)}
      </div>
      <p className="mt-4 text-sm text-muted">{stylist.years * 42}+ Happy Clients</p>
      <Link to={`/stylists/${stylistSlug(stylist.name)}`} className="btn-outline mt-5 w-full">View Profile</Link>
    </article>
  );
}

function stylistSpecialties(stylist: Stylist) {
  if (stylist.title.includes("Color")) return ["Hair Color", "Balayage", "Highlights"];
  if (stylist.title.includes("Makeup")) return ["Bridal Makeup", "Party Makeup", "HD Makeup"];
  if (stylist.title.includes("Nail")) return ["Gel Manicure", "Nail Art", "Extensions"];
  return ["Haircut", "Color", "Styling"];
}
