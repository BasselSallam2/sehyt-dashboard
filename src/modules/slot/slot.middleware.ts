import { query } from "express";

export const GetAllMiddleWare = (req, res, next) => {
    req.query.doctor = req.params.doctorId;
    req.query.date = req.query.date || { gte: new Date() };
    next();
};

export const addDoctorToBody = (req, res, next) => {
    // Only set doctor for doctor users, not admins
    if (req.user.type === 'doctor') {
        req.body.doctor = req.user.id;
    }
    // For admins, expect doctor to be provided in the request body
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
    req.query.doctor = req.user.id;
    req.query.reserved = true;
    next();
}




