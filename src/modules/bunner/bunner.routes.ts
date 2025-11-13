import { Router } from "express";
import bunnerController from "./bunner.controller";
import { protect } from "@middleware/auth.middleware";
import { addActorIdToBody, bunnerSorter , getDoctorsOnly } from "./bunner.middleware";

const router = Router();


router.route("/")
.get(protect , bunnerSorter, getDoctorsOnly , bunnerController.getAll)
.post(protect, addActorIdToBody ,bunnerController.createOne);

router.route("/:id")
.put(protect, bunnerController.updateOne)
.delete(protect, bunnerController.deleteOne)
.get(protect, bunnerController.getOne);



export { router as bunnerRouter };
