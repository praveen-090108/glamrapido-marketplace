import { Router } from "express";
import { getSalon, getStylist, listFeaturedData, listOffers, listSalons, listServices, listStylists, searchSalons } from "../controllers/salons.controller.js";

export const salonsRouter = Router();

salonsRouter.get("/featured", listFeaturedData);
salonsRouter.get("/services/all", listServices);
salonsRouter.get("/stylists/all", listStylists);
salonsRouter.get("/offers/all", listOffers);
salonsRouter.get("/search", searchSalons);
salonsRouter.get("/stylists/:slug", getStylist);
salonsRouter.get("/", listSalons);
salonsRouter.get("/:slug", getSalon);
