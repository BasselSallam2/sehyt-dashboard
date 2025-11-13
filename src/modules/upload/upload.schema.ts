import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { IUPLOAD } from "./upload.interface";


export const uploadSchema = new Schema<IUPLOAD>(
	{
		
	},
	{
		timestamps: true,
		toJSON: {
			transform(doc, ret) {
				delete ret.__v;
			},
		},
	}
);

const uploadModel = (models.Upload || model<IUPLOAD>("Upload", uploadSchema)) as Model<IUPLOAD>;

export { uploadModel };
