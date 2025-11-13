import { Router } from "express";
import specializeController from "./specialize.controller";
import { protect } from "@middleware/auth.middleware";

const router = Router();


router.route("/")
.get(specializeController.getAll)
.post(specializeController.createOne);

router.route("/:id")
.put(protect, specializeController.updateOne)
.delete(protect, specializeController.deleteOne)
.get(protect, specializeController.getOne);


export { router as specializeRouter };
