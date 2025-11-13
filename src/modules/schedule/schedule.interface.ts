import type { Document, Types } from "mongoose";

export interface ISCHEDULE extends Document {
	fromDate: Date;
    toDate: Date;
    fromTime: string;
    toTime: string;
    intervalHours: number;
    days: number[];
    doctor: Types.ObjectId
}
