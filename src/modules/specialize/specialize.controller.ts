import GenericController from "@shared/generic.controller";
import specializeService from "./specialize.service";
import type { ISPECIALIZE } from "./specialize.interface";

class specializeController extends GenericController<ISPECIALIZE> {
	constructor() {
		super(specializeService);
	}
}

export default new specializeController();
