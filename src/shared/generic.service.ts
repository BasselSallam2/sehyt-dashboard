import type { Model } from "mongoose";
import { ErrorRes } from "./responces/errors.responces";
import { apiFeature } from "@utils/apiFeature";

type getOneOptions = {
	fields?: string;
	populate?: string;
};

class GenericService<T> {
	private mongooseModel: Model<T>;
	constructor(mongooseModel: Model<T>) {
		this.mongooseModel = mongooseModel;
	}

	createOne(data: Partial<T>): Promise<T> {
		return this.mongooseModel.create(data);
	}

	async deleteOne(id: string): Promise<T> {
		const document = (await this.mongooseModel.findById(id)) as any;
		if (!document) ErrorRes.documentNotFound();

		if (document.deleted)
			return this.mongooseModel.findByIdAndUpdate(id, { $set: { deleted: true } });
		return this.mongooseModel.findByIdAndDelete(id);
	}

	async updateOne(id: string, data: Partial<T>): Promise<T> {
		const document = await this.mongooseModel.findById(id).exec();
		if (!document) ErrorRes.documentNotFound();
		return await this.mongooseModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async getOne(id: string, getOneOptions?: getOneOptions) {
		const document = await this.mongooseModel.findById(id);
		if (!document) ErrorRes.documentNotFound();
		let query = this.mongooseModel.findById(id);

		if (getOneOptions?.fields) {
			query = query.select(getOneOptions.fields);
		}

		if (getOneOptions?.populate) {
			query = query.populate(getOneOptions.populate);
		}

		return query.lean().exec();
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async getAll(querystring?: Record<string, any>) {
		const schema = this.mongooseModel.schema;
		const filter = {};
		if (schema.paths.deleted) filter["deleted"] = false;

		const mongoQuery = this.mongooseModel.find(filter);

		const { paginationResult, MongooseQuery } = await new apiFeature(mongoQuery, querystring)
			.populate()
			.sort()
			.search(["email", "name"])
			.filter()
			.select()
			.paginate();

		const data = await MongooseQuery.exec();
		return { paginationResult, data };
	}
}

export default GenericService;
