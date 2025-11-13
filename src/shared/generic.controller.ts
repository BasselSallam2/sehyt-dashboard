import type GenericService from "./generic.service";
import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";
import { SucessRes } from "./responces/success.responces";
import { Types } from "mongoose";
import { ErrorRes } from "./responces/errors.responces";
import { devLogger } from "@utils/devLogger";


class GenericController<T> {
	protected service: GenericService<T>;
	constructor(service: GenericService<T>) {
		this.service = service;
	}

	createOne = asyncHandler(async (req: Request, res: Response) => {
		const data = req.body as Partial<T>;
		await this.service.createOne(data);
		SucessRes.success(res, "Created successfully", 201);
	});

	deleteOne = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		if (!id || !Types.ObjectId.isValid(id)) return ErrorRes.documentNotFound();
		 await this.service.deleteOne(id);
		SucessRes.success(res, "Deleted successfully", 200);
	});

	updateOne = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		if (!id || !Types.ObjectId.isValid(id)) return ErrorRes.documentNotFound();
		const data = req.body as Partial<T>;
		await this.service.updateOne(id, data);
		SucessRes.success(res, "Updated successfully", 200);
	});

	getOne = asyncHandler(async (req: Request, res: Response) => {
		const { id } = req.params;
		if (!id || !Types.ObjectId.isValid(id)) return ErrorRes.documentNotFound();
		const result = await this.service.getOne(id , req.query);
		SucessRes.success(res, "Fetched successfully", 200, {data: result});
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const result = await this.service.getAll(req.query);
		SucessRes.success(res, "Fetched successfully", 200, {
			data: result.data,
			pagination: result.paginationResult,
		});
	});
}

export default GenericController;
