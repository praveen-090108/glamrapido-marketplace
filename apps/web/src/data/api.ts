import axios from "axios";
import { offers as mockOffers, salons as mockSalons, services as mockServices, stylists as mockStylists } from "./mock";

export type Salon = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  city: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string | null;
  verified: boolean;
  services?: Service[];
  stylists?: Stylist[];
  offers?: Offer[];
  reviews?: Review[];
};

export type Service = {
  id: string;
  salonId: string;
  name: string;
  category: string;
  description: string;
  durationMin: number;
  priceCents: number;
  imageUrl?: string | null;
  salon?: Salon;
};

export type Stylist = {
  id: string;
  salonId: string;
  name: string;
  title: string;
  bio: string;
  rating: number;
  imageUrl?: string | null;
  years: number;
  salon?: Salon;
};

export type Offer = {
  id: string;
  salonId: string;
  title: string;
  code: string;
  discountPct: number;
  expiresAt: string;
  salon?: Pick<Salon, "id" | "slug" | "name" | "imageUrl">;
};

export type Review = {
  id: string;
  userId: string;
  salonId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: { name: string; avatarUrl?: string | null };
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
};

export type Booking = {
  id: string;
  userId: string;
  salonId: string;
  serviceId: string;
  stylistId?: string | null;
  startsAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  totalCents: number;
  notes?: string | null;
  salon: Salon;
  service: Service;
  stylist?: Stylist | null;
};

const LOCAL_USER_KEY = "glam_local_user";
const LOCAL_BOOKINGS_KEY = "glam_local_bookings";
const LOCAL_TOKEN = "local-dev-access-token";

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (configuredUrl) return configuredUrl;

  if (typeof window !== "undefined" && ["4173", "5174"].includes(window.location.port)) {
    return "http://localhost:4000/api";
  }

  return "/api";
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getAccessToken() {
  return localStorage.getItem("glam_access_token");
}

export function setSession(accessToken: string, refreshToken: string) {
  localStorage.setItem("glam_access_token", accessToken);
  localStorage.setItem("glam_refresh_token", refreshToken);
}

export function clearSession() {
  localStorage.removeItem("glam_access_token");
  localStorage.removeItem("glam_refresh_token");
  localStorage.removeItem(LOCAL_USER_KEY);
}

export async function fetchFeatured() {
  try {
    const response = await api.get<{ salons: Salon[]; offers: Offer[] }>("/salons/featured");
    return response.data;
  } catch {
    return { salons: fallbackSalons(), offers: fallbackOffers() };
  }
}

export async function fetchSalons(params?: { q?: string; category?: string; minRating?: number }) {
  try {
    const response = await api.get<{ salons: Salon[] }>(params?.q ? "/salons/search" : "/salons", { params });
    return response.data.salons;
  } catch {
    return fallbackSalons().filter((salon) => {
      const matchesSearch = params?.q ? salonMatchesSearch(salon, params.q) : true;
      const matchesRating = params?.minRating ? salon.rating >= params.minRating : true;
      const matchesCategory = params?.category ? salon.services?.some((service) => service.category === params.category) : true;
      return matchesSearch && matchesRating && matchesCategory;
    });
  }
}

export async function fetchSalon(slug: string) {
  try {
    const response = await api.get<{ salon: Salon }>(`/salons/${slug}`);
    return response.data.salon;
  } catch {
    const salon = fallbackSalons().find((item) => item.slug === slug);
    if (!salon) throw new Error("Salon not found");
    return salon;
  }
}

export async function fetchServices(salonSlug = "the-glam-studio") {
  try {
    const response = await api.get<{ services: Service[] }>("/salons/services/all", { params: { salonSlug } });
    return response.data.services;
  } catch {
    return fallbackServices(salonSlug);
  }
}

export async function fetchStylists(salonSlug = "the-glam-studio") {
  try {
    const response = await api.get<{ stylists: Stylist[] }>("/salons/stylists/all", { params: { salonSlug } });
    return response.data.stylists;
  } catch {
    return fallbackStylists(salonSlug);
  }
}

export async function fetchOffers(salonSlug = "the-glam-studio") {
  try {
    const response = await api.get<{ offers: Offer[] }>("/salons/offers/all", { params: { salonSlug } });
    return response.data.offers;
  } catch {
    return fallbackOffers(salonSlug);
  }
}

export async function fetchStylist(slug: string) {
  try {
    const response = await api.get<{ stylist: Stylist & { salon: Salon } }>(`/salons/stylists/${slug}`);
    return response.data.stylist;
  } catch {
    const stylist = fallbackStylists().find((item) => stylistSlug(item.name) === slug);
    const salon = fallbackSalons()[0];
    if (!stylist) throw new Error("Stylist not found");
    return { ...stylist, salon };
  }
}

export async function login(input: { email: string; password: string }) {
  try {
    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", input);
    setSession(response.data.accessToken, response.data.refreshToken);
    saveLocalUser(response.data.user);
    return response.data;
  } catch {
    const user = findLocalUser(input.email);
    if (!user || input.password.length < 8) throw new Error("Invalid email or password");
    setSession(LOCAL_TOKEN, "local-dev-refresh-token");
    saveLocalUser(user);
    return { user, accessToken: LOCAL_TOKEN, refreshToken: "local-dev-refresh-token" };
  }
}

export async function signup(input: { name: string; email: string; phone?: string; password: string }) {
  try {
    const response = await api.post<{ user: User; accessToken: string; refreshToken: string }>("/auth/signup", input);
    setSession(response.data.accessToken, response.data.refreshToken);
    saveLocalUser(response.data.user);
    return response.data;
  } catch {
    const user: User = {
      id: `local-user-${Date.now()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      role: "CUSTOMER",
      avatarUrl: "/images/jessica-brown.jpg"
    };
    saveLocalUser(user);
    setSession(LOCAL_TOKEN, "local-dev-refresh-token");
    return { user, accessToken: LOCAL_TOKEN, refreshToken: "local-dev-refresh-token" };
  }
}

export async function fetchMe() {
  try {
    const response = await api.get<{ user: User }>("/auth/me");
    saveLocalUser(response.data.user);
    return response.data.user;
  } catch {
    const user = getLocalUser();
    if (!user) throw new Error("User not found");
    return user;
  }
}

export async function fetchBookings() {
  try {
    const response = await api.get<{ bookings: Booking[] }>("/bookings");
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(response.data.bookings));
    return response.data.bookings;
  } catch {
    return getLocalBookings();
  }
}

export async function createBooking(input: { salonId: string; serviceId: string; serviceIds?: string[]; stylistId?: string; startsAt: string; notes?: string }) {
  try {
    const response = await api.post<{ booking: Booking }>("/bookings", input);
    const bookings = [response.data.booking, ...getLocalBookings().filter((booking) => booking.id !== response.data.booking.id)];
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    return response.data.booking;
  } catch {
    const salons = fallbackSalons();
    const salon = salons.find((item) => item.id === input.salonId) ?? salons[0];
    const requestedServiceIds = input.serviceIds?.length ? input.serviceIds : [input.serviceId];
    const selectedServices = requestedServiceIds.map((id) => salon.services?.find((item) => item.id === id)).filter((service): service is Service => Boolean(service));
    const service = selectedServices[0] ?? salon.services?.find((item) => item.id === input.serviceId) ?? salon.services?.[0];
    const stylist = salon.stylists?.find((item) => item.id === input.stylistId) ?? salon.stylists?.[0] ?? null;
    if (!service) throw new Error("Select a service");
    const subtotal = selectedServices.length ? selectedServices.reduce((sum, item) => sum + item.priceCents, 0) : service.priceCents;
    const serviceSummary = selectedServices.length > 1 ? `Selected services: ${selectedServices.map((item) => item.name).join(", ")}` : "";
    const notes = [input.notes, serviceSummary].filter(Boolean).join("\n\n") || undefined;

    const booking: Booking = {
      id: `local-booking-${Date.now()}`,
      userId: getLocalUser()?.id ?? "local-user",
      salonId: salon.id,
      serviceId: service.id,
      stylistId: stylist?.id,
      startsAt: input.startsAt,
      status: "CONFIRMED",
      totalCents: subtotal + Math.round(subtotal * 0.08875),
      notes,
      salon,
      service,
      stylist
    };
    const bookings = [booking, ...getLocalBookings()];
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    return booking;
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const response = await api.patch<{ booking: Booking }>(`/bookings/${bookingId}/cancel`);
    const bookings = getLocalBookings().map((booking) => booking.id === bookingId ? response.data.booking : booking);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    return response.data.booking;
  } catch {
    const bookings = getLocalBookings();
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "CANCELLED") throw new Error("Booking is already cancelled");
    if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") throw new Error("This booking can no longer be cancelled");

    const updatedBooking: Booking = { ...booking, status: "CANCELLED" };
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings.map((item) => item.id === bookingId ? updatedBooking : item)));
    return updatedBooking;
  }
}

export function dollars(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Math.round(cents / 100));
}

export function stylistSlug(name: string) {
  return name.toLowerCase().replaceAll(" ", "-");
}

function fallbackSalons(): Salon[] {
  return mockSalons.map((salon, index) => ({
    id: `salon-${index + 1}`,
    slug: salon.slug,
    name: salon.name,
    description: `${salon.name} is a verified Glam Rapido partner salon offering premium beauty services in New York.`,
    address: `${123 + index * 37} Beauty Lane`,
    city: "New York, USA",
    distanceKm: Number.parseFloat(salon.distance),
    rating: salon.rating,
    reviewCount: salon.reviews,
    imageUrl: salon.imageUrl,
    verified: true,
    services: fallbackServices(salon.slug),
    stylists: fallbackStylists(salon.slug),
    offers: fallbackOffers(salon.slug),
    reviews: fallbackReviews(`salon-${index + 1}`)
  }));
}

function fallbackServices(salonSlug = "the-glam-studio"): Service[] {
  const salonId = fallbackSalonId(salonSlug);
  return mockServices.map((service, index) => ({
    id: `${salonId}-service-${index + 1}`,
    salonId,
    name: service.name,
    category: service.category,
    description: service.description,
    durationMin: service.minutes,
    priceCents: service.price * 100,
    imageUrl: service.imageUrl
  }));
}

function fallbackStylists(salonSlug = "the-glam-studio"): Stylist[] {
  const salonId = fallbackSalonId(salonSlug);
  return mockStylists.map((stylist, index) => ({
    id: `${salonId}-stylist-${index + 1}`,
    salonId,
    name: stylist.name,
    title: stylist.title,
    bio: `${stylist.name} is a certified Glam Rapido professional known for personalized beauty care.`,
    rating: stylist.rating,
    imageUrl: stylist.avatarUrl,
    years: Number.parseInt(stylist.years, 10)
  }));
}

function fallbackOffers(salonSlug?: string): Offer[] {
  const salons = salonSlug ? mockSalons.filter((salon) => salon.slug === salonSlug) : mockSalons;
  return salons.flatMap((salon) => {
    const salonId = fallbackSalonId(salon.slug);
    return mockOffers.slice(0, 1).map((offer, offerIndex) => ({
      id: `${salonId}-offer-${offerIndex + 1}`,
      salonId,
      title: offer.title,
      code: offer.code,
      discountPct: Number.parseInt(offer.discount, 10),
      expiresAt: "2026-12-31T23:59:59.000Z",
      salon: {
        id: salonId,
        slug: salon.slug,
        name: salon.name,
        imageUrl: salon.imageUrl
      }
    }));
  }).slice(0, salonSlug ? 4 : 8);
}

function fallbackReviews(salonId: string): Review[] {
  return [
    {
      id: `${salonId}-review-1`,
      userId: "user-sarah",
      salonId,
      rating: 5,
      comment: "Absolutely loved my experience. The staff was professional and the salon looked beautiful.",
      createdAt: "2026-05-20T10:00:00.000Z",
      user: { name: "Sarah Johnson", avatarUrl: "/images/sarah-johnson.jpg" }
    },
    {
      id: `${salonId}-review-2`,
      userId: "user-jessica",
      salonId,
      rating: 5,
      comment: "Easy booking, clean salon, and great service from start to finish.",
      createdAt: "2026-05-14T10:00:00.000Z",
      user: { name: "Jessica Brown", avatarUrl: "/images/jessica-brown.jpg" }
    }
  ];
}

function fallbackSalonId(salonSlug: string) {
  return `salon-${Math.max(1, mockSalons.findIndex((salon) => salon.slug === salonSlug) + 1)}`;
}

function salonMatchesSearch(salon: Salon, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  const searchableText = [
    salon.name,
    salon.description,
    salon.address,
    salon.city,
    ...(salon.services?.flatMap((service) => [service.name, service.category, service.description]) ?? []),
    ...(salon.stylists?.flatMap((stylist) => [stylist.name, stylist.title, stylist.bio]) ?? [])
  ].join(" ").toLowerCase();

  return searchableText.includes(query);
}

function getLocalUser(): User | undefined {
  const stored = localStorage.getItem(LOCAL_USER_KEY);
  if (stored) return JSON.parse(stored) as User;
  return {
    id: "local-user-jessica",
    name: "Jessica Brown",
    email: "jessica.brown@gmail.com",
    phone: "+1 212 555 9876",
    role: "CUSTOMER",
    avatarUrl: "/images/jessica-brown.jpg"
  };
}

function findLocalUser(email: string) {
  const user = getLocalUser();
  return user?.email.toLowerCase() === email.toLowerCase() ? user : undefined;
}

function saveLocalUser(user: User) {
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
}

function getLocalBookings(): Booking[] {
  const stored = localStorage.getItem(LOCAL_BOOKINGS_KEY);
  return stored ? JSON.parse(stored) as Booking[] : [];
}
