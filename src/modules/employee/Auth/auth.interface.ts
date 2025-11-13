
import type {Types } from "mongoose";


export interface SigninDTO {
	phone: string;
	password: string;
}

export const SigninDTOKeys = {
	required: ["phone", "password"],
	optional: [],
};

export interface tokenDecode {
	id: Types.ObjectId;
	specialize: Types.ObjectId;
	type: string;
}
