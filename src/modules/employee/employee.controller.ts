import GenericController from "@shared/generic.controller";
import employeeService from "./employee.service";
import type { IEMPLOYEE } from "./employee.interface";
import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { SucessRes } from "@shared/responces/success.responces";

class employeeController extends GenericController<IEMPLOYEE> {
	constructor() {
		super(employeeService);
	}

	autoComplete = asyncHandler(async (req: Request, res: Response) => {
		const { search, specialize, populate } = req.query;

		// Handle both authenticated users and guests
		let country, city;
		if (req.user) {
			country = (req.user as any).country;
			city = (req.user as any).city;
		}

		const result = await employeeService.autoComplete(
			search as string,
			country,
			city,
			specialize as string,
			populate as string
		);
		SucessRes.success(res, "Fetched successfully", 200, { data: result });
	});
}

export default new employeeController();
