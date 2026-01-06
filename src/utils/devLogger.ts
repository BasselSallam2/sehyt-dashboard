import { getEnv } from "./envHelper";

export const devLogger = (log: string | Error): void => {
	if (getEnv("NODE_ENV") === "DEVELOPMENT") {
		console.log(log);
	}
	return;
};
