import { CalendarDays, Check, CheckCircle2, CreditCard, Scissors, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { dollars, fetchSalon, type Salon } from "../data/api";
import { BeautyPortrait } from "./Visuals";

const dates = [
  ["Mon", "20", "2026-07-20"],
  ["Tue", "21", "2026-07-21"],
  ["Wed", "22", "2026-07-22"],
  ["Thu", "23", "2026-07-23"],
  ["Fri", "24", "2026-07-24"]
] as const;

const times = [
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

export function BookingPanel({ compact = false, salon: providedSalon, salonSlug = "the-glam-studio" }: { compact?: boolean; salon?: Salon; salonSlug?: string }) {
  const { data: fetchedSalon } = useQuery({ queryKey: ["salon", salonSlug], queryFn: () => fetchSalon(salonSlug), enabled: !providedSalon });
  const salon = providedSalon ?? fetchedSalon;
  const service = salon?.services?.[0];
  const stylists = salon?.stylists ?? [];
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [stylistId, setStylistId] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-07-21");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const startsAt = `${selectedDate}T${selectedTime}:00.000Z`;

  useEffect(() => {
    if (!salon) return;
    setServiceIds((current) => {
      const availableIds = new Set((salon.services ?? []).map((item) => item.id));
      const validIds = current.filter((id) => availableIds.has(id));
      return validIds.length ? validIds : salon.services?.[0]?.id ? [salon.services[0].id] : [];
    });
    setStylistId((current) => current || salon.stylists?.[0]?.id || "");
  }, [salon]);

  const selectedServices = useMemo(() => {
    const services = salon?.services ?? [];
    const selected = serviceIds.map((id) => services.find((item) => item.id === id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
    return selected.length ? selected : service ? [service] : [];
  }, [salon, service, serviceIds]);
  const subtotal = selectedServices.reduce((sum, item) => sum + item.priceCents, 0);
  const bookingUrl = useMemo(() => {
    if (!salon || selectedServices.length === 0) return "/booking";
    const params = new URLSearchParams({ salon: salon.slug, serviceId: selectedServices[0].id, serviceIds: selectedServices.map((item) => item.id).join(","), startsAt, step: "3" });
    if (stylistId) params.set("stylistId", stylistId);
    return `/booking?${params.toString()}`;
  }, [salon, selectedServices, startsAt, stylistId]);

  function toggleService(serviceId: string) {
    setServiceIds((current) => {
      if (current.includes(serviceId)) {
        return current.length === 1 ? current : current.filter((id) => id !== serviceId);
      }
      return [...current, serviceId];
    });
  }

  return (
    <aside className="booking-panel card sticky top-28 space-y-7 p-6">
      <h2 className="text-2xl font-black">Book an Appointment</h2>
      <div>
        <label className="form-label">Select Services</label>
        <div className="booking-service-multi">
          {(salon?.services ?? []).map((item) => {
            const selected = selectedServices.some((selectedService) => selectedService.id === item.id);
            return (
              <button className={`booking-service-option ${selected ? "active" : ""}`} key={item.id} onClick={() => toggleService(item.id)} type="button">
                <span className="booking-service-check">{selected ? <Check size={14} /> : <Scissors size={15} />}</span>
                <span className="min-w-0 flex-1">
                  <strong>{item.name}</strong>
                  <small>{item.durationMin} min</small>
                </span>
                <b>{dollars(item.priceCents)}</b>
              </button>
            );
          })}
          {!salon?.services?.length ? <div className="select-box">Haircut & Styling</div> : null}
        </div>
        <div className="booking-service-total">
          <span>{selectedServices.length} selected</span>
          <strong>{dollars(subtotal)}</strong>
        </div>
      </div>
      {!compact ? (
        <div>
          <label className="form-label">Select Stylist <span className="font-normal text-muted">(Optional)</span></label>
          <div className="flex items-center gap-5">
            {stylists.slice(0, 3).map((stylist, index) => (
              <button key={stylist.name} className="booking-stylist-option text-center text-sm" onClick={() => setStylistId(stylist.id)} type="button">
                <span className="relative block">
                  <BeautyPortrait className={`avatar-lg ${stylistId === stylist.id ? "ring-2 ring-brand-500" : ""}`} label={stylist.name[0]} src={stylist.imageUrl ?? undefined} />
                  {stylistId === stylist.id ? <span className="booking-stylist-check"><Check size={13} /></span> : null}
                </span>
                <span>{stylist.name.split(" ")[0]}</span>
              </button>
            ))}
            <button className="grid h-16 w-16 place-items-center rounded-full border border-pink-100 bg-white text-2xl" type="button">...</button>
          </div>
        </div>
      ) : null}
      <div>
        <label className="form-label flex items-center justify-between">Select Date <CalendarDays size={19} /></label>
        <div className="grid grid-cols-5 gap-3">
          {dates.map(([day, date, value]) => (
            <button key={value} className={`date-chip ${selectedDate === value ? "active" : ""}`} onClick={() => setSelectedDate(value)} type="button">{day}<br />{date}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="form-label">Select Time</label>
        <div className="grid grid-cols-3 gap-3">
          {times.map(([label, value]) => <button className={`time-chip ${selectedTime === value ? "active" : ""}`} key={value} onClick={() => setSelectedTime(value)} type="button">{label}</button>)}
        </div>
      </div>
      <Link to={bookingUrl} className="btn-primary block py-4 text-center">Book Now</Link>
      <div className="space-y-4 border-t border-pink-100 pt-5">
        {[
          [CheckCircle2, "Instant Confirmation", "Get booking confirmation instantly"],
          [CreditCard, "Secure Payments", "100% safe & secure payments"],
          [ShieldCheck, "24/7 Support", "We're here to help you anytime"]
        ].map(([Icon, title, copy]) => (
          <div key={String(title)} className="flex gap-3">
            <span className="feature-icon"><Icon size={20} /></span>
            <p><strong className="block text-sm">{String(title)}</strong><span className="text-sm text-muted">{String(copy)}</span></p>
          </div>
        ))}
      </div>
    </aside>
  );
}
