import { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../../utils/jwt";

export type AuthenticatedRequest = Request & {
    userId?: string;
    userRole?: string;
};

export function authenticate(
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
): void {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw { status: 401, message: "Missing bearer token" };
        }

        const token = authorization.slice(7);
        const payload = verifyAccessToken(token);

        req.userId = payload.sub;
        req.userRole = payload.role;
        next();
    } catch (_error) {
        next({ status: 401, message: "Invalid or expired access token" });
    }
}
