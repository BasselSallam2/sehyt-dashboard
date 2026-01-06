import { Router } from "express";
import { authController } from "./auth.controller";


const router = Router();

router.route("/signin").post(authController.signinUsers);
router.route("/signup").post(authController.signupUsers);
router.route("/guest").post(authController.guestLogin);

export { router as authRouter };
