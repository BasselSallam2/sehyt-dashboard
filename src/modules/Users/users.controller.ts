import GenericController from "@shared/generic.controller";
import usersService from "./users.service";
import type { IUSERS } from "./users.interface";

class usersController extends GenericController<IUSERS> {
	constructor() {
		super(usersService);
	}
}

export default new usersController();
