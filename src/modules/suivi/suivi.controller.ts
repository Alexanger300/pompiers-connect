import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import {
    getAllSuivis,
    getSuiviById,
    getSuiviByUserId,
    updateSuiviContent,
    getFormationItemById,
    getAllFormationItems,
    getPendingSuivis,
} from "./suivi.service";

function parseOptionalPositiveInt(value: unknown, fieldName: string): number | undefined {
    if (value === undefined) {
        return undefined;
    }

    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw { status: 400, message: `Invalid ${fieldName}` };
    }
    return parsed;
}

function parseOptionalBoolean(value: unknown, fieldName: string): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    const raw = Array.isArray(value) ? value[0] : value;
    if (raw === "true" || raw === true) {
        return true;
    }
    if (raw === "false" || raw === false) {
        return false;
    }
    throw { status: 400, message: `Invalid ${fieldName}` };
}

export async function getSuiviForUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (!req.userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const userId = parseInt(req.userId, 10);
        const suivis = await getSuiviByUserId(userId);
        res.status(200).json(suivis);
    } catch (error) {
        next(error);
    }
}

export async function getSuiviDetail(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            res.status(400).json({ message: "Invalid suivi ID" });
            return;
        }

        const suiviId = parseInt(id, 10);

        if (!Number.isInteger(suiviId) || suiviId <= 0) {
            res.status(400).json({ message: "Invalid suivi ID" });
            return;
        }

        const suivi = await getSuiviById(suiviId);
        res.status(200).json(suivi);
    } catch (error) {
        next(error);
    }
}

/**
 * Update suivi (protected - only admin/superviseur)
 * Admin can update any suivi, superviseur can update suivi for their team
 */
export async function updateSuivi(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            res.status(400).json({ message: "Invalid suivi ID" });
            return;
        }

        const suiviId = parseInt(id, 10);

        if (!Number.isInteger(suiviId) || suiviId <= 0) {
            res.status(400).json({ message: "Invalid suivi ID" });
            return;
        }

        const {
            estValide,
            progressionPourcentage,
            commentaires,
            donneesProgressionJson,
        } = req.body;

        const updated = await updateSuiviContent(suiviId, {
            estValide,
            progressionPourcentage,
            commentaires,
            donneesProgressionJson,
        });

        res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

export async function listFormationItems(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const items = await getAllFormationItems();
        res.status(200).json(items);
    } catch (error) {
        next(error);
    }
}

export async function listAllSuivis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const suivis = await getAllSuivis({
            userId: parseOptionalPositiveInt(req.query.userId, "userId"),
            estValide: parseOptionalBoolean(req.query.estValide, "estValide"),
        });
        res.status(200).json(suivis);
    } catch (error) {
        next(error);
    }
}

export async function listPendingSuivis(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const suivis = await getPendingSuivis({
            userId: parseOptionalPositiveInt(req.query.userId, "userId"),
        });
        res.status(200).json(suivis);
    } catch (error) {
        next(error);
    }
}

export async function getFormationItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = req.params.id;
        if (typeof id !== "string") {
            res.status(400).json({ message: "Invalid formation item ID" });
            return;
        }

        const itemId = parseInt(id, 10);

        if (!Number.isInteger(itemId) || itemId <= 0) {
            res.status(400).json({ message: "Invalid formation item ID" });
            return;
        }

        const item = await getFormationItemById(itemId);
        res.status(200).json(item);
    } catch (error) {
        next(error);
    }
}
