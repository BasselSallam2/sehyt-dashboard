import { ApiError } from "@utils/errorsHandlers/ApiError.handler";

export class ErrorRes {
	constructor() {}

	static userNotFound() {
		throw new ApiError("Auth Error: User not found", 404);
	}

	static invalidPassword() {
		throw new ApiError("Auth Error: Invalid Email or Password", 401);
	}

	static documentNotFound() {
		throw new ApiError("Document not found", 404);
	}

	static userAlreadyExists() {
		throw new ApiError("User already exists", 409);
	}

	static error(message: string, statusCode: number = 500) {
		throw new ApiError(message, statusCode);
	}

	static invalidURL(url: string) {
		throw new ApiError(`Invalid URL: ${url}`, 404);
	}

	static tokenNotFound() {
		throw new ApiError(`Token not found`, 404);
	}
	static invalidToken() {
		throw new ApiError(`Invalid Token`, 401);
	}

	static userNotActive() {
		throw new ApiError(`User not active`, 401);
	}

	static userDeleted() {
		throw new ApiError(`User deleted`, 401);
	}

	static invalidOTP() {
		throw new ApiError(`Invalid OTP`, 401);
	}

	static otpExpired() {
		throw new ApiError(`OTP expired`, 401);
	}

	static roleNotFound(role: string) {
		throw new ApiError(`Role ${role} not found`, 404);
	}
	
	static countryNotFound() {
		throw new ApiError(`Country not found`, 404);
	}
}
