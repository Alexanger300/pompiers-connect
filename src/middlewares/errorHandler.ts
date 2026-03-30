import { NextFunction, Request, Response } from "express";

type ErrorLike = {
    status?: number;
    message?: string;
};

export function errorHandler(
    err: ErrorLike,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    const status = err.status ?? 500;
    const message = err.message ?? "Internal server error";

    if (status >= 500) {
        console.error(err);
    }

    res.status(status).json({ message });
}
