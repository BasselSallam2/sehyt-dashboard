import { Router } from "express";
import uploadController from "./upload.controller";
import {upload} from "@config/multer.config"
import { protect } from "@middleware/auth.middleware";

const router = Router();

router.route("/")
.post(protect , upload.single("file"), uploadController.upload);



export { router as uploadRouter };
