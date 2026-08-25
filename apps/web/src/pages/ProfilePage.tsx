import { CalendarDays, Heart, Pencil, Star, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { BeautyPortrait, SalonImage } from "../components/Visuals";
import { dollars, fetchBookings, fetchMe, getAccessToken } from "../data/api";

export function ProfilePage() {
  const loggedIn = Boolean(getAccessToken());
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: fetchMe, enabled: loggedIn, retry: false });
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: fetchBookings, enabled: loggedIn, retry: false });
  const completed = bookings.filter((booking) => booking.status === "COMPLETED" || booking.status === "CONFIRMED").length;
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalCents, 0);

  if (!loggedIn) return <LoginPrompt />;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_300px]">
      <ProfileSidebar />
      <main className="space-y-6">
        <section className="card overflow-hidden">
          <div className="bg-brand-50 p-8"><div className="flex flex-wrap items-center gap-8"><BeautyPortrait className="h-40 w-40" label="JB" src={user?.avatarUrl ?? "/images/jessica-brown.jpg"} /><div><h1 className="text-4xl font-black">{user?.name ?? "My Profile"} <Pencil className="inline text-brand-500" size={20} /></h1><p className="mt-3 text-muted">{user?.email} · {user?.phone}</p><span className="pill mt-3 inline-block">Verified</span></div></div></div>
          <div className="grid grid-cols-4 divide-x divide-pink-100 p-6 text-center">{[[CalendarDays, "Total Bookings", String(bookings.length)], [Star, "Loyalty Points", "1,250"], [Wallet, "Wallet Balance", dollars(4850)], [Heart, "Saved Items", "18"]].map(([Icon, label, value]) => <div key={String(label)}><Icon className="mx-auto text-brand-500" /><p className="mt-2 text-sm text-muted">{String(label)}</p><strong>{String(value)}</strong></div>)}</div>
        </section>
        <Panel title="Personal Information"><div className="grid gap-5 md:grid-cols-2">{[`Full Name: ${user?.name ?? ""}`, `Email Address: ${user?.email ?? ""}`, `Phone Number: ${user?.phone ?? ""}`, "Date of Birth: 15 March 1995", "Gender: Female", "Location: New York, USA"].map((x) => <p className="mini-feature text-left" key={x}>{x}</p>)}</div></Panel>
        <Panel title="Recent Bookings">{bookings.slice(0, 4).map((booking) => <div className="booking-row profile-booking-row" key={booking.id}><SalonImage className="profile-booking-thumb" salon={{ ...booking.salon, palette: "pink" }} /><div className="min-w-0"><strong>{booking.salon.name}</strong><p className="text-muted">{booking.service.name} with {booking.stylist?.name ?? "Any stylist"}</p></div><span className="ml-auto pill">{booking.status}</span></div>)}</Panel>
        <Panel title="My Reviews"><p className="text-brand-500">★★★★★ <span className="text-ink">5.0</span></p><p className="mt-2 text-muted">Your reviews will appear here after completed appointments.</p></Panel>
      </main>
      <aside className="space-y-5"><Side title="My Membership" value="Glam Club Member" /><Side title="My Wallet" value={dollars(4850)} /><Side title="Loyalty Offers" value="1,250 Points" /><Side title="Completed Bookings" value={String(completed)} /><Side title="Total Spent" value={dollars(totalSpent)} /></aside>
    </div>
  );
}

function LoginPrompt() {
  return <section className="card p-8"><h1 className="section-title">Login required</h1><p className="mt-2 text-muted">Please login to view your dynamic profile and booking history.</p><Link className="btn-primary mt-5" to="/login">Login</Link></section>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="card p-6"><div className="mb-5 flex justify-between"><h2 className="section-title">{title}</h2><button className="text-brand-500">View All</button></div>{children}</section>;
}

function Side({ title, value }: { title: string; value: string }) {
  return <section className="card p-6"><h3 className="text-xl font-black">{title}</h3><p className="mt-4 text-2xl font-black text-brand-500">{value}</p><button className="btn-outline mt-5 w-full">View Details</button></section>;
}
