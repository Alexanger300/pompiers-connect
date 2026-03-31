import { NextFunction, Request, Response } from "express";
import { config } from "../config/env";

type ErrorLike = {
    status?: number;
    message?: string;
    code?: string;
    details?: unknown;
    hint?: string;
    stack?: string;
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

    const payload: Record<string, unknown> = { message };

    if (config.nodeEnv === "development") {
        payload.debug = {
            status,
            code: err.code ?? null,
            details: err.details ?? null,
            hint: err.hint ?? null,
            stack: err.stack ?? null,
            raw: err,
        };
    }

    res.status(status).json(payload);
}
