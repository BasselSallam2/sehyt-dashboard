import { Router } from "express";
import scheduleController from "./schedule.controller";
import { protect } from "@middleware/auth.middleware";
import { getMySchedule } from "./schedule.middleware";


const router = Router();


router.route("/")
.get(protect , getMySchedule, scheduleController.getAll)

router.route("/:id")
.put(protect, scheduleController.updateSchedule)
.delete(protect, scheduleController.deleteOne)



export { router as scheduleRouter };
