import {
    createDisponibilite,
    findDisponibiliteById,
    listDisponibilites,
    updateDisponibiliteById,
} from "./disponibilites.repository";

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

function isValidDateJour(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTranche(value: string): boolean {
    return value === "07h-19h" || value === "19h-07h";
}

function isValidStatut(value: string): boolean {
    return value === "disponible" || value === "sollicite" || value === "valide" || value === "refuse";
}

export async function getDisponibilites(filters: {
    requesterId: number;
    requesterRole?: string;
    userId?: number;
    dateJour?: string;
}) {
    const isManager = filters.requesterRole === "admin" || filters.requesterRole === "superviseur";
    const effectiveUserId = isManager ? filters.userId : filters.requesterId;

    if (filters.dateJour && !isValidDateJour(filters.dateJour)) {
        createHttpError(400, "dateJour must use YYYY-MM-DD format");
    }

    return listDisponibilites({
        userId: effectiveUserId,
        dateJour: filters.dateJour,
    });
}

export async function addDisponibilite(payload: {
    requesterId: number;
    requesterRole?: string;
    userId?: number;
    dateJour?: string;
    tranche?: string;
    statut?: string;
}) {
    const isManager = payload.requesterRole === "admin" || payload.requesterRole === "superviseur";
    const targetUserId = isManager && payload.userId ? payload.userId : payload.requesterId;
    const dateJour = payload.dateJour?.trim();
    const tranche = payload.tranche?.trim();
    const statut = payload.statut?.trim();

    if (!dateJour || !tranche) {
        createHttpError(400, "dateJour and tranche are required");
    }
    if (!isValidDateJour(dateJour)) {
        createHttpError(400, "dateJour must use YYYY-MM-DD format");
    }
    if (!isValidTranche(tranche)) {
        createHttpError(400, "tranche must be one of: 07h-19h, 19h-07h");
    }
    if (statut !== undefined && !isValidStatut(statut)) {
        createHttpError(400, "statut must be one of: disponible, sollicite, valide, refuse");
    }

    return createDisponibilite({
        userId: targetUserId,
        dateJour,
        tranche,
        statut,
    });
}

export async function editDisponibilite(payload: {
    disponibiliteId: number;
    requesterId: number;
    requesterRole?: string;
    dateJour?: string;
    tranche?: string;
    statut?: string;
}) {
    const disponibilite = await findDisponibiliteById(payload.disponibiliteId);
    if (!disponibilite) {
        createHttpError(404, "Availability not found");
    }

    const isManager = payload.requesterRole === "admin" || payload.requesterRole === "superviseur";
    const isOwner = payload.requesterId === disponibilite.userId;
    if (!isOwner && !isManager) {
        createHttpError(403, "Forbidden");
    }

    const updates: { dateJour?: string; tranche?: string; statut?: string } = {};
    if (payload.dateJour !== undefined) {
        if (!isValidDateJour(payload.dateJour)) {
            createHttpError(400, "dateJour must use YYYY-MM-DD format");
        }
        updates.dateJour = payload.dateJour;
    }
    if (payload.tranche !== undefined) {
        if (!isValidTranche(payload.tranche)) {
            createHttpError(400, "tranche must be one of: 07h-19h, 19h-07h");
        }
        updates.tranche = payload.tranche;
    }
    if (payload.statut !== undefined) {
        if (!isValidStatut(payload.statut)) {
            createHttpError(400, "statut must be one of: disponible, sollicite, valide, refuse");
        }
        updates.statut = payload.statut;
    }
    if (Object.keys(updates).length === 0) {
        createHttpError(400, "At least one field is required");
    }

    return updateDisponibiliteById(payload.disponibiliteId, updates);
}

export async function validateDisponibilite(payload: {
    disponibiliteId: number;
}) {
    const disponibilite = await findDisponibiliteById(payload.disponibiliteId);
    if (!disponibilite) {
        createHttpError(404, "Availability not found");
    }

    return updateDisponibiliteById(payload.disponibiliteId, { statut: "valide" });
}

export async function rejectDisponibilite(payload: {
    disponibiliteId: number;
}) {
    const disponibilite = await findDisponibiliteById(payload.disponibiliteId);
    if (!disponibilite) {
        createHttpError(404, "Availability not found");
    }

    return updateDisponibiliteById(payload.disponibiliteId, { statut: "refuse" });
}
