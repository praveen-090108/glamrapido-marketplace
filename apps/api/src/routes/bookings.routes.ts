import { Router } from "express";
import { cancelBooking, createBooking, listMyBookings } from "../controllers/bookings.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const bookingsRouter = Router();

bookingsRouter.get("/", requireAuth, listMyBookings);
bookingsRouter.post("/", requireAuth, createBooking);
bookingsRouter.patch("/:id/cancel", requireAuth, cancelBooking);
