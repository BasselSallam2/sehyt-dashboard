import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { ISCHEDULE } from "./schedule.interface";


export const scheduleSchema = new Schema<ISCHEDULE>(
	{
		fromDate: { type: Date, required: true },
		toDate: { type: Date, required: true },
		fromTime: { type: String, required: true },
		toTime: { type: String, required: true },
		intervalHours: { type: Number, required: true },
		days: { type: [Number], required: true },
		doctor: { type: Schema.Types.ObjectId, ref: "Employee" },
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

const scheduleModel = (models.Schedule || model<ISCHEDULE>("Schedule", scheduleSchema)) as Model<ISCHEDULE>;

export { scheduleModel };
