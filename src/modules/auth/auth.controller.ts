import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

import {
    getMe,
    loginUser,
    logoutUser,
    refreshSession,
    registerUser,
} from "./auth.service";

export async function register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { email, password, nom, prenom, telephone, deviceName, role } = req.body;

        // Only admins can specify a role. Superviseurs can only create agents (default role).
        let assignedRole: string | undefined = undefined;
        if (role) {
            if (req.userRole !== "admin") {
                res.status(403).json({ message: "Only admins can assign roles" });
                return;
            }
            assignedRole = role;
        }

        const result = await registerUser(email, password, nom, prenom, telephone, deviceName, assignedRole);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { email, password, deviceName } = req.body;
        const result = await loginUser(email, password, deviceName);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function refresh(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { refreshToken } = req.body;
        const result = await refreshSession(refreshToken);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

export async function logout(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const { refreshToken } = req.body;
        await logoutUser(refreshToken);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

export async function me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await getMe(req.userId);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}
