import type { Document} from "mongoose";

export interface ICOUNTRY extends Document {
	country: string;
    cities: string[];
    deleted: boolean
}
