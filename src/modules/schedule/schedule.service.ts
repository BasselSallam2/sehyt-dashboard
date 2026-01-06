import GenericService from "@shared/generic.service";
import type { ISCHEDULE } from "./schedule.interface";
import { scheduleModel } from "./schedule.schema";
import { ErrorRes } from "@shared/responces/errors.responces";
import { slotModel } from "@modules/slot/slot.schema";
import slotService from "@modules/slot/slot.service";
import type { SLOTdto } from "@modules/slot/slot.interface";

export class ScheduleService extends GenericService<ISCHEDULE> {
	constructor() {
		super(scheduleModel);
	}

	async updateSchedule(id: string, data: any) {
		const document = await scheduleModel.findById(id).exec();
		if (!document) ErrorRes.documentNotFound();
		await slotModel.deleteMany({ schedule: id, reserved: false });
		const newSchedule = (await scheduleModel
			.findByIdAndUpdate(id, data, { new: true })
			.exec()) as SLOTdto;
		await slotService.createSlots(newSchedule);
		return newSchedule;
	}

	override async deleteOne(id: string) {
		const document = await scheduleModel.findById(id).exec();
		if (!document) ErrorRes.documentNotFound();
		await slotModel.deleteMany({ schedule: id, reserved: false });
		return await scheduleModel.findByIdAndDelete(id).exec();
	}
}

export default new ScheduleService();
