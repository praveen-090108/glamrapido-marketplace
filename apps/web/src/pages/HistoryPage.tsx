import { CalendarDays, Clock, MapPin, MoreVertical, Scissors, UserRound, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { SalonImage } from "../components/Visuals";
import { cancelBooking, type Booking, dollars, fetchBookings, getAccessToken } from "../data/api";

type HistoryTab = "All" | "Completed" | "Cancelled" | "No Show";

const tabs: HistoryTab[] = ["All", "Completed", "Cancelled", "No Show"];

export function HistoryPage() {
  const loggedIn = Boolean(getAccessToken());
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<HistoryTab>("All");
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>();
  const { data: bookings = [], isLoading } = useQuery({ queryKey: ["bookings"], queryFn: fetchBookings, enabled: loggedIn, retry: false });
  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: (booking) => {
      queryClient.setQueryData<Booking[]>(["bookings"], (current = []) => current.map((item) => item.id === booking.id ? booking : item));
      setSelectedBooking((current) => current?.id === booking.id ? booking : current);
    }
  });
  const completed = bookings.filter((booking) => booking.status === "COMPLETED" || booking.status === "CONFIRMED").length;
  const cancelled = bookings.filter((booking) => booking.status === "CANCELLED").length;
  const noShow = bookings.filter((booking) => booking.status === "NO_SHOW").length;
  const totalSpent = bookings.reduce((sum, booking) => sum + booking.totalCents, 0);
  const filteredBookings = useMemo(() => bookings.filter((booking) => matchesTab(booking, activeTab)), [activeTab, bookings]);

  if (!loggedIn) return <section className="card p-8"><h1 className="section-title">Login required</h1><p className="mt-2 text-muted">Please login to view booking history from the database.</p><Link className="btn-primary mt-5" to="/login">Login</Link></section>;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr_300px]">
      <ProfileSidebar />
      <main>
        <h1 className="text-3xl font-black">Booking History</h1>
        <p className="mt-2 text-muted">View and manage your past appointments</p>
        <div className="mt-7 flex gap-8 border-b border-pink-100">{tabs.map((tab) => <button className={`pb-4 font-semibold ${activeTab === tab ? "border-b-2 border-brand-500 text-brand-500" : ""}`} key={tab} type="button" onClick={() => setActiveTab(tab)}>{tab} <span className="text-xs text-muted">({tabCount(tab, bookings)})</span></button>)}</div>
        <div className="mt-5 space-y-5">
          {isLoading ? <p className="text-muted">Loading bookings...</p> : null}
          {!isLoading && filteredBookings.length === 0 ? <section className="card p-8 text-muted">No bookings found for {activeTab}.</section> : null}
          {!isLoading ? filteredBookings.map((booking) => <BookingHistoryCard booking={booking} key={booking.id} isCancelling={cancelMutation.isPending} onCancel={() => cancelMutation.mutate(booking.id)} onView={() => setSelectedBooking(booking)} />) : null}
          {cancelMutation.isError ? <p className="font-bold text-brand-500">Unable to cancel this booking.</p> : null}
        </div>
      </main>
      <aside className="space-y-5"><Summary title="Total Bookings" value={String(bookings.length)} /><Summary title="Completed" value={String(completed)} /><Summary title="Cancelled" value={String(cancelled)} /><Summary title="No Show" value={String(noShow)} /><Summary title="Total Spent" value={dollars(totalSpent)} /><section className="card p-6"><h3 className="text-xl font-black">Filter</h3><button className="btn-primary mt-5 w-full">Apply Filter</button></section></aside>
      {selectedBooking ? <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(undefined)} /> : null}
    </div>
  );
}

function BookingHistoryCard({ booking, isCancelling, onCancel, onView }: { booking: Booking; isCancelling: boolean; onCancel: () => void; onView: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <article className="booking-history-row card">
      <SalonImage salon={{ ...booking.salon, palette: "pink" }} />
      <div className="min-w-0">
        <h3 className="font-black">{booking.salon.name}</h3>
        <p className="text-muted">{booking.service.name}</p>
        <p className="mt-3 text-sm">with {booking.stylist?.name ?? "Any stylist"}</p>
      </div>
      <div className="space-y-2 text-sm text-muted">
        <p><CalendarDays size={15} className="inline text-brand-500" /> {formatDate(booking.startsAt)}</p>
        <p>{formatTime(booking.startsAt)}</p>
        <p>{booking.salon.city}</p>
      </div>
      <div className="booking-history-price">
        <span className={`pill ${statusTone(booking.status)}`}>{formatStatus(booking.status)}</span>
        <strong>{dollars(booking.totalCents)}</strong>
      </div>
      <div className="booking-history-actions">
        <button className="icon-btn" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label="Booking actions">
          <MoreVertical size={18} />
        </button>
        {menuOpen ? (
          <div className="booking-action-menu">
            <button type="button" onClick={() => { setMenuOpen(false); onView(); }}>View Details</button>
            <button disabled={!canCancel || isCancelling} type="button" onClick={() => { setMenuOpen(false); onCancel(); }}>
              {canCancel ? "Cancel Booking" : "Cannot Cancel"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function BookingDetails({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <section className="card max-h-[90vh] w-full max-w-2xl overflow-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title">Booking Details</h2>
            <p className="mt-1 text-muted">{booking.salon.name}</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close booking details"><X size={20} /></button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-[170px_1fr]">
          <SalonImage salon={{ ...booking.salon, palette: "pink" }} />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-black">{booking.salon.name}</h3><span className={`pill ${statusTone(booking.status)}`}>{formatStatus(booking.status)}</span></div>
            <p className="text-muted"><MapPin size={16} className="inline text-brand-500" /> {booking.salon.address || booking.salon.city}</p>
            <p className="text-muted"><Scissors size={16} className="inline text-brand-500" /> {booking.service.name} · {booking.service.durationMin} min</p>
            <p className="text-muted"><UserRound size={16} className="inline text-brand-500" /> {booking.stylist?.name ?? "Any stylist"}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 rounded-lg bg-brand-50 p-5 md:grid-cols-2">
          <Detail label="Date" value={formatDate(booking.startsAt)} icon={<CalendarDays size={18} />} />
          <Detail label="Time" value={formatTime(booking.startsAt)} icon={<Clock size={18} />} />
          <Detail label="Service Price" value={dollars(booking.service.priceCents)} />
          <Detail label="Total Paid" value={dollars(booking.totalCents)} />
        </div>
        {booking.notes ? <div className="mt-5 rounded-lg border border-brand-100 p-4"><strong>Special Request</strong><p className="mt-2 text-muted">{booking.notes}</p></div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" type="button" onClick={onClose}>Close</button>
          <Link className="btn-primary" to="/booking">Book Again</Link>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <p className="mini-feature text-left">{icon ? <span className="mr-2 inline-flex text-brand-500">{icon}</span> : null}<span className="block text-sm text-muted">{label}</span><strong>{value}</strong></p>;
}

function Summary({ title, value }: { title: string; value: string }) {
  return <section className="card p-5"><p className="text-muted">{title}</p><strong className="mt-2 block text-2xl">{value}</strong></section>;
}

function matchesTab(booking: Booking, tab: HistoryTab) {
  if (tab === "All") return true;
  if (tab === "Completed") return booking.status === "COMPLETED" || booking.status === "CONFIRMED";
  if (tab === "Cancelled") return booking.status === "CANCELLED";
  return booking.status === "NO_SHOW";
}

function tabCount(tab: HistoryTab, bookings: Booking[]) {
  return bookings.filter((booking) => matchesTab(booking, tab)).length;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatStatus(status: Booking["status"]) {
  return status.replace("_", " ");
}

function statusTone(status: Booking["status"]) {
  if (status === "COMPLETED" || status === "CONFIRMED") return "bg-emerald-50 text-emerald-600";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  if (status === "NO_SHOW") return "bg-rose-50 text-brand-500";
  return "";
}
