import { employeeModel } from "@modules/employee/employee.schema";
import type { Request, Response, NextFunction } from "express";

export const addActorIdToBody = async (req: Request, res: Response, next: NextFunction) => {
	const { id } = req.user;
	const doctor = await employeeModel.findById(id);
	req.body.doctor = id;
	req.body.specialize = doctor.specialize;
	req.body.city = doctor.city;
	req.body.country = doctor.country;
	next();
};

export const bunnerSorter = async (req: Request, res: Response, next: NextFunction) => {
	const { city, country , type } = req.user as any;
	if(type === "admin") return next();
	if (city && country) ((req.query.country = country), (req.query.sort = "city createdAt"));
	next();
};

export const getDoctorsOnly = (req: Request, res: Response, next: NextFunction) => {
	const {type , id} = req.user as any;
	if(type === "doctor") req.query.doctor = id
	next();
};
