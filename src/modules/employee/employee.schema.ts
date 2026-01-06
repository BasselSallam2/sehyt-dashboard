import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { IEMPLOYEE } from "./employee.interface";
import { hashPasswordPlugin } from "@modules/Users/Auth/mongoose_plugins/auth.plugin";


export const employeeSchema = new Schema<IEMPLOYEE>(
	{
		type: { type: String, required: true },
		name: { type: String, required: true },
		phone: { type: String, required: true },
		password: { type: String, required: true },
		avatar: { fileId: String, url: String },
		description: { type: String },
		certificates: { title: String, description: String },
		specialize: { type: Schema.Types.ObjectId, ref: "Specialize" },
		city: { type: String},
		country: { type: String},
		address: { type: String },
		location: { type: String },
		contacts: { type: [String] },
		deleted: { type: Boolean, default: false },
	},
	{
		timestamps: true,
		toJSON: {
			transform(doc, ret) {
				delete ret.__v;
				delete ret.password;
			},
		},
	}
);

employeeSchema.index({ name: "text" });

employeeSchema.plugin(hashPasswordPlugin);

const employeeModel = (models.Employee || model<IEMPLOYEE>("Employee", employeeSchema)) as Model<IEMPLOYEE>;

export { employeeModel };
