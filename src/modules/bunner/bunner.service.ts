import GenericService from "@shared/generic.service";
import type { IBUNNER } from "./bunner.interface";
import { bunnerModel } from "./bunner.schema";

export class BunnerService extends GenericService<IBUNNER> {
	constructor() {
		super(bunnerModel);
	}
}

export default new BunnerService();
