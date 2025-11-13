
import { ErrorRes } from "@shared/responces/errors.responces";
import { appUse } from "@utils/appUse";
import { globalErrorHandler } from "@utils/errorsHandlers/GlobalError.handler";
import express from "express";
import type { NextFunction, Request, Response } from "express";

const app = express();

appUse(app);

app.all("*", (req: Request, res: Response , next:NextFunction) => next(ErrorRes.invalidURL(req.originalUrl))); 



app.use(globalErrorHandler);

export default app;
