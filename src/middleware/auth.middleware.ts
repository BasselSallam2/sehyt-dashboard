import type { tokenDecode } from "@modules/Users/Auth/auth.interface";
import { ErrorRes } from "@shared/responces/errors.responces";
import { getEnv } from "@utils/envHelper";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Types } from "mongoose";
import { devLogger } from "@utils/devLogger";
import asyncHandler from "express-async-handler";
import { usersModel } from "@modules/Users/users.schema";
import type { IUSERS } from "@modules/Users/users.interface";
import { employeeModel } from "@modules/employee/employee.schema";
import type { IEMPLOYEE } from "@modules/employee/employee.interface";


const getToken = (req: Request) => {
	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
		return req.headers.authorization.split(" ")[1];
	} else {
		ErrorRes.tokenNotFound();
	}
};

const verifyToken = (token: string) => {
	try {
		return jwt.verify(token, getEnv("JWT_SECRET_KEY"));
	} catch (error) {
		devLogger(error);
		ErrorRes.invalidToken();
	}
};

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	const token = getToken(req);
	const decoded = verifyToken(token) as tokenDecode;
	let user = null ;
	if(decoded.type === 'user') {
		 user = (await usersModel.findById(decoded.id)) as IUSERS;
	}else if (decoded.type === 'doctor' || decoded.type === 'admin') {
		user = (await employeeModel.findById(decoded.id)) as IEMPLOYEE;
	}
	if (!user) next(ErrorRes.userNotFound());
	if (user.deleted) next(ErrorRes.userDeleted());
	req.user = { id: user._id as Types.ObjectId, type: decoded.type , country : user.country, city : user.city };
	if(decoded.specialize) req.user.specialize = decoded.specialize;
	next();
});


