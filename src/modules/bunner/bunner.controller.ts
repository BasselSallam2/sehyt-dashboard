import GenericController from "@shared/generic.controller";
import bunnerService from "./bunner.service";
import type { IBUNNER } from "./bunner.interface";

class bunnerController extends GenericController<IBUNNER> {
	constructor() {
		super(bunnerService);
	}
}

export default new bunnerController();
