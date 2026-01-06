import { connectDB } from "@config/db.config";
import { bunnerModel } from "@modules/bunner/bunner.schema";
import { countryModel } from "@modules/country/country.schema";
import { employeeModel } from "@modules/employee/employee.schema";
import { devLogger } from "@utils/devLogger";
import { getEnv } from "@utils/envHelper";
import app from "app";
import { seeder } from "seeders/seeder";

const startServer = async () => {
	await connectDB();
	devLogger("Server Connected With DB Successfully");
	seeder();
	app.listen(getEnv("PORT"), () => {
		devLogger("Server started at port 3000");
	});
};

startServer();
