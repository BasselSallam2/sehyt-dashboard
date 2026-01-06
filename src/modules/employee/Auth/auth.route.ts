import { Router } from "express";
import { authController } from "./auth.controller";
import { protect } from "@middleware/auth.middleware";


const router = Router();

router.route("/signin").post(authController.signinEmployees);
router.route('/me').get(protect, authController.getMe);


export { router as authRouter };
