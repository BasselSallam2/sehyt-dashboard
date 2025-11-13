import { query } from "express";

export const GetAllMiddleWare = (req, res, next) => {
    req.query.doctor = req.params.doctorId;
    req.query.date = req.query.date || { gte: new Date() };
    next();
};

export const addDoctorToBody = (req, res, next) => {
    req.body.doctor = req.user.id;
    next();
}


export const addPatientToBody = (req, res, next) => {
    req.body.patient = req.user.id;
    next();
}

export const addPatientIdFilter = (req, res, next) => {
    req.query.patient = req.user.id;
    next();
}

export const addPatientParamFilter = (req, res, next) => {
    req.query.patient = req.params.userId;
    next();
}

export const getDoctorReservations = (req, res, next) => {
    req.user._id = req.query.doctor;
    req.query.reserved = true;
    next();
}




