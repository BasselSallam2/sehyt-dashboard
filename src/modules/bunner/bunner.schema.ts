import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { IBUNNER } from "./bunner.interface";


export const bunnerSchema = new Schema<IBUNNER>(
	{
		title: { type: String, required: true },
		subtitle: { type: String, required: true },
		description: { type: String, required: true },
		image: { fileId: String, url: String },
		percentage: { type: Number},
		doctor: { type: Schema.Types.ObjectId, ref: "Employee" },
		specialize: { type: Schema.Types.ObjectId, ref: "Specialize" },
		country: { type: String, required: true },
		city: { type: String, required: true },
		deleted: { type: Boolean, default: false },
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

const bunnerModel = (models.Bunner || model<IBUNNER>("Bunner", bunnerSchema)) as Model<IBUNNER>;

export { bunnerModel };
