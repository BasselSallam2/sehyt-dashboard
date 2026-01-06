import GenericController from "@shared/generic.controller";
import slotService from "./slot.service";
import { type SLOTdto, SLOTdtokeys, type ISLOT } from "./slot.interface";
import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { dtoHandler } from "@utils/dtoHandler";
import { SucessRes } from "@shared/responces/success.responces";

class slotController extends GenericController<ISLOT> {
	constructor() {
		super(slotService);
	}

	createSlots = asyncHandler(async (req: Request, res: Response) => {
		const input = dtoHandler<SLOTdto>(req.body, SLOTdtokeys);
		 await slotService.createSlots(input);
		 SucessRes.success(res, "Slots created successfully", 201);
	});


}

export default new slotController();
