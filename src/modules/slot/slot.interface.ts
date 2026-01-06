import type { ISCHEDULE } from "@modules/schedule/schedule.interface";
import type { Document, Types } from "mongoose";

export interface ISLOT extends Document {
	doctor: Types.ObjectId;
    from: string;
    to: string;
    date: Date;
    reserved: boolean;
    patient: Types.ObjectId;
    bunner: Types.ObjectId;
    schedule: Types.ObjectId;
    deleted: boolean;
}


export interface SLOTdto {
    doctor: Types.ObjectId;
    fromTime: string;
    toTime: string;
    fromDate: Date;
    toDate: Date;
    intervalHours: number;
    days: number[];
    _id?: Types.ObjectId;
}

export const SLOTdtokeys = {
    required: ["doctor", "fromTime", "toTime", "fromDate", "toDate", "intervalHours", "days"],
    optional: ["_id"],
};
