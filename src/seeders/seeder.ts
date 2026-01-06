import { seedAdmin } from "./defult/admin.seeder";


export const seeder = async () => {
    await Promise.all([
    seedAdmin(),
    ]);
}