import { Bell, CalendarDays, ChevronDown, Heart, Home, LocateFixed, MapPin, Search, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { fetchMe, getAccessToken } from "../data/api";

const navItems = [
  ["Home", "/"],
  ["Salons", "/salons"]
];

const LOCATION_STORAGE_KEY = "glam_current_location";
const DEFAULT_LOCATION = "New York, USA";

export function AppShell() {
  const loggedIn = Boolean(getAccessToken());
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: fetchMe, enabled: loggedIn, retry: false });
  const avatarUrl = user?.avatarUrl ?? "/images/jessica-brown.jpg";
  const userName = user?.name ?? "My Profile";
  const { label: locationLabel, status: locationStatus, refresh: refreshLocation } = useCurrentLocation();

  return (
    <div className="min-h-screen bg-[#fffbfc] text-ink">
      <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/90 backdrop-blur">
        <div className="app-container flex items-center gap-10 py-4">
          <NavLink to="/" className="brand-link">
            <img className="brand-logo" src="/brand/glamrapido_logo_header.svg" alt="Glam Rápido" />
          </NavLink>
          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map(([label, to]) => (
              <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                {label}
              </NavLink>
            ))}
            <a className="nav-link" href="https://www.glamrapido.com/" target="_blank" rel="noreferrer">
              About Us
            </a>
            <a className="nav-link" href="https://salon.glamrapido.com/salon-registration" target="_blank" rel="noreferrer">
              List your Business
            </a>
          </nav>
          <div className="ml-auto hidden items-center gap-4 md:flex">
            <button className="header-location" type="button" onClick={refreshLocation} title="Use current location">
              {locationStatus === "loading" ? <LocateFixed className="text-brand-500" size={21} /> : <MapPin className="text-brand-500" size={21} />}
              <span>{locationLabel}</span>
              <ChevronDown size={16} />
            </button>
            <span className="relative"><Bell size={23} /><b className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] text-white">3</b></span>
            {loggedIn ? (
              <NavLink to="/profile" className="header-profile-chip">
                <span className="avatar avatar-sm overflow-hidden"><img src={avatarUrl} alt={userName} /></span>
                <span className="hidden max-w-32 truncate xl:inline">{userName}</span>
              </NavLink>
            ) : (
              <NavLink to="/login" className="btn-dark hidden px-5 py-3 xl:inline-flex">Log In</NavLink>
            )}
          </div>
        </div>
      </header>
      <main className="app-container pb-28 pt-8">
        <Outlet />
      </main>
      <nav className="fixed inset-x-4 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-pink-100 bg-white px-2 py-3 shadow-card lg:hidden">
        {[
          ["Home", "/", Home],
          ["Search", "/salons", Search],
          ["Bookings", "/booking-history", CalendarDays],
          ["Favorites", "/salons/the-glam-studio", Heart],
          ["Profile", "/profile", UserRound]
        ].map(([label, to, Icon]) => (
          <NavLink key={String(to)} to={String(to)} className={({ isActive }) => `mobile-nav ${isActive ? "active" : ""}`}>
            <Icon size={23} />
            <span>{String(label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function useCurrentLocation() {
  const [label, setLabel] = useState(() => readSavedLocation() ?? DEFAULT_LOCATION);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  async function refresh() {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nextLabel = await reverseGeocode(latitude, longitude);
        setLabel(nextLabel);
        localStorage.setItem(LOCATION_STORAGE_KEY, nextLabel);
        setStatus("ready");
      },
      () => {
        setStatus("error");
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 9000 }
    );
  }

  useEffect(() => {
    refresh();
  }, []);

  return { label, status, refresh };
}

function readSavedLocation() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(LOCATION_STORAGE_KEY) ?? undefined;
}

async function reverseGeocode(latitude: number, longitude: number) {
  const coordinateLabel = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`, {
      signal: controller.signal
    });
    window.clearTimeout(timeout);
    if (!response.ok) return coordinateLabel;

    const data = await response.json() as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryCode?: string;
      countryName?: string;
    };
    const city = data.city || data.locality || data.principalSubdivision;
    const country = data.countryCode || data.countryName;
    return [city, country].filter(Boolean).join(", ") || coordinateLabel;
  } catch {
    return coordinateLabel;
  }
}
