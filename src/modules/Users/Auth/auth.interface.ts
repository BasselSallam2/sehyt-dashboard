
import type {Types } from "mongoose";


export interface IAuthdto {
	password: string;
	phone: string;
	name: string;
	country: string;
	city: string;
}

export const signupDTOKeys = {
	required: ["password", "phone", "name", "country", "city"],
	optional: [],
};


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
	specialize?: Types.ObjectId;
	type: string;
	isGuest?: boolean;
}
