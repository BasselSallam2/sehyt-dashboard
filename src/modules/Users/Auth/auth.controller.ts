import { authService } from "./auth.service";
import { SucessRes } from "@shared/responces/success.responces";
import type { Response, Request } from "express";
import asyncHandler from "express-async-handler";
import {
	type IAuthdto,
	signupDTOKeys,
	type SigninDTO,
	SigninDTOKeys,
} from "./auth.interface";
import { dtoHandler } from "@utils/dtoHandler";

class AuthController {
	private authService: typeof authService;
	constructor() {
		this.authService = authService;
	}

	signinUsers = asyncHandler(async (req: Request, res: Response) => {
		const input = dtoHandler<SigninDTO>(req.body, SigninDTOKeys, { strict: true });
		const result = await this.authService.signinUsers(input);
		SucessRes.success(res, "Signin successful", 200, result);
	});

	signupUsers = asyncHandler(async (req: Request, res: Response) => {
		const input = dtoHandler<IAuthdto>(req.body, signupDTOKeys, { strict: true });
		const result = await this.authService.signupUsers(input);
		SucessRes.success(res, "Signup successful", 201, result);
	});

	guestLogin = asyncHandler(async (req: Request, res: Response) => {
		const result = await this.authService.guestLogin();
		SucessRes.success(res, "Guest login successful", 200, result);
	});
}

export const authController = new AuthController();
