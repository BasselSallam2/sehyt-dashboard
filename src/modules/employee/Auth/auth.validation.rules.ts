import { CommonValidator } from "@shared/generic.validator";
import { check,type  ValidationChain } from "express-validator";
export class AuthValidationRules extends CommonValidator {
    static password(chain: ValidationChain): ValidationChain {
        return chain.trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long");
    }

	static email(chain: ValidationChain): ValidationChain {
		return chain.trim().normalizeEmail().isEmail().withMessage("Must be a valid email");
	}

	static confirmPassword(confirmField: string, passwordField: string): ValidationChain {
		const chain = check(confirmField).custom((value: string, { req }) => {
			if (value !== req.body[passwordField]) {
				throw new Error("Password confirmation does not match password");
			}
			return true;
		});

		return chain;
	}

	static isExict(chain: ValidationChain): ValidationChain {
		return chain.not().isEmpty().withMessage("field is required");
	}
}