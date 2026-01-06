import winston from "winston";
import path from "path";

const { combine, timestamp, json, splat } = winston.format;

const LogDIR = path.join(process.cwd(), "logs");

const IgnoreErrors = winston.format((info) => {
	if (info.level === "error") {
		return false;
	}
	return info;
});

export const logger = winston.createLogger({
	level: "info",
	format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), splat(), json()),
	transports: [
		new winston.transports.File({ filename: "error.log", level: "error", dirname: LogDIR }),
		new winston.transports.File({
			filename: "combined.log",
			level: "info",
			dirname: LogDIR,
			format: combine(IgnoreErrors(), json()),
		}),
	],
});

export const morganStream = {
	write: (message: string) => {
		logger.info(message.trim());
	},
};
