import { Router } from "express";
import usersController from "./users.controller";
import { protect } from "@middleware/auth.middleware";
import { authRouter } from "./Auth/auth.route";

const router = Router();


router.route("/")
.get(usersController.getAll)



router.route("/:id")
.put(protect, usersController.updateOne)
.delete(protect, usersController.deleteOne)
.get(protect, usersController.getOne)

router.use('/auth' , authRouter);




export { router as usersRouter };
