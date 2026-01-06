import { employeeModel } from "@modules/employee/employee.schema";

export const seedAdmin = async () => {
	const admin = await employeeModel.findOne({ name: "admin", type: "admin" });
	if (admin) return;
	await employeeModel.create({
		name: "admin",
		type: "admin",
		password: "123456",
		phone: "0123456789",
		avatar: {
			fileId: "app_uploads/gtkaabjgao95yv24qupk",
			url: "http://res.cloudinary.com/dxtldumls/image/upload/v1762890076/app_uploads/gtkaabjgao95yv24qupk.webp",
		},
	});
};
