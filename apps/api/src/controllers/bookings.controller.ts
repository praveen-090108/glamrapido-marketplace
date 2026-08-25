import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";

const createBookingSchema = z.object({
  salonId: z.string().uuid(),
  serviceId: z.string().uuid().optional(),
  serviceIds: z.array(z.string().uuid()).min(1).optional(),
  stylistId: z.string().uuid().optional(),
  startsAt: z.string().datetime(),
  notes: z.string().optional()
}).refine((input) => input.serviceId || input.serviceIds?.length, { message: "Select at least one service", path: ["serviceId"] });

const bookingIdSchema = z.object({
  id: z.string().uuid()
});

export async function listMyBookings(req: Request, res: Response) {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user?.id },
    include: { salon: true, service: true, stylist: true },
    orderBy: { startsAt: "desc" }
  });

  return res.json({ bookings });
}

export async function createBooking(req: Request, res: Response) {
  const input = createBookingSchema.parse(req.body);
  const requestedServiceIds = input.serviceIds?.length ? input.serviceIds : [input.serviceId!];
  const uniqueServiceIds = Array.from(new Set(requestedServiceIds));
  const services = await prisma.service.findMany({ where: { id: { in: uniqueServiceIds }, salonId: input.salonId } });
  if (services.length !== uniqueServiceIds.length) throw new HttpError(400, "One or more selected services do not belong to this salon");
  const serviceById = new Map(services.map((service) => [service.id, service]));
  const orderedServices = uniqueServiceIds.map((id) => serviceById.get(id)).filter((service): service is NonNullable<typeof service> => Boolean(service));
  const primaryService = orderedServices[0];

  if (input.stylistId) {
    const stylist = await prisma.stylist.findFirst({ where: { id: input.stylistId, salonId: input.salonId } });
    if (!stylist) throw new HttpError(400, "Selected stylist does not belong to this salon");
  }

  const subtotal = orderedServices.reduce((sum, service) => sum + service.priceCents, 0);
  const tax = Math.round(subtotal * 0.08875);
  const serviceSummary = orderedServices.length > 1 ? `Selected services: ${orderedServices.map((service) => service.name).join(", ")}` : "";
  const notes = [input.notes, serviceSummary].filter(Boolean).join("\n\n") || undefined;

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.id,
      salonId: input.salonId,
      serviceId: primaryService.id,
      stylistId: input.stylistId,
      startsAt: new Date(input.startsAt),
      notes,
      totalCents: subtotal + tax
    },
    include: { salon: true, service: true, stylist: true }
  });

  return res.status(201).json({ booking });
}

export async function cancelBooking(req: Request, res: Response) {
  const { id } = bookingIdSchema.parse(req.params);
  const booking = await prisma.booking.findFirst({
    where: { id, userId: req.user?.id }
  });

  if (!booking) throw new HttpError(404, "Booking not found");
  if (booking.status === "CANCELLED") throw new HttpError(400, "Booking is already cancelled");
  if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") {
    throw new HttpError(400, "This booking can no longer be cancelled");
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
    include: { salon: true, service: true, stylist: true }
  });

  return res.json({ booking: updatedBooking });
}
