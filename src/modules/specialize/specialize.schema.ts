import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { ISPECIALIZE } from "./specialize.interface";


export const specializeSchema = new Schema<ISPECIALIZE>(
	{
		title: { type: String, required: true },
		image: { fileId: String, url: String },
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

const specializeModel = (models.Specialize || model<ISPECIALIZE>("Specialize", specializeSchema)) as Model<ISPECIALIZE>;

export { specializeModel };
