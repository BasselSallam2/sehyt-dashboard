import dotenv from "dotenv";
dotenv.config();

export const getEnv = (key: string, defaultValue?: string): string => {
	if (!process.env[key] && !defaultValue) {
		throw new Error(`Environment variable ${key} is not defined`);
	}
	return process.env[key] || defaultValue;
};
