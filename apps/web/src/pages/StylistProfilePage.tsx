import { MessageCircle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { BookingPanel } from "../components/BookingPanel";
import { ServiceRow } from "../components/Cards";
import { BeautyPortrait, ServiceImage } from "../components/Visuals";
import { fetchStylist } from "../data/api";

export function StylistProfilePage() {
  const { slug = "emma-wilson" } = useParams();
  const { data: stylist, isLoading } = useQuery({ queryKey: ["stylist", slug], queryFn: () => fetchStylist(slug) });
  const services = stylist?.salon?.services ?? [];

  if (isLoading || !stylist) return <div className="card p-8 text-muted">Loading stylist profile...</div>;

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
      <main className="space-y-6">
        <section className="card bg-brand-50 p-8">
          <div className="grid gap-8 md:grid-cols-[190px_1fr]">
            <BeautyPortrait className="h-44 w-44" label={stylist.name[0]} src={stylist.imageUrl ?? undefined} />
            <div>
              <h1 className="text-4xl font-black">{stylist.name} <span className="text-brand-500">●</span></h1>
              <p className="mt-2 text-xl">{stylist.title}</p>
              <div className="my-5 flex flex-wrap gap-8 text-muted"><span className="text-brand-500">★ {stylist.rating} ({stylist.salon.reviewCount} Reviews)</span><span>{stylist.years * 42}+ Happy Clients</span><span>{stylist.years}+ Years Experience</span></div>
              <p className="max-w-2xl leading-7 text-slate-700">{stylist.bio}</p>
              <div className="mt-6 flex gap-4"><Link className="btn-primary px-9 py-3" to="/booking">Book with {stylist.name.split(" ")[0]}</Link><button className="btn-outline"><MessageCircle size={18} /> Message</button></div>
            </div>
          </div>
        </section>
        <section className="card p-6"><h2 className="section-title">About {stylist.name.split(" ")[0]}</h2><p className="mt-4 leading-7 text-slate-700">{stylist.bio}</p></section>
        <section className="card p-6"><h2 className="section-title mb-5">Services by {stylist.name.split(" ")[0]}</h2>{services.map((service) => <ServiceRow key={service.id} service={service} action="Book" />)}</section>
        <section className="card p-6"><h2 className="section-title mb-5">{stylist.name.split(" ")[0]}'s Portfolio</h2><div className="grid gap-4 md:grid-cols-4">{["Balayage", "Layer Cut", "Highlights", "Styling"].map((x) => <div key={x}><ServiceImage type="hair" /><p className="mt-2 text-center font-semibold">{x}</p></div>)}</div></section>
        <section className="card p-6"><h2 className="section-title">What Clients Say</h2><div className="mt-4 flex items-center gap-5"><strong className="text-5xl">{stylist.rating}</strong><p className="text-brand-500"><Star fill="currentColor" className="inline" /> ★★★★★<br /><span className="text-muted">({stylist.salon.reviewCount} Reviews)</span></p></div></section>
      </main>
      <aside className="space-y-6"><BookingPanel /><InfoCard title={`${stylist.name.split(" ")[0]}'s Highlights`} items={[`${stylist.years}+ Years Experience`, `${stylist.years * 42}+ Happy Clients`, "Top Rated Stylist", "Certified Professional"]} /><InfoCard title={`Contact ${stylist.name.split(" ")[0]}`} items={["+1 212 555 9876", `${stylist.name.toLowerCase().replaceAll(" ", ".")}@glamrapido.com`, "Mon - Sun", "10:00 AM - 8:00 PM"]} /></aside>
    </div>
  );
}

function InfoCard({ title, items }: { title: string; items: string[] }) {
  return <div className="card p-6"><h3 className="text-xl font-black">{title}</h3>{items.map((item) => <p className="mt-4 text-muted" key={item}>{item}</p>)}</div>;
}
