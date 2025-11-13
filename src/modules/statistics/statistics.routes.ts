import { protect } from "@middleware/auth.middleware";
import { statisticsController , myReservations } from "./statistics.controller";
import { Router } from "express";

const router = Router();

router.route("/").get(statisticsController);
router.route("/myReservations").
get(protect ,myReservations);

export { router as statisticsRouter };