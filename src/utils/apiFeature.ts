import { Types, type Query} from "mongoose";

type paginateOBJ = {
	count: number;
	page: number;
	limit: number;
	pages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	nextPage: number | null;
	prevPage: number | null;
	lastPage: number;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export class apiFeature {
	constructor(
		public MongooseQuery: Query<any, any>,
		private queryString: Record<string, any>
	) {
		this.queryString = queryString;
		this.MongooseQuery = MongooseQuery;
	}

	public paginationResult: paginateOBJ = {
		count: 0,
		page: 1,
		limit: 1,
		pages: 1,
		hasNextPage: false,
		hasPrevPage: false,
		nextPage: null,
		prevPage: null,
		lastPage: 0,
	};

	populate() {
		if (!this.queryString.populate) return this;
		try {
			const populateFilter = JSON.parse(this.queryString.populate);
			this.MongooseQuery = this.MongooseQuery.populate(populateFilter);
		} catch (err) {
			console.error("Invalid populate format:", this.queryString.populate);
		}
		return this;
	}

	/* eslint-disable @typescript-eslint/no-explicit-any */
	filter(reqFilter: Record<string, any> = {}) {
		const queryObj: Record<string, any> = { ...this.queryString };
		const excludedFields = ["page", "sort", "limit", "fields", "populate", "keyword"];
		excludedFields.forEach((element) => delete queryObj[element]);
		let queryStr = JSON.stringify(queryObj);
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt|ne)\b/g, (match) => `$${match}`);
		const parsedQuery = JSON.parse(queryStr);
		this.MongooseQuery = this.MongooseQuery.where({ ...parsedQuery, ...reqFilter });
		return this;
	}

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			this.MongooseQuery = this.MongooseQuery.sort(sortBy);
		} else {
			this.MongooseQuery = this.MongooseQuery.sort("-createdAt");
		}
		return this;
	}

	select() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(",").join(" ");
			this.MongooseQuery = this.MongooseQuery.select(`${fields} `);
		} else {
			this.MongooseQuery = this.MongooseQuery.select(`-__v `);
		}
		return this;
	}

	search(fields: string[]) {
		if (this.queryString.keyword) {
			this.MongooseQuery = this.MongooseQuery.where({
				$or: fields.map((field) => ({
					[field]: {
						$regex: this.queryString.keyword,
						$options: "i",
					},
				})),
			});
		}
		return this;
	}

	async paginate() {
		const page = Math.max(parseInt(this.queryString.page) || 1, 1);
		const limit = Math.max(parseInt(this.queryString.limit) || 10, 1);
		const skip = (page - 1) * limit;
		const countDocuments = await this.MongooseQuery.model.countDocuments(
			this.MongooseQuery.getFilter()
		);
		this.MongooseQuery = this.MongooseQuery.skip(skip).limit(limit);
		const endIndex = page * limit;
		const totalPages = Math.ceil(countDocuments / limit) || 1;
		const pagination: paginateOBJ = {
			count: countDocuments,
			page,
			limit: limit,
			pages: totalPages,
			hasNextPage: endIndex < countDocuments,
			hasPrevPage: page > 1,
			nextPage: endIndex < countDocuments ? page + 1 : null,
			prevPage: page > 1 ? page - 1 : null,
			lastPage: totalPages,
		};
		this.paginationResult = pagination;
		return this;
	}
}
