import type { Express } from "express";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongooseSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import morgan from "morgan";

import appRoutes from "@utils/appRoutes";
import { morganStream } from "@config/logger.config";
import path from "path";
import { frontendRoutes } from "./frontendRoutes";

const root = process.cwd();

const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: "Too many requests from this IP, please try again after 15 minutes",
});

const speedLimiter = slowDown({
	windowMs: 60 * 1000,
	delayAfter: 50,
	delayMs: () => 500,
});

export const appUse = (app: Express): void => {
	app.use(express.json({ limit: "10Kb" }));
	app.use(express.urlencoded({ extended: true, limit: "10Kb" }));
	app.use('/assets', express.static(path.join(root, 'public/assets')));
	app.use(frontendRoutes);
	app.use(compression());
	app.use(helmet());
	app.use(cors());
	app.use(rateLimiter);
	app.use(speedLimiter);
	app.use(mongooseSanitize());
	app.use(morgan('combined' , {stream: morganStream}));
	app.use("/api", appRoutes);


};
