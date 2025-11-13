import { type ValidationChain } from "express-validator";

export class CommonValidator {
	static text(chain: ValidationChain, minLength: number = 3, maxLength?: number): ValidationChain {
		const message = maxLength
			? `field must be between ${minLength} and ${maxLength} characters long`
			: `field must be at least ${minLength} characters long`;

		const lenghtOptions = { min: minLength, max: maxLength };

		return chain 
			.trim()
			.escape()
			.isString()
			.withMessage(`field must be a string`)
			.isLength(lenghtOptions)
			.withMessage(message);

		
	}

	static number(chain: ValidationChain, minimum: number, maximum?: number): ValidationChain {
		const lenghtOptions = { min: minimum, max: maximum };
		const message = maximum
			? `field must be between ${minimum} and ${maximum} digits long`
			: `field must be at least ${minimum} digits long`;

		return chain.isNumeric().isFloat(lenghtOptions).withMessage(message);

	}
}



