import type { Document } from "mongoose";

export interface ISPECIALIZE extends Document {
	title: string;
    image: { fileId: string; url: string }
    deleted: boolean
}
