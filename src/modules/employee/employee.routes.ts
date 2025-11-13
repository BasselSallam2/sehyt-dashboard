import { Router } from "express";
import employeeController from "./employee.controller";
import { protect } from "@middleware/auth.middleware";
import { authRouter } from "./Auth/auth.route";
import { getDoctorsOnly , getAdminsOnly} from "./employee.middleware";

const router = Router();


router.route("/")
.get(protect ,getDoctorsOnly, employeeController.getAll)
.post(employeeController.createOne);

router.route("/admin")
.get(protect ,getAdminsOnly, employeeController.getAll)


router.route('/autocomplete')
.get(protect, employeeController.autoComplete)

router.route("/:id")
.put(protect, employeeController.updateOne)
.delete(protect, employeeController.deleteOne)
.get(protect, employeeController.getOne);

router.use('/auth', authRouter);




export { router as employeeRouter };
