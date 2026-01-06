import type { Model, Types } from "mongoose";
import { ErrorRes } from "@shared/responces/errors.responces";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getEnv } from "@utils/envHelper";
import type { SigninDTO } from "./auth.interface";
import type { IEMPLOYEE } from "../employee.interface";
import { employeeModel } from "../employee.schema";


class AuthService {
	private authModel: Model<IEMPLOYEE>;
	constructor() {
		this.authModel = employeeModel;
	}

	async signinEmployees(data: SigninDTO) {
		const { phone, password } = data;
		const user = await this.authModel.findOne({ phone });
		if (!user) {
			return ErrorRes.userNotFound();
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return ErrorRes.invalidPassword();
		}
		const payload = { id: user._id , type: user.type , specialize: user.specialize };
		const token = jwt.sign(payload, getEnv("JWT_SECRET_KEY"));
		return { token , type: user.type };
	}


	async getMe(id: Types.ObjectId){
		const user = await this.authModel.findById(id).populate('specialize');
		if(!user) return ErrorRes.userNotFound();
		return user;
	}

	

}

export const authService = new AuthService();
