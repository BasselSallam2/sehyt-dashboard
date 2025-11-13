import { devLogger } from "@utils/devLogger";
import { getEnv } from "@utils/envHelper";
import mongoose from "mongoose";




const dbConnection = mongoose.connection;

dbConnection.on("connected", () => {
	devLogger("MongoDB: Connection established.");
});

dbConnection.on("error", (error) => {
	devLogger(`MongoDB: Connection error: ${error}`);
});

dbConnection.on("disconnected", () => {
	devLogger("MongoDB: Connection disconnected.");
});

dbConnection.on("close", () => {
	devLogger("MongoDB: Connection closed.");
});

export const connectDB = async () => {
	try {
		await mongoose.connect(getEnv("MONGO_URI"), {
			sanitizeFilter: true,
			timeoutMS: 10000,
			maxPoolSize: 20,
			maxConnecting: 20,
			minPoolSize: 5,
		});
	} catch (error) {
		devLogger(error);
		process.exit(1);
	}
};
