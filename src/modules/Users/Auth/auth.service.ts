import type { Model } from "mongoose";
import crypto from "crypto";
import type { IUSERS } from "@modules/Users/users.interface";
import { ErrorRes } from "@shared/responces/errors.responces";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getEnv } from "@utils/envHelper";
import { usersModel } from "@modules/Users/users.schema";
import type {IAuthdto, SigninDTO } from "./auth.interface";
import { devLogger } from "@utils/devLogger";

class AuthService {
	private authModel: Model<IUSERS>;
	constructor() {
		this.authModel = usersModel;
	}

	async signinUsers(data: SigninDTO) {
		const { phone, password } = data;
		const user = await this.authModel.findOne({ phone });
		if (!user) {
			return ErrorRes.userNotFound();
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return ErrorRes.invalidPassword();
		}
		const payload = { id: user._id , type: 'user' , country : user.country, city : user.city };
		const token = jwt.sign(payload, getEnv("JWT_SECRET_KEY"));
		return { token };
	}

	async signupUsers(data: IAuthdto) {
		const { name, phone , country , city, password } = data;
		const isRegistred = await this.authModel.findOne({ phone });
		if (isRegistred) ErrorRes.userAlreadyExists();
		const newUser = await this.authModel.create({
			name,
			phone,
			country,
			city,
			password
		});
		const payload = { id: newUser._id , type: 'user' , country , city };
		const token = jwt.sign(payload, getEnv("JWT_SECRET_KEY"));
		return { token };
	}

}

export const authService = new AuthService();
