export const getDoctorsOnly = (req: any, res: any, next: any) => {
    const {type} = req.user;
    req.query.type = "doctor";
    if(type === "admin") return next();
    req.query.country = req.user.country
    req.query.sort = "city"
    next();
}


export const getAdminsOnly = (req: any, res: any, next: any) => {
    const {id} = req.user;
    req.query.type = "admin";
    req.query.doctor = {ne: id};
    next();
}