import asyncHandler from "express-async-handler";
import type { Response } from "express";
import uploadService from "./upload.service";

class uploadController {
	upload = asyncHandler(async (req: any, res: Response) => {
		const file = req.file;
		const result = await uploadService.uploadToCloudnairy(file);
		res.status(200).json({ result });
	});
}

export default new uploadController();
