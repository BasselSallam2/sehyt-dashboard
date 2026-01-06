import streamifier from "streamifier";
import { cloudinary } from "@config/cloudinary.config";
import { ApiError } from "@utils/errorsHandlers/ApiError.handler";

import type { UploadApiResponse } from "cloudinary";

export class UploadService {
	constructor() {}

	async uploadToCloudnairy(file: any): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{ folder: "app_uploads" },
				(error, result) => {
					if (error) {
						console.error("Cloudinary upload error:", error);

						reject(new ApiError("Cloudinary upload error", 500));
					} else if (result) {
						resolve(result);
					} else {
						reject(new ApiError("Cloudinary upload failed", 500));
					}
				}
			);

			streamifier.createReadStream(file.buffer).pipe(uploadStream);
		});
	}
}

export default new UploadService();
