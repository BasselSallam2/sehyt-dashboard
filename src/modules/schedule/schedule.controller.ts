import GenericController from "@shared/generic.controller";
import scheduleService from "./schedule.service";
import type { ISCHEDULE } from "./schedule.interface";
import asyncHandler from "express-async-handler";
import { SucessRes } from "@shared/responces/success.responces";
import type { Request, Response } from "express";

class scheduleController extends GenericController<ISCHEDULE> {
	constructor() {
		super(scheduleService);
	}

	updateSchedule = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		const data = req.body as Partial<ISCHEDULE>;
		const result = await scheduleService.updateSchedule(id, data);
		SucessRes.success(res, "Updated successfully", 200, { data: result });
	})
}

export default new scheduleController();
