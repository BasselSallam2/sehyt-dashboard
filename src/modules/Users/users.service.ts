import GenericService from "@shared/generic.service";
import type { IUSERS } from "./users.interface";
import { usersModel } from "./users.schema";

export class UsersService extends GenericService<IUSERS> {
	constructor() {
		super(usersModel);
	}
}

export default new UsersService();
