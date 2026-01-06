import { authService } from "./auth.service";
import { SucessRes } from "@shared/responces/success.responces";
import type { Response, Request } from "express";
import asyncHandler from "express-async-handler";
import {
	type SigninDTO,
	SigninDTOKeys,
} from "./auth.interface";
import { dtoHandler } from "@utils/dtoHandler";

class AuthController {
	private authService: typeof authService;
	constructor() {
		this.authService = authService;
	}

	signinEmployees = asyncHandler(async (req: Request, res: Response) => {
		const input = dtoHandler<SigninDTO>(req.body, SigninDTOKeys, { strict: true });
		const result = await this.authService.signinEmployees(input);
		SucessRes.success(res, "Signin successful", 200, result);
	});

	 getMe = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.user as any;
		const user = await this.authService.getMe(id);
		SucessRes.success(res, "Fetched successfully", 200, { data: user });
	});

}

export const authController = new AuthController();
