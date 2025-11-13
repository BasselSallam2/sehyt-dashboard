import GenericService from "@shared/generic.service";
import type { ISLOT, SLOTdto } from "./slot.interface";
import { slotModel } from "./slot.schema";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { apiFeature } from "@utils/apiFeature";
import { scheduleModel } from "@modules/schedule/schedule.schema";
import type { ISCHEDULE } from "@modules/schedule/schedule.interface";
dayjs.extend(customParseFormat);

export class SlotService extends GenericService<ISLOT> {
	constructor() {
		super(slotModel);
	}



override async getAll(querystring?: Record<string, any>) {
		const schema = slotModel.schema;
		const filter = {};
		if (schema.paths.deleted) filter["deleted"] = false;

		const mongoQuery = slotModel.find(filter);

		const { paginationResult, MongooseQuery } = await new apiFeature(mongoQuery, querystring)
			.populate()
			.sort()
			.search(["email", "name"])
			.filter()
			.select()

		const data = await MongooseQuery.exec();
		return {paginationResult, data };
	}

createSlots = async (data: SLOTdto) => {
	const { fromDate, toDate, fromTime, toTime, intervalHours, days, doctor , _id} = data;
	let schedule = null ;
	if(!_id)  schedule = await scheduleModel.create({fromDate , toDate , fromTime , toTime , intervalHours , days , doctor});
	

	const slotsToCreate: any[] = [];

	const startRange = dayjs(fromDate);
	const endRange = dayjs(toDate);


	const workStartTime = dayjs(fromTime, "HH:mm");
	const workEndTime = dayjs(toTime, "HH:mm");

	const workingDays = new Set(days);

	let currentDay = startRange;

	while (currentDay.isBefore(endRange) || currentDay.isSame(endRange, "day")) {
		const dayOfWeek = currentDay.day();

		if (workingDays.has(dayOfWeek)) {
			let slotStartTime = currentDay
				.hour(workStartTime.hour())
				.minute(workStartTime.minute())
				.second(0)
				.millisecond(0);

			const dayEndTime = currentDay
				.hour(workEndTime.hour())
				.minute(workEndTime.minute())
				.second(0)
				.millisecond(0);

			while (slotStartTime.isBefore(dayEndTime)) {
				const slotEndTime = slotStartTime.add(intervalHours, "hour");
				if (slotEndTime.isAfter(dayEndTime)) break;

				slotsToCreate.push({
					doctor,
					from: slotStartTime.format("HH:mm"),
					to: slotEndTime.format("HH:mm"),
					date: slotStartTime.toDate(),
					schedule: _id || schedule._id
				});

				slotStartTime = slotEndTime;
			}
		}

		currentDay = currentDay.add(1, "day");
	}

	if (slotsToCreate.length > 0) {
		await slotModel.insertMany(slotsToCreate);
		return slotsToCreate;
	}

	return [];
};


}

export default new SlotService();
