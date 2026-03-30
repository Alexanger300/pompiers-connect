import { NextFunction, Request, Response } from "express";

import { getUser, removeUser, updateUser } from "./users.service";

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
        ensureSelfAccess(req);
        await removeUser(parseParamId(req));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
