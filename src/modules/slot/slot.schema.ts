import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { ISLOT } from "./slot.interface";


export const slotSchema = new Schema<ISLOT>(
	{
		doctor: { type: Schema.Types.ObjectId, ref: "Employee" },
		from: { type: String, required: true },
		to: { type: String, required: true },
		date: { type: Date, required: true },
		reserved: { type: Boolean, default: false },
		patient: { type: Schema.Types.ObjectId, ref: "Users" },
		bunner: { type: Schema.Types.ObjectId, ref: "Bunner" },
		schedule: { type: Schema.Types.ObjectId, ref: "Schedule" },
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

const slotModel = (models.Slot || model<ISLOT>("Slot", slotSchema)) as Model<ISLOT>;

export { slotModel };
