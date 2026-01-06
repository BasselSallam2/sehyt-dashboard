import asyncHandler from "express-async-handler";
import { getMyReservations, getStatistics } from "./statistics.service";
import type { Types } from "mongoose";


export const statisticsController = asyncHandler(async (req: any, res: any) => {
    const [doctorsCount, reservationsCount, specializesCount, patientsCount] = await getStatistics();
    res.status(200).json({ doctorsCount, reservationsCount, specializesCount, patientsCount });
})

export const myReservations = asyncHandler(async (req: any, res: any) => {
    const {id} = req.user ;
    const reservationsCount = await getMyReservations(id);
    res.status(200).json({ reservationsCount });
})