import { NextFunction, Request, Response } from "express";

import {
    getAllUsers,
    getUser,
    removeUser,
    sendEmailToUser,
    updateUser,
    updateUserRole,
} from "./users.service";

function parseParamId(req: Request): number {
    const id = Number(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        throw { status: 400, message: "Invalid user id" };
    }
    return id;
}

function ensureSelfAccess(req: Request): void {
    const routeId = parseParamId(req);
    if (!req.userId || Number(req.userId) !== routeId) {
        throw { status: 403, message: "Forbidden" };
    }
}

function ensureManagerAccess(req: Request): void {
    const isManager = req.userRole === "admin" || req.userRole === "superviseur";
    if (!isManager) {
        throw { status: 403, message: "Forbidden" };
    }
}

function ensureSelfOrManagerAccess(req: Request): void {
    const routeId = parseParamId(req);
    const isSelf = !!req.userId && Number(req.userId) === routeId;
    const isManager = req.userRole === "admin" || req.userRole === "superviseur";

    if (!isSelf && !isManager) {
        throw { status: 403, message: "Forbidden" };
    }
}

export async function listUsersController(
    _req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export async function getUserById(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        ensureSelfAccess(req);
        const user = await getUser(parseParamId(req));
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function patchUserById(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        ensureSelfAccess(req);
        const user = await updateUser(parseParamId(req), req.body);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function deleteUserById(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        ensureSelfOrManagerAccess(req);
        await removeUser(parseParamId(req));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function postEmailToUserById(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        ensureSelfOrManagerAccess(req);
        await sendEmailToUser(parseParamId(req), req.body);
        res.status(202).json({ message: "Email sent" });
    } catch (error) {
        next(error);
    }
}

export async function patchUserRoleById(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        ensureManagerAccess(req);
        if (req.userRole !== "admin") {
            throw { status: 403, message: "Forbidden" };
        }
        const user = await updateUserRole(parseParamId(req), req.body);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}
