import {
    findSuiviById,
    findSuiviByUserId,
    updateSuivi,
    findFormationItemById,
    findAllFormationItems,
} from "./suivi.repository";

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

export async function getSuiviById(id: number) {
    const suivi = await findSuiviById(id);

    if (!suivi) {
        createHttpError(404, "Suivi not found");
    }

    return suivi;
}

export async function getSuiviByUserId(userId: number) {
    return await findSuiviByUserId(userId);
}

export async function updateSuiviContent(
    id: number,
    updates: {
        estValide?: boolean;
        progressionPourcentage?: number;
        dateValidation?: string | null;
        commentaires?: string | null;
        donneesProgressionJson?: Record<string, any>;
    }
) {
    // Validate progression percentage if provided
    if (updates.progressionPourcentage !== undefined) {
        if (
            !Number.isInteger(updates.progressionPourcentage) ||
            updates.progressionPourcentage < 0 ||
            updates.progressionPourcentage > 100
        ) {
            createHttpError(400, "Progression percentage must be between 0 and 100");
        }
    }

    // If setting as valid, set completion to 100 and set validation date
    if (updates.estValide === true) {
        updates.progressionPourcentage = 100;
        updates.dateValidation = new Date().toISOString();
    }

    return await updateSuivi(id, updates);
}

export async function getFormationItemById(id: number) {
    const item = await findFormationItemById(id);

    if (!item) {
        createHttpError(404, "Formation item not found");
    }

    return item;
}

export async function getAllFormationItems() {
    return await findAllFormationItems();
}
