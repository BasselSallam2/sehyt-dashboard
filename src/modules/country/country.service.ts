import GenericService from "@shared/generic.service";
import type { ICOUNTRY } from "./country.interface";
import { countryModel } from "./country.schema";

export class CountryService extends GenericService<ICOUNTRY> {
	constructor() {
		super(countryModel);
	}

	async getUserCities(country: string) {
		const result = await countryModel.findOne({ country });
		return result;
	}
}

export default new CountryService();
