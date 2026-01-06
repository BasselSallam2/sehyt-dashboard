import type { Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { IUSERS } from "./users.interface";
import { hashPasswordPlugin } from "./Auth/mongoose_plugins/auth.plugin";


export const usersSchema = new Schema<IUSERS>(
	{
		name: { type: String, required: true },
		phone: { type: String, required: true },
		password: { type: String, required: true },
		country: { type: String, required: true },
		city: { type: String, required: true },
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

usersSchema.plugin(hashPasswordPlugin);

const usersModel = (models.Users || model<IUSERS>("Users", usersSchema)) as Model<IUSERS>;

export { usersModel };
