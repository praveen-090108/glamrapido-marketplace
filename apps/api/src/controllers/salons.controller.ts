import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";

const salonSearchSchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minRating: z.coerce.number().optional()
});

export async function listSalons(req: Request, res: Response) {
  const query = salonSearchSchema.parse(req.query);

  const salons = await prisma.salon.findMany({
    where: buildSalonSearchWhere(query),
    include: {
      services: { take: 3 },
      offers: { take: 1 }
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }]
  });

  return res.json({ salons });
}

export async function searchSalons(req: Request, res: Response) {
  const query = salonSearchSchema.parse(req.query);

  const salons = await prisma.salon.findMany({
    where: buildSalonSearchWhere(query),
    include: {
      services: { take: 3 },
      offers: { take: 1 },
      stylists: { take: 2 }
    },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 24
  });

  return res.json({ salons });
}

export async function listFeaturedData(_req: Request, res: Response) {
  const [salons, offers] = await Promise.all([
    prisma.salon.findMany({
      include: { services: { take: 3 }, offers: { take: 1 } },
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }]
    }),
    prisma.offer.findMany({
      include: { salon: { select: { slug: true, name: true, imageUrl: true } } },
      orderBy: { discountPct: "desc" },
      take: 8
    })
  ]);

  return res.json({ salons, offers });
}

export async function getSalon(req: Request, res: Response) {
  const salon = await prisma.salon.findUnique({
    where: { slug: String(req.params.slug) },
    include: {
      services: true,
      stylists: true,
      offers: true,
      reviews: {
        include: { user: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!salon) return res.status(404).json({ message: "Salon not found" });
  return res.json({ salon });
}

export async function listServices(req: Request, res: Response) {
  const query = z.object({ salonSlug: z.string().optional(), category: z.string().optional() }).parse(req.query);
  const services = await prisma.service.findMany({
    where: {
      category: query.category,
      salon: query.salonSlug ? { slug: query.salonSlug } : undefined
    },
    include: { salon: { select: { id: true, slug: true, name: true, imageUrl: true, rating: true, reviewCount: true, address: true, city: true } } },
    orderBy: { priceCents: "asc" }
  });
  return res.json({ services });
}

export async function listStylists(req: Request, res: Response) {
  const query = z.object({ salonSlug: z.string().optional() }).parse(req.query);
  const stylists = await prisma.stylist.findMany({
    where: { salon: query.salonSlug ? { slug: query.salonSlug } : undefined },
    include: { salon: { select: { id: true, slug: true, name: true } } },
    orderBy: [{ rating: "desc" }, { years: "desc" }]
  });
  return res.json({ stylists });
}

export async function getStylist(req: Request, res: Response) {
  const stylist = await prisma.stylist.findFirst({
    where: { name: String(req.params.slug).replaceAll("-", " ") },
    include: {
      salon: {
        include: {
          services: true,
          offers: true,
          reviews: { include: { user: { select: { name: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" } }
        }
      }
    }
  });
  if (!stylist) return res.status(404).json({ message: "Stylist not found" });
  return res.json({ stylist });
}

export async function listOffers(req: Request, res: Response) {
  const query = z.object({ salonSlug: z.string().optional() }).parse(req.query);
  const offers = await prisma.offer.findMany({
    where: { salon: query.salonSlug ? { slug: query.salonSlug } : undefined },
    include: { salon: { select: { id: true, slug: true, name: true, imageUrl: true } } },
    orderBy: { discountPct: "desc" }
  });
  return res.json({ offers });
}

function buildSalonSearchWhere(query: z.infer<typeof salonSearchSchema>): Prisma.SalonWhereInput {
  const searchText = query.q?.trim();
  const searchFilter: Prisma.SalonWhereInput | undefined = searchText
    ? {
        OR: [
          { name: { contains: searchText } },
          { description: { contains: searchText } },
          { address: { contains: searchText } },
          { city: { contains: searchText } },
          { services: { some: { name: { contains: searchText } } } },
          { services: { some: { category: { contains: searchText } } } },
          { services: { some: { description: { contains: searchText } } } },
          { stylists: { some: { name: { contains: searchText } } } },
          { stylists: { some: { title: { contains: searchText } } } }
        ]
      }
    : undefined;

  return {
    AND: [
      searchFilter,
      query.minRating ? { rating: { gte: query.minRating } } : undefined,
      query.category ? { services: { some: { category: query.category } } } : undefined
    ].filter(Boolean) as Prisma.SalonWhereInput[]
  };
}
