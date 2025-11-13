import type { Document, Types} from "mongoose";

export interface IEMPLOYEE extends Document {
	type: 'admin' | 'doctor';
    name: string;
    phone: string;
    password: string;
    avatar: {fileId:string , url:string};
    description: string;
    certificates: {title:string , description:string}[];
    specialize?: Types.ObjectId;
    city: string;
    country: string;
    address: string;
    location:string;
    contacts: string[];
    deleted: boolean
}
