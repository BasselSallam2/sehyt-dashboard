import GenericController from "@shared/generic.controller";
import countryService from "./country.service";
import type { ICOUNTRY } from "./country.interface";
import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { SucessRes } from "@shared/responces/success.responces";
class countryController extends GenericController<ICOUNTRY> {
	constructor() {
		super(countryService);
	}

	getUserCities = asyncHandler(async (req: Request, res: Response) => {
		const { country } = req.user as any;
		const result = await countryService.getUserCities(country);
		SucessRes.success(res, "Fetched successfully", 200, { data: result });
	});
}

export default new countryController();
