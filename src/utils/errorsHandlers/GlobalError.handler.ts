import type { NextFunction, Request , Response } from "express"
import { ApiError } from "./ApiError.handler";
import { devLogger } from "@utils/devLogger";
import { logger } from "@config/logger.config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const globalErrorHandler = (err:any , req:Request , res:Response , _next:NextFunction) => {
    devLogger(err);
    
    //APIErros
    if(err instanceof ApiError){
        const errorObject = {
            success: false,
            status: "fail",
            message: err.message,
            ...err.data
        }
        return res.status(err.status).json(errorObject);
    }

    if(err.code === 11000){
        const keyValue = Object.keys(err.keyValue)[0];
        const errorObject = {
            success: false,
            status: "fail",
            message: `${keyValue} "${err.keyValue[keyValue]}" already exists`
        }
        return res.status(409).json(errorObject);

    }

    if(err.type === "entity.parse.failed"){
        const errorObject = {
            success: false,
            status: "fail",
            message: "Invalid input json data",
            action: "Please provide valid json data"
        }
        return res.status(400).json(errorObject);
    }




    //unexpected error
    const errorObject = {
        success: false,
        status: "fail",
        message: "Something went wrong"
    }
    logger.error(err);
    return res.status(500).json(errorObject);
}