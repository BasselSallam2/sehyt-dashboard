
export const getMySchedule = (req: any, res: any, next: any) => {
    req.query.doctor = req.user.id;
    next();
};