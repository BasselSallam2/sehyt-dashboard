export const getDoctorsOnly = (req: any, res: any, next: any) => {
    req.query.type = "doctor";

    // If user is authenticated, apply user-specific filtering
    if (req.user && req.user.type) {
        const {type} = req.user;
        if(type === "admin") return next();
        req.query.country = req.user.country;
        req.query.sort = "city";
    }
    // For guests, just show all doctors without filtering

    next();
}


export const getAdminsOnly = (req: any, res: any, next: any) => {
    const {id} = req.user;
    req.query.type = "admin";
    req.query.doctor = {ne: id};
    next();
}