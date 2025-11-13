import type { deleteModel, Document, Types } from "mongoose";

export interface IUSERS extends Document {
	name: string;
    phone: string;
    password: string;
    country: string;
    city: string;
    deleted: boolean;
}
