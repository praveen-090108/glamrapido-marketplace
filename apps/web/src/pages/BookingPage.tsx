import { ArrowLeft, ArrowRight, Check, CreditCard, MapPin, ShieldCheck, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ServiceRow } from "../components/Cards";
import { BeautyPortrait, SalonImage } from "../components/Visuals";
import { createBooking, dollars, fetchMe, fetchSalon, getAccessToken } from "../data/api";

const bookingSteps = [
  { title: "Service", caption: "Select Services" },
  { title: "Stylist", caption: "Choose Stylist" },
  { title: "Date & Time", caption: "Pick Date & Time" },
  { title: "Details", caption: "Your Information" },
  { title: "Payment", caption: "Secure Payment" }
];

const timeSlots = [
  ["09:00 AM", "09:00"],
  ["10:00 AM", "10:00"],
  ["11:00 AM", "11:00"],
  ["01:00 PM", "13:00"],
  ["02:00 PM", "14:00"],
  ["03:00 PM", "15:00"],
  ["04:00 PM", "16:00"],
  ["05:00 PM", "17:00"],
  ["06:00 PM", "18:00"]
] as const;

export function BookingPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const salonSlug = searchParams.get("salon") || "the-glam-studio";
  const { data: salon, isLoading } = useQuery({ queryKey: ["salon", salonSlug], queryFn: () => fetchSalon(salonSlug) });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: fetchMe, enabled: Boolean(getAccessToken()), retry: false });
  const [serviceIds, setServiceIds] = useState<string[]>(() => {
    const ids = searchParams.get("serviceIds")?.split(",").filter(Boolean) ?? [];
    return ids.length ? ids : searchParams.get("serviceId") ? [searchParams.get("serviceId")!] : [];
  });
  const [stylistId, setStylistId] = useState(() => searchParams.get("stylistId") || "");
  const [startsAt, setStartsAt] = useState(() => searchParams.get("startsAt") || "2026-07-21T10:00:00.000Z");
  const [notes, setNotes] = useState("");
  const [activeStep, setActiveStep] = useState(() => {
    const step = Number(searchParams.get("step") ?? 0);
    return Number.isFinite(step) ? Math.min(Math.max(step, 0), bookingSteps.length - 1) : 0;
  });

  const selectedServices = useMemo(() => {
    const services = salon?.services ?? [];
    const selected = serviceIds.map((id) => services.find((item) => item.id === id)).filter((service): service is NonNullable<typeof service> => Boolean(service));
    return selected.length ? selected : services.slice(0, 1);
  }, [salon, serviceIds]);
  const service = selectedServices[0];
  const stylist = useMemo(() => salon?.stylists?.find((item) => item.id === stylistId) ?? salon?.stylists?.[0], [salon, stylistId]);
  const subtotal = selectedServices.reduce((sum, item) => sum + item.priceCents, 0);
  const tax = Math.round(subtotal * 0.08875);

  const mutation = useMutation({
    mutationFn: () => {
      if (!salon || !service || selectedServices.length === 0) throw new Error("Select at least one service");
      return createBooking({ salonId: salon.id, serviceId: service.id, serviceIds: selectedServices.map((item) => item.id), stylistId: stylist?.id, startsAt, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setActiveStep(4);
    }
  });

  if (isLoading || !salon) return <div className="card p-8 text-muted">Loading booking flow...</div>;

  function goNext() {
    setActiveStep((step) => Math.min(step + 1, bookingSteps.length - 1));
  }

  function goPrevious() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  function toggleService(serviceId: string) {
    setServiceIds((currentIds) => toggleServiceInList(currentIds.length ? currentIds : service ? [service.id] : [], serviceId));
  }

  return (
    <div className="space-y-7">
      <div className="card booking-stepper p-5">
        {bookingSteps.map((step, index) => (
          <button
            className={`step ${index === activeStep ? "active" : ""} ${index < activeStep ? "complete" : ""}`}
            key={step.title}
            onClick={() => setActiveStep(index)}
            type="button"
          >
            <span>{index < activeStep ? <Check size={16} /> : index + 1}</span>
            <p><strong>{step.title}</strong><small>{step.caption}</small></p>
          </button>
        ))}
      </div>
      <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
        <section>
          {activeStep === 0 ? (
            <StepCard title="Select Services" onNext={goNext}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-100 bg-brand-50/60 p-4">
                <p><strong>{selectedServices.length}</strong> service{selectedServices.length === 1 ? "" : "s"} selected</p>
                <strong className="text-brand-500">{dollars(subtotal)}</strong>
              </div>
              <div className="space-y-3">
                {(salon.services ?? []).map((item) => (
                  <button className={`booking-service-row block w-full rounded-lg text-left ${selectedServices.some((selected) => selected.id === item.id) ? "ring-2 ring-brand-500" : ""}`} key={item.id} onClick={() => toggleService(item.id)} type="button">
                    <ServiceRow service={item} action={selectedServices.some((selected) => selected.id === item.id) ? "Selected" : "Add"} />
                  </button>
                ))}
              </div>
            </StepCard>
          ) : null}

          {activeStep === 1 ? (
            <StepCard title="Choose Stylist" onNext={goNext} onPrevious={goPrevious}>
              <div className="grid gap-5 md:grid-cols-4">
                {(salon.stylists ?? []).map((item) => (
                  <button className={`rounded-lg p-3 text-center transition ${item.id === stylist?.id ? "bg-brand-50 ring-2 ring-brand-500" : "hover:bg-brand-50"}`} key={item.id} onClick={() => setStylistId(item.id)} type="button">
                    <BeautyPortrait className="mx-auto mb-2 h-28 w-28" src={item.imageUrl ?? undefined} label={item.name[0]} />
                    <strong>{item.name}</strong>
                    <p className="text-brand-500">★ {item.rating}</p>
                  </button>
                ))}
              </div>
            </StepCard>
          ) : null}

          {activeStep === 2 ? (
            <StepCard title="Pick Date & Time" onNext={goNext} onPrevious={goPrevious}>
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
                <div className="rounded-lg border border-pink-100 p-4">
                  <div className="mb-4 flex items-center justify-between font-black">
                    <span>July 2026</span>
                    <span className="text-brand-500">Tue 21</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      ["Mon", "20", "2026-07-20T10:00:00.000Z"],
                      ["Tue", "21", "2026-07-21T10:00:00.000Z"],
                      ["Wed", "22", "2026-07-22T10:00:00.000Z"],
                      ["Thu", "23", "2026-07-23T10:00:00.000Z"],
                      ["Fri", "24", "2026-07-24T10:00:00.000Z"]
                    ].map(([day, date, value]) => (
                      <button className={`date-chip ${startsAt.startsWith(value.slice(0, 10)) ? "active" : ""}`} key={value} onClick={() => setStartsAt(value)} type="button">{day}<br />{date}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-4 font-black">Available Times</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {timeSlots.map(([label, time]) => {
                      const date = startsAt.slice(0, 10);
                      const slot = `${date}T${time}:00.000Z`;
                      return <button key={slot} className={`time-chip ${startsAt === slot ? "active" : ""}`} onClick={() => setStartsAt(slot)} type="button">{label}</button>;
                    })}
                  </div>
                </div>
              </div>
            </StepCard>
          ) : null}

          {activeStep === 3 ? (
            <StepCard title="Your Details" onNext={goNext} onPrevious={goPrevious} nextLabel="Continue to Payment">
              {!me ? <p className="text-muted">Please <Link className="font-bold text-brand-500" to="/login">login</Link> before confirming your booking.</p> : <p className="text-muted">Booking as {me.name} · {me.email}</p>}
              <textarea className="input mt-4 min-h-28 w-full" placeholder="Any special requests or notes?" value={notes} onChange={(event) => setNotes(event.target.value)} />
              <label className="mt-4 flex gap-2 text-sm"><input type="checkbox" defaultChecked /> I would like to receive updates and exclusive offers via email or SMS</label>
            </StepCard>
          ) : null}

          {activeStep === 4 ? (
            <div className="card p-6">
              <h2 className="section-title">Payment</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <button className="rounded-lg border-2 border-brand-500 bg-brand-50 p-5 text-left" type="button">
                  <CreditCard className="mb-3 text-brand-500" />
                  <strong>Credit / Debit Card</strong>
                  <p className="mt-1 text-sm text-muted">Pay securely after confirming your booking.</p>
                </button>
                <button className="rounded-lg border border-pink-100 p-5 text-left" type="button">
                  <ShieldCheck className="mb-3 text-brand-500" />
                  <strong>Pay at Salon</strong>
                  <p className="mt-1 text-sm text-muted">Confirm now and pay during your appointment.</p>
                </button>
              </div>
              {!me ? <p className="mt-5 text-muted">Please <Link className="font-bold text-brand-500" to="/login">login</Link> to complete this booking.</p> : null}
              {mutation.isSuccess ? <p className="mt-5 font-bold text-emerald-600">Booking created successfully. You can view it in booking history.</p> : null}
              {mutation.isError ? <p className="mt-5 font-bold text-brand-500">Unable to create booking. Please login and try again.</p> : null}
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button className="btn-outline" type="button" onClick={goPrevious}><ArrowLeft size={18} /> Previous</button>
                <button disabled={!me || mutation.isPending || mutation.isSuccess} className="btn-primary px-12 py-4 disabled:opacity-50" onClick={() => mutation.mutate()} type="button">
                  {mutation.isPending ? "Confirming..." : "Confirm Booking"} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : null}
        </section>
        <aside className="space-y-5">
          <div className="card p-6">
            <h2 className="section-title">Booking Summary</h2>
            <div className="mt-5 flex gap-4"><SalonImage salon={{ ...salon, palette: "pink" }} /><div><strong>{salon.name}</strong><p className="text-sm text-muted"><MapPin size={14} className="inline" /> {salon.address}</p><p className="text-brand-500"><Star size={14} className="inline" fill="currentColor" /> {salon.rating}</p></div></div>
            <div className="mt-6 space-y-3 border-t border-pink-100 pt-5 text-sm">
              <Summary label={selectedServices.length > 1 ? "Services" : "Service"} value={selectedServices.map((item) => item.name).join(", ") || "-"} />
              <Summary label="Stylist" value={stylist?.name ?? "-"} />
              <Summary label="Date" value={formatBookingDate(startsAt)} />
              <Summary label="Time" value={formatBookingTime(startsAt)} />
              <Summary label="Subtotal" value={dollars(subtotal)} />
              <Summary label="Tax" value={dollars(tax)} />
            </div>
            <div className="mt-5 flex justify-between text-xl font-black"><span>Total</span><span className="text-brand-500">{dollars(subtotal + tax)}</span></div>
          </div>
          <div className="card p-6"><h3 className="text-xl font-black">Why Book with Us?</h3>{["Instant Confirmation", "Secure Payments", "Top Rated Salons", "24/7 Support"].map((x) => <p className="mt-4 flex gap-3" key={x}><span className="feature-icon"><Check size={18} /></span>{x}</p>)}</div>
        </aside>
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><strong>{value}</strong></div>;
}

function toggleServiceInList(currentIds: string[], serviceId: string) {
  if (currentIds.includes(serviceId)) {
    return currentIds.length === 1 ? currentIds : currentIds.filter((id) => id !== serviceId);
  }
  return [...currentIds, serviceId];
}

function formatBookingDate(value: string) {
  return new Date(value).toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
}

function formatBookingTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

function StepCard({ title, children, onNext, onPrevious, nextLabel = "Next" }: { title: string; children: React.ReactNode; onNext: () => void; onPrevious?: () => void; nextLabel?: string }) {
  return (
    <div className="card p-6">
      <h2 className="section-title mb-5">{title}</h2>
      {children}
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        {onPrevious ? <button className="btn-outline" type="button" onClick={onPrevious}><ArrowLeft size={18} /> Previous</button> : <span />}
        <button className="btn-primary px-10 py-4" type="button" onClick={onNext}>{nextLabel} <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
