import bcrypt from "bcryptjs";
import { PrismaClient, Role, type BookingStatus } from "@prisma/client";

const prisma = new PrismaClient();

const serviceTemplates = [
  ["Haircut & Styling", "Hair", "Precision haircut with blow dry and style", 45, 4500, "/images/service-haircut.jpg"],
  ["Hair Color", "Hair", "Global hair color with premium products", 90, 12000, "/images/service-hair-color.jpg"],
  ["Gel Manicure", "Nails", "Nail shaping, cuticle care and gel polish", 60, 4000, "/images/service-gel-manicure.jpg"],
  ["Hydra Facial", "Facial", "Deep cleansing and hydration boost", 60, 9000, "/images/service-hydra-facial.jpg"]
] as const;

const stylistTemplates = [
  ["Emma Wilson", "Senior Stylist", "Passionate about creating polished looks that bring out the best in every client.", 4.9, 10, "/images/emma-wilson.jpg"],
  ["Sophia Martinez", "Hair Color Specialist", "Balayage, highlights and rich color specialist with a soft-glam finish.", 4.8, 7, "/images/sophia-martinez.jpg"],
  ["Olivia Brown", "Makeup Artist", "Soft glam, party makeup and bridal-ready beauty expert.", 4.9, 6, "/images/olivia-brown.jpg"],
  ["Ava Johnson", "Nail Artist", "Detailed gel manicure, nail art and care specialist.", 4.7, 5, "/images/ava-johnson.jpg"]
] as const;

const salons = [
  {
    slug: "the-glam-studio",
    name: "The Glam Studio",
    address: "123 Beauty Lane, Manhattan, New York, NY 10001",
    city: "New York, USA",
    distanceKm: 0.8,
    rating: 4.8,
    reviewCount: 320,
    imageUrl: "/images/the-glam-studio.jpg",
    description: "A luxury pink beauty destination for hair, makeup, nails and skincare with expert stylists and premium products.",
    offers: [["On All Hair Services", "HAIR20", 20], ["On Makeup Services", "GLAM15", 15], ["Hydra Facial Offer", "FACE30", 30]]
  },
  {
    slug: "style-lounge",
    name: "Style Lounge",
    address: "88 Madison Ave, New York, NY 10016",
    city: "New York, USA",
    distanceKm: 1.2,
    rating: 4.7,
    reviewCount: 248,
    imageUrl: "/images/style-lounge.jpg",
    description: "Modern lounge for hair styling, color refreshes, soft makeup looks and relaxing beauty appointments.",
    offers: [["Style Refresh Deal", "STYLE15", 15], ["Color Glow Offer", "COLOR20", 20], ["Weekend Glam", "LOUNGE10", 10]]
  },
  {
    slug: "looks-salon",
    name: "Looks Salon",
    address: "54 Park Lane, New York, NY 10022",
    city: "New York, USA",
    distanceKm: 1.5,
    rating: 4.6,
    reviewCount: 180,
    imageUrl: "/images/looks-salon.jpg",
    description: "A polished salon for everyday cuts, facials, massage add-ons and camera-ready beauty services.",
    offers: [["Looks Signature Offer", "LOOKS10", 10], ["Facial Glow", "LOOKFACE20", 20], ["Hair Care Deal", "LOOKHAIR15", 15]]
  },
  {
    slug: "blush-beauty-bar",
    name: "Blush Beauty Bar",
    address: "19 Rose Street, New York, NY 10013",
    city: "New York, USA",
    distanceKm: 1.8,
    rating: 4.5,
    reviewCount: 120,
    imageUrl: "/images/blush-beauty-bar.jpg",
    description: "A playful beauty bar specializing in party makeup, nail services, facials and fast glam bookings.",
    offers: [["Blush Makeup Deal", "BLUSH25", 25], ["Nail Art Special", "BLUSHNAIL20", 20], ["Beauty Bar Combo", "BAR15", 15]]
  },
  {
    slug: "aura-hair-studio",
    name: "Aura Hair Studio",
    address: "73 Greenpoint Ave, Brooklyn, NY 11222",
    city: "New York, USA",
    distanceKm: 2.0,
    rating: 4.6,
    reviewCount: 210,
    imageUrl: "/images/aura-hair-studio.jpg",
    description: "Relaxed hair studio known for clean cuts, dimensional highlights, scalp care and warm consultations.",
    offers: [["Aura Haircut Offer", "AURA15", 15], ["Highlights Deal", "AURAGLOW20", 20], ["First Visit Aura", "AURANEW10", 10]]
  },
  {
    slug: "luxe-beauty-house",
    name: "Luxe Beauty House",
    address: "301 Soho Road, New York, NY 10012",
    city: "New York, USA",
    distanceKm: 2.3,
    rating: 4.7,
    reviewCount: 160,
    imageUrl: "/images/luxe-beauty-house.jpg",
    description: "Premium beauty house for high-end hair, makeup, nails and elevated occasion-ready appointments.",
    offers: [["Luxe Member Deal", "LUXE20", 20], ["Premium Makeup", "LUXEGLAM15", 15], ["Nail Luxe", "LUXENAIL10", 10]]
  },
  {
    slug: "skin-secret-spa",
    name: "Skin Secret Spa",
    address: "27 Wellness Way, New York, NY 10010",
    city: "New York, USA",
    distanceKm: 2.6,
    rating: 4.8,
    reviewCount: 190,
    imageUrl: "/images/skin-secret-spa.jpg",
    description: "Calm spa focused on hydrated skin, relaxing facials, gentle treatments and beauty maintenance.",
    offers: [["Skin Secret Facial", "SKIN20", 20], ["Hydration Boost", "HYDRA25", 25], ["Spa Glow Deal", "SPA15", 15]]
  },
  {
    slug: "bella-beauty-studio",
    name: "Bella Beauty Studio",
    address: "66 Bloom Street, New York, NY 10003",
    city: "New York, USA",
    distanceKm: 2.9,
    rating: 4.5,
    reviewCount: 140,
    imageUrl: "/images/bella-beauty-studio.jpg",
    description: "Warm and floral studio for hair styling, makeup, nails and friendly neighborhood beauty care.",
    offers: [["Bella Beauty Deal", "BELLA15", 15], ["Bloom Makeup", "BLOOM20", 20], ["Bella Nails", "BELLANAIL25", 25]]
  },
  {
    slug: "glow-beauty-lounge",
    name: "Glow Beauty Lounge",
    address: "456 Wellness Ave, New York, NY 10011",
    city: "New York, USA",
    distanceKm: 3.1,
    rating: 4.7,
    reviewCount: 176,
    imageUrl: "/images/service-hydra-facial.jpg",
    description: "Fresh beauty lounge for glowing facials, clean makeup looks, hair refreshes and easy repeat bookings.",
    offers: [["Glow Facial Offer", "GLOW20", 20], ["Lounge Combo", "GLOWCOMBO15", 15], ["Glow New Client", "GLOWNEW10", 10]]
  },
  {
    slug: "the-nail-bar",
    name: "The Nail Bar",
    address: "789 Nail Street, New York, NY 10009",
    city: "New York, USA",
    distanceKm: 3.4,
    rating: 4.6,
    reviewCount: 132,
    imageUrl: "/images/service-gel-manicure.jpg",
    description: "Specialist nail studio for gel manicures, nail art, cuticle care and quick polish appointments.",
    offers: [["Gel Manicure Deal", "NAIL20", 20], ["Nail Art Special", "ART25", 25], ["Bar Beauty Combo", "NAILBAR15", 15]]
  }
] as const;

const reviewUsers = [
  ["sarah.johnson@example.com", "Sarah Johnson", "/images/sarah-johnson.jpg"],
  ["emily.davis@example.com", "Emily Davis", "/images/olivia-brown.jpg"],
  ["jessica.brown@gmail.com", "Jessica Brown", "/images/jessica-brown.jpg"]
] as const;

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const users = await Promise.all(
    reviewUsers.map(([email, name, avatarUrl]) =>
      prisma.user.upsert({
        where: { email },
        update: { name, avatarUrl },
        create: {
          name,
          email,
          phone: "+1 212 555 9876",
          passwordHash,
          role: Role.CUSTOMER,
          avatarUrl
        }
      })
    )
  );
  const customer = users[2];

  for (const salonData of salons) {
    const salon = await prisma.salon.upsert({
      where: { slug: salonData.slug },
      update: {
        name: salonData.name,
        address: salonData.address,
        city: salonData.city,
        distanceKm: salonData.distanceKm,
        rating: salonData.rating,
        reviewCount: salonData.reviewCount,
        description: salonData.description,
        verified: true,
        imageUrl: salonData.imageUrl
      },
      create: {
        slug: salonData.slug,
        name: salonData.name,
        address: salonData.address,
        city: salonData.city,
        distanceKm: salonData.distanceKm,
        rating: salonData.rating,
        reviewCount: salonData.reviewCount,
        description: salonData.description,
        verified: true,
        imageUrl: salonData.imageUrl
      }
    });

    await prisma.review.deleteMany({ where: { salonId: salon.id } });
    await prisma.booking.deleteMany({ where: { salonId: salon.id } });
    await prisma.offer.deleteMany({ where: { salonId: salon.id } });
    await prisma.service.deleteMany({ where: { salonId: salon.id } });
    await prisma.stylist.deleteMany({ where: { salonId: salon.id } });

    const services = await Promise.all(
      serviceTemplates.map(([name, category, description, durationMin, priceCents, imageUrl], index) =>
        prisma.service.create({
          data: {
            salonId: salon.id,
            name: index === 0 && salonData.slug === "the-nail-bar" ? "Gel Nail Design" : name,
            category,
            description,
            durationMin,
            priceCents: priceCents + (salons.findIndex((item) => item.slug === salonData.slug) % 3) * 500,
            imageUrl
          }
        })
      )
    );

    const stylists = await Promise.all(
      stylistTemplates.map(([baseName, title, bio, rating, years, imageUrl], index) =>
        prisma.stylist.create({
          data: {
            salonId: salon.id,
            name: `${baseName.split(" ")[0]} ${salonData.name.split(" ")[0]}`,
            title,
            bio,
            rating: Math.min(5, Number((rating - index * 0.03).toFixed(1))),
            years: years + (salons.findIndex((item) => item.slug === salonData.slug) % 2),
            imageUrl
          }
        })
      )
    );

    await prisma.offer.createMany({
      data: salonData.offers.map(([title, code, discountPct]) => ({
        salonId: salon.id,
        title,
        code,
        discountPct,
        expiresAt: new Date("2026-12-31T23:59:59.000Z")
      })),
      skipDuplicates: true
    });

    await prisma.review.createMany({
      data: [
        { userId: users[0].id, salonId: salon.id, rating: 5, comment: `${salon.name} was spotless, welcoming and very professional. I loved the final look.` },
        { userId: users[1].id, salonId: salon.id, rating: 5, comment: `The appointment was smooth from booking to checkout. The stylist understood exactly what I wanted.` },
        { userId: users[2].id, salonId: salon.id, rating: Math.round(salonData.rating), comment: `Beautiful ambience and reliable service. I would book ${salon.name} again.` }
      ]
    });

    if (["the-glam-studio", "glow-beauty-lounge", "the-nail-bar", "skin-secret-spa"].includes(salon.slug)) {
      const status = salon.slug === "the-glam-studio" ? "CONFIRMED" : "COMPLETED";
      await prisma.booking.create({
        data: {
          userId: customer.id,
          salonId: salon.id,
          serviceId: services[0].id,
          stylistId: stylists[0].id,
          startsAt: new Date(`2026-07-${21 + salons.findIndex((item) => item.slug === salonData.slug)}T10:00:00.000Z`),
          status: status as BookingStatus,
          totalCents: services[0].priceCents + Math.round(services[0].priceCents * 0.08875),
          notes: "Seed booking for UI preview"
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
