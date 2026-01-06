import type { IUSERS } from "@modules/Users/users.interface";
import bcrypt from "bcryptjs";
import type { NextFunction } from "express";
import type { Schema, HydratedDocument } from "mongoose";

export function hashPasswordPlugin(schema: Schema) {
	schema.pre("save", async function (this: HydratedDocument<IUSERS>, next: NextFunction) {
		try {
			if ((this.isNew || this.isModified("password")) && this.password) {
				this.password = await bcrypt.hash(this.password, 12);
			}

			next();
		} catch (error) {
			next(error);
		}
	});

	schema.pre("findOneAndUpdate", async function (this: any, next: NextFunction) {
		try {
			const update = this.getUpdate() as { password?: string; $set?: { password?: string } };

			let passwordToHash: string | undefined = undefined;

			if (update.password) {
				passwordToHash = update.password;
			} else if (update.$set && update.$set.password) {
				passwordToHash = update.$set.password;
			}

			if (passwordToHash) {
				const hashedPassword = await bcrypt.hash(passwordToHash, 12);

				if (update.password) {
					update.password = hashedPassword;
				} else if (update.$set && update.$set.password) {
					update.$set.password = hashedPassword;
				}
			}

			next();
		} catch (error) {
			next(error);
		}
	});
}
