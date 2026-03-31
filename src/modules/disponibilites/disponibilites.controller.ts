import { NextFunction, Request, Response } from "express";

import {
    addDisponibilite,
    editDisponibilite,
    getDisponibilites,
    rejectDisponibilite,
    validateDisponibilite,
} from "./disponibilites.service";

function parseId(value: string | undefined, fieldName: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw { status: 400, message: `Invalid ${fieldName}` };
    }
    return id;
}

function getFirstParam(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export async function listDisponibilitesController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.userId) {
            throw { status: 401, message: "Unauthorized" };
        }

        const userIdQuery = Array.isArray(req.query.userId) ? req.query.userId[0] : req.query.userId;
        const dateJourQuery = Array.isArray(req.query.dateJour) ? req.query.dateJour[0] : req.query.dateJour;
        const disponibilites = await getDisponibilites({
            requesterId: parseId(req.userId, "user id"),
            requesterRole: req.userRole,
            userId: userIdQuery ? parseId(String(userIdQuery), "userId") : undefined,
            dateJour: dateJourQuery ? String(dateJourQuery) : undefined,
        });
        res.status(200).json(disponibilites);
    } catch (error) {
        next(error);
    }
}

export async function createDisponibiliteController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.userId) {
            throw { status: 401, message: "Unauthorized" };
        }

        const disponibilite = await addDisponibilite({
            requesterId: parseId(req.userId, "user id"),
            requesterRole: req.userRole,
            userId: req.body.userId,
            dateJour: req.body.dateJour,
            tranche: req.body.tranche,
            statut: req.body.statut,
        });
        res.status(201).json(disponibilite);
    } catch (error) {
        next(error);
    }
}

export async function patchDisponibiliteController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.userId) {
            throw { status: 401, message: "Unauthorized" };
        }

        const disponibilite = await editDisponibilite({
            disponibiliteId: parseId(getFirstParam(req.params.id), "availability id"),
            requesterId: parseId(req.userId, "user id"),
            requesterRole: req.userRole,
            dateJour: req.body.dateJour,
            tranche: req.body.tranche,
            statut: req.body.statut,
        });
        res.status(200).json(disponibilite);
    } catch (error) {
        next(error);
    }
}

export async function validateDisponibiliteController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const disponibilite = await validateDisponibilite({
            disponibiliteId: parseId(getFirstParam(req.params.id), "availability id"),
        });
        res.status(200).json(disponibilite);
    } catch (error) {
        next(error);
    }
}

export async function rejectDisponibiliteController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const disponibilite = await rejectDisponibilite({
            disponibiliteId: parseId(getFirstParam(req.params.id), "availability id"),
        });
        res.status(200).json(disponibilite);
    } catch (error) {
        next(error);
    }
}
