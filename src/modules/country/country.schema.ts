import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { ICOUNTRY } from "./country.interface";


export const countrySchema = new Schema<ICOUNTRY>(
	{
		country: { type: String, required: true },
		cities: { type: [String], required: true },
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

const countryModel = (models.Country || model<ICOUNTRY>("Country", countrySchema)) as Model<ICOUNTRY>;

export { countryModel };
