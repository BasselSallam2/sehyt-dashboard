import { bunnerRouter } from "@modules/bunner/bunner.routes";
import { countryRouter } from "@modules/country/country.routes";
import { employeeRouter } from "@modules/employee/employee.routes";
import { scheduleRouter } from "@modules/schedule/schedule.routes";
import { slotRouter } from "@modules/slot/slot.routes";
import { specializeRouter } from "@modules/specialize/specialize.routes";
import { statisticsRouter } from "@modules/statistics/statistics.routes";
import { uploadRouter } from "@modules/upload/upload.routes";
import { usersRouter } from "@modules/Users/users.routes";
import { Router } from "express";

const router = Router();

router.use('/user' , usersRouter);
router.use('/employee' , employeeRouter);
router.use('/bunner' , bunnerRouter);
router.use('/specialize' , specializeRouter);
router.use('/slot', slotRouter);
router.use('/country', countryRouter);
router.use('/upload' , uploadRouter);
router.use('/statistics' , statisticsRouter);
router.use('/schedule' , scheduleRouter);

router.get("/health", (req, res) => {
	res.status(200).json({ status: "OK" });
});

export default router;
