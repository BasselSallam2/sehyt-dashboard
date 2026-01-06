import type { Response } from "express";
export class SucessRes {
	constructor() {}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static success(res: Response, message: string, statusCode: number = 200, data?: any) {
		return res.status(statusCode).json({ success: true, status: "success", message, ...data });
	}
}
