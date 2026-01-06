import { employeeModel } from "@modules/employee/employee.schema";
import { slotModel } from "@modules/slot/slot.schema";
import { specializeModel } from "@modules/specialize/specialize.schema";
import { usersModel } from "@modules/Users/users.schema";
import type { Types } from "mongoose";

export const getStatistics = () => {
	const doctorsCount = employeeModel.countDocuments({ type: "doctor" });
	const reservationsCount = slotModel.countDocuments({ reserved: true });
	const specializesCount = specializeModel.countDocuments();
	const patientsCount = usersModel.countDocuments();

	return Promise.all([doctorsCount, reservationsCount, specializesCount, patientsCount]);
};

export const getMyReservations = (doctor: Types.ObjectId) => {
	const reservationsCount = slotModel.countDocuments({ reserved: true , doctor });
	return reservationsCount;
};
