import { Router } from "express";
import slotController from "./slot.controller";
import { protect } from "@middleware/auth.middleware";
import { GetAllMiddleWare, addDoctorToBody, addPatientIdFilter, addPatientToBody , addPatientParamFilter , getDoctorReservations } from "./slot.middleware";

const router = Router();

router.route("/")
.post(protect , addDoctorToBody , slotController.createSlots);

router.route('/doctor/myReservations')
.get(protect, getDoctorReservations, slotController.getAll)

router.route("/myReservations")
.get(protect, addPatientIdFilter, slotController.getAll)

router.route("/:doctorId")
.get( GetAllMiddleWare ,slotController.getAll)

router.route('/user/:userId')
.get(protect, addPatientParamFilter, slotController.getAll)

router.route('/resirve/:id')
.put(protect, addPatientToBody, slotController.updateOne)

router.route('/unresirve/:id')
.put(protect, slotController.updateOne)




export { router as slotRouter };
