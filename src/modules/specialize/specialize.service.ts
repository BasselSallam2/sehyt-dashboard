import GenericService from "@shared/generic.service";
import type { ISPECIALIZE } from "./specialize.interface";
import { specializeModel } from "./specialize.schema";

export class SpecializeService extends GenericService<ISPECIALIZE> {
	constructor() {
		super(specializeModel);
	}
}

export default new SpecializeService();
