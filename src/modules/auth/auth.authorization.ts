import { NextFunction, RequestHandler, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

/**
 * Middleware pour vérifier que l'utilisateur a un des rôles requis.
 * Doit être appelé APRÈS authenticate().
 */
export function requireRole(...allowedRoles: string[]): RequestHandler {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            next({ status: 403, message: "Insufficient permissions" });
            return;
        }
        next();
    };
}
