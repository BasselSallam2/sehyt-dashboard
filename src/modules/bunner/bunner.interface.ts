import type { Document, Types } from "mongoose";

export interface IBUNNER extends Document {
	title: string;
    subtitle: string;
    description: string;
    image: { fileId: string; url: string };
    percentage: number;
    doctor: Types.ObjectId;
    specialize: Types.ObjectId;
    country: Types.ObjectId;
    city: Types.ObjectId;
    deleted: boolean
}
