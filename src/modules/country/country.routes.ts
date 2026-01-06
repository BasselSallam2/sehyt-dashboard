import { Router } from "express";
import countryController from "./country.controller";
import { protect } from "@middleware/auth.middleware";

const router = Router();


router.route("/")
.get(countryController.getAll)
.post(protect, countryController.createOne);

router.route("/:id")
.put(protect, countryController.updateOne)
.delete(protect, countryController.deleteOne)

router.route('/user/cities')
.get(protect, countryController.getUserCities)



export { router as countryRouter };
