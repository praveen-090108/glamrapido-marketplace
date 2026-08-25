export type Salon = {
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  tags: string[];
  offer: string;
  palette: string;
  imageUrl: string;
};

export type Service = {
  name: string;
  category: string;
  description: string;
  minutes: number;
  price: number;
  badge?: string;
  image: string;
  imageUrl: string;
};

export type Stylist = {
  name: string;
  title: string;
  rating: number;
  clients: string;
  years: string;
  avatar: string;
  avatarUrl: string;
  specialties: string[];
};

export const salons: Salon[] = [
  { slug: "the-glam-studio", name: "The Glam Studio", rating: 4.8, reviews: 320, distance: "0.8 km", tags: ["Hair", "Makeup", "Nails"], offer: "20% OFF", palette: "pink", imageUrl: "/images/the-glam-studio.jpg" },
  { slug: "style-lounge", name: "Style Lounge", rating: 4.7, reviews: 248, distance: "1.2 km", tags: ["Hair", "Makeup", "Facial"], offer: "15% OFF", palette: "amber", imageUrl: "/images/style-lounge.jpg" },
  { slug: "looks-salon", name: "Looks Salon", rating: 4.6, reviews: 180, distance: "1.5 km", tags: ["Hair", "Facial", "Massage"], offer: "10% OFF", palette: "cream", imageUrl: "/images/looks-salon.jpg" },
  { slug: "blush-beauty-bar", name: "Blush Beauty Bar", rating: 4.5, reviews: 120, distance: "1.8 km", tags: ["Makeup", "Nails", "Facial"], offer: "25% OFF", palette: "violet", imageUrl: "/images/blush-beauty-bar.jpg" },
  { slug: "aura-hair-studio", name: "Aura Hair Studio", rating: 4.6, reviews: 210, distance: "2.0 km", tags: ["Hair", "Highlights", "Haircut"], offer: "15% OFF", palette: "green", imageUrl: "/images/aura-hair-studio.jpg" },
  { slug: "luxe-beauty-house", name: "Luxe Beauty House", rating: 4.7, reviews: 160, distance: "2.3 km", tags: ["Hair", "Makeup", "Nails"], offer: "10% OFF", palette: "dark", imageUrl: "/images/luxe-beauty-house.jpg" },
  { slug: "skin-secret-spa", name: "Skin Secret Spa", rating: 4.8, reviews: 190, distance: "2.6 km", tags: ["Facial", "Skin", "Massage"], offer: "20% OFF", palette: "sand", imageUrl: "/images/skin-secret-spa.jpg" },
  { slug: "bella-beauty-studio", name: "Bella Beauty Studio", rating: 4.5, reviews: 140, distance: "2.9 km", tags: ["Hair", "Makeup", "Nails"], offer: "15% OFF", palette: "rose", imageUrl: "/images/bella-beauty-studio.jpg" }
];

export const services: Service[] = [
  { name: "Haircut & Styling", category: "Hair", description: "Precision haircut with blow dry and style", minutes: 45, price: 45, badge: "Popular", image: "portrait", imageUrl: "/images/service-haircut.jpg" },
  { name: "Hair Color", category: "Hair", description: "Global hair color with premium products", minutes: 90, price: 120, badge: "Trending", image: "hair", imageUrl: "/images/service-hair-color.jpg" },
  { name: "Gel Manicure", category: "Nails", description: "Nail shaping, cuticle care and gel polish", minutes: 60, price: 40, badge: "Bestseller", image: "nails", imageUrl: "/images/service-gel-manicure.jpg" },
  { name: "Hydra Facial", category: "Facial", description: "Deep cleansing and hydration boost", minutes: 60, price: 90, badge: "New", image: "facial", imageUrl: "/images/service-hydra-facial.jpg" }
];

export const stylists: Stylist[] = [
  { name: "Emma Wilson", title: "Senior Stylist", rating: 4.9, clients: "420+", years: "10+ Years", avatar: "emma", avatarUrl: "/images/emma-wilson.jpg", specialties: ["Haircut", "Color", "Styling"] },
  { name: "Sophia Martinez", title: "Hair Color Specialist", rating: 4.8, clients: "380+", years: "7+ Years", avatar: "sophia", avatarUrl: "/images/sophia-martinez.jpg", specialties: ["Hair Color", "Balayage", "Highlights"] },
  { name: "Olivia Brown", title: "Makeup Artist", rating: 4.9, clients: "320+", years: "6+ Years", avatar: "olivia", avatarUrl: "/images/olivia-brown.jpg", specialties: ["Bridal Makeup", "Party Makeup", "HD Makeup"] },
  { name: "Ava Johnson", title: "Nail Artist", rating: 4.7, clients: "280+", years: "5+ Years", avatar: "ava", avatarUrl: "/images/ava-johnson.jpg", specialties: ["Gel Manicure", "Nail Art", "Extensions"] }
];

export const offers = [
  { title: "On All Hair Services", code: "HAIR20", discount: "20% OFF", used: 236 },
  { title: "On Makeup Services", code: "GLAM15", discount: "15% OFF", used: 189 },
  { title: "Nail Art Special", code: "NAIL25", discount: "25% OFF", used: 152 },
  { title: "Hydra Facial Offer", code: "FACE30", discount: "30% OFF", used: 201 }
];

export const bookings = [
  ["The Glam Studio", "Haircut & Styling", "Emma Wilson", "Tue, 21 May 2024", "10:00 AM", "₹45", "Completed"],
  ["Glow Beauty Lounge", "Hydra Facial", "Olivia Brown", "Sat, 11 May 2024", "02:00 PM", "₹90", "Completed"],
  ["The Nail Bar", "Gel Manicure", "Sophia Martinez", "Mon, 29 Apr 2024", "04:00 PM", "₹40", "Completed"],
  ["Makeup Studio Pro", "Bridal Makeup", "Ava Johnson", "Sun, 14 Apr 2024", "11:00 AM", "₹120", "Cancelled"],
  ["The Glam Studio", "Hair Color", "Emma Wilson", "Fri, 05 Apr 2024", "01:00 PM", "₹120", "No Show"]
];
