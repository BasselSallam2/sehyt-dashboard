import type { IAuth } from "@modules/Auth/auth.interface";
import type { IUser } from "@modules/Users/users.interface";
import bcrypt from "bcryptjs";
import type { NextFunction } from "express";
import type { Schema, HydratedDocument } from "mongoose";

export function hashPasswordPlugin(schema: Schema) {
	schema.pre("save", async function (this: HydratedDocument<IAuth>, next: NextFunction) {
		try {
			if ((this.isNew || this.isModified("password")) && this.password) {
				this.password = await bcrypt.hash(this.password, 12);
			}

			next();
		} catch (error) {
			next(error);
		}
	});
}

export function hashOTPPlugin(schema: Schema) {
	schema.pre("save", async function (this: HydratedDocument<IUser>, next: NextFunction) {
		try {
			if ((this.isNew || this.isModified("otp")) && this.otp) {
				this.otp = await bcrypt.hash(this.otp, 12);
			}

			next();
		} catch (error) {
			next(error);
		}
	});
}
