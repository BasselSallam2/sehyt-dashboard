import { ApiError } from "@utils/errorsHandlers/ApiError.handler";
import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

type Error = {
	type: string;
	msg: string;
	path: string;
	location: string;
};

function validateResult(req: Request, res: Response, next: NextFunction): Response | void {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const extractedErrors: Error[] = errors.array() as Error[];
		if (extractedErrors.length > 0) {
			return next(
				new ApiError("Validation Error", 400, {
					field: extractedErrors[0]?.path,
					value: extractedErrors[0]?.msg,
				})
			);
		}
	}
	next();
}

export { validateResult };
