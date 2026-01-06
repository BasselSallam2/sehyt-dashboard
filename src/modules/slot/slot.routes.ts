import { Router } from "express";
import slotController from "./slot.controller";
import { protect, requireAuth } from "@middleware/auth.middleware";
import { GetAllMiddleWare, addDoctorToBody, addPatientIdFilter, addPatientToBody , addPatientParamFilter , getDoctorReservations } from "./slot.middleware";

const router = Router();

router.route("/")
.post(protect , addDoctorToBody , slotController.createSlots);

router.route('/doctor/myReservations')
.get(protect, getDoctorReservations, slotController.getAll)

router.route("/myReservations")
.get(requireAuth, addPatientIdFilter, slotController.getAll)

router.route("/:doctorId")
.get( GetAllMiddleWare ,slotController.getAll)

router.route('/user/:userId')
.get(requireAuth, addPatientParamFilter, slotController.getAll)

router.route('/resirve/:id')
.put(requireAuth, addPatientToBody, slotController.updateOne)

router.route('/unresirve/:id')
.put(requireAuth, slotController.updateOne)




export { router as slotRouter };
