import GenericService from "@shared/generic.service";
import type { IEMPLOYEE } from "./employee.interface";
import { employeeModel } from "./employee.schema";
import { Types } from "mongoose";

export class EmployeeService extends GenericService<IEMPLOYEE> {
	constructor() {
		super(employeeModel);
	}

	async autoComplete(
	search: string,
	country: string,
	city: string,
	specialize?: string,
	populate?: string
) {
	const matchFilter: any = { name: { $regex: search, $options: "i" }, country };
	if (specialize) matchFilter["specialize"] = new Types.ObjectId(specialize);

	const pipeline: any[] = [
		{ $match: matchFilter },
		{
			$addFields: {
				sortPriority: { $cond: [{ $eq: ["$city", city] }, 0, 1] },
			},
		},
		{ $sort: { sortPriority: 1 } },
	];

	if (populate) {
		try {
			const populateData = JSON.parse(populate); 

			const populates = Array.isArray(populateData) ? populateData : [populateData];

			for (const pop of populates) {
				pipeline.push({
					$lookup: {
						from:  `${pop.path}s`, 
						localField: pop.path,
						foreignField: "_id",
						as: pop.path,
					},
				});

				pipeline.push({
					$unwind: {
						path: `$${pop.path}`,
						preserveNullAndEmptyArrays: true,
					},
				});

				if (pop.select) {
					const projection = pop.select
						.split(" ")
						.reduce((acc: any, field: string) => {
							acc[`${pop.path}.${field}`] = 1;
							return acc;
						}, {});
					pipeline.push({ $project: projection });
				}
			}
		} catch (err) {
			console.error("Invalid populate JSON", err);
		}
	}
	return await employeeModel.aggregate(pipeline);
}
}

export default new EmployeeService();
