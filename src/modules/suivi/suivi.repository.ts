import { supabase } from "../../config/supabase";

export type SuiviFormation = {
    id: number;
    userId: number;
    itemId: number;
    estValide: boolean;
    progressionPourcentage: number;
    dateValidation: string | null;
    commentaires: string | null;
    donneesProgressionJson: Record<string, any>;
};

export type FormationItem = {
    id: number;
    titre: string;
    description: string | null;
    templateJson: Record<string, any>;
};

function mapSuiviRow(row: any): SuiviFormation {
    return {
        id: row.id,
        userId: row.user_id,
        itemId: row.item_id,
        estValide: row.est_valide,
        progressionPourcentage: row.progression_pourcentage,
        dateValidation: row.date_validation,
        commentaires: row.commentaires,
        donneesProgressionJson: row.donnees_progression_json || {},
    };
}

export async function findSuiviById(id: number): Promise<SuiviFormation | null> {
    const { data, error } = await supabase
        .from("suivi_formation")
        .select(
            "id, user_id, item_id, est_valide, progression_pourcentage, date_validation, commentaires, donnees_progression_json"
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching suivi:", error);
        throw { status: 500, message: "Failed to fetch suivi" };
    }

    if (!data) {
        return null;
    }

    return mapSuiviRow(data);
}

export async function findSuiviByUserAndItem(
    userId: number,
    itemId: number
): Promise<SuiviFormation | null> {
    const { data, error } = await supabase
        .from("suivi_formation")
        .select(
            "id, user_id, item_id, est_valide, progression_pourcentage, date_validation, commentaires, donnees_progression_json"
        )
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching suivi:", error);
        throw { status: 500, message: "Failed to fetch suivi" };
    }

    if (!data) {
        return null;
    }

    return mapSuiviRow(data);
}

export async function findSuiviByUserId(userId: number): Promise<SuiviFormation[]> {
    const { data, error } = await supabase
        .from("suivi_formation")
        .select(
            "id, user_id, item_id, est_valide, progression_pourcentage, date_validation, commentaires, donnees_progression_json"
        )
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching suivis:", error);
        throw { status: 500, message: "Failed to fetch suivis" };
    }

    return (data || []).map(mapSuiviRow);
}

export async function updateSuivi(
    id: number,
    updates: {
        estValide?: boolean;
        progressionPourcentage?: number;
        dateValidation?: string | null;
        commentaires?: string | null;
        donneesProgressionJson?: Record<string, any>;
    }
): Promise<SuiviFormation> {
    const updatePayload: any = {};

    if (updates.estValide !== undefined) {
        updatePayload.est_valide = updates.estValide;
    }
    if (updates.progressionPourcentage !== undefined) {
        updatePayload.progression_pourcentage = updates.progressionPourcentage;
    }
    if (updates.dateValidation !== undefined) {
        updatePayload.date_validation = updates.dateValidation;
    }
    if (updates.commentaires !== undefined) {
        updatePayload.commentaires = updates.commentaires;
    }
    if (updates.donneesProgressionJson !== undefined) {
        updatePayload.donnees_progression_json = updates.donneesProgressionJson;
    }

    const { data, error } = await supabase
        .from("suivi_formation")
        .update(updatePayload)
        .eq("id", id)
        .select(
            "id, user_id, item_id, est_valide, progression_pourcentage, date_validation, commentaires, donnees_progression_json"
        )
        .single();

    if (error) {
        console.error("Error updating suivi:", error);
        if (error.code === "PGRST116") {
            throw { status: 404, message: "Suivi not found" };
        }
        throw { status: 500, message: "Failed to update suivi" };
    }

    return mapSuiviRow(data);
}

export async function findFormationItemById(id: number): Promise<FormationItem | null> {
    const { data, error } = await supabase
        .from("formation_items")
        .select("id, titre, description, template_json")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching formation item:", error);
        throw { status: 500, message: "Failed to fetch formation item" };
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id,
        titre: data.titre,
        description: data.description,
        templateJson: data.template_json,
    };
}

export async function findAllFormationItems(): Promise<FormationItem[]> {
    const { data, error } = await supabase
        .from("formation_items")
        .select("id, titre, description, template_json");

    if (error) {
        console.error("Error fetching formation items:", error);
        throw { status: 500, message: "Failed to fetch formation items" };
    }

    return (data || []).map((item: any) => ({
        id: item.id,
        titre: item.titre,
        description: item.description,
        templateJson: item.template_json,
    }));
}

export async function createSuivi(data: {
    userId: number;
    itemId: number;
}): Promise<SuiviFormation> {
    const { data: created, error } = await supabase
        .from("suivi_formation")
        .insert({
            user_id: data.userId,
            item_id: data.itemId,
        })
        .select(
            "id, user_id, item_id, est_valide, progression_pourcentage, date_validation, commentaires, donnees_progression_json"
        )
        .single();

    if (error) {
        console.error("Error creating suivi:", error);
        if (error.code === "23505") {
            throw { status: 409, message: "Suivi already exists for this user and item" };
        }
        throw { status: 500, message: "Failed to create suivi" };
    }

    return mapSuiviRow(created);
}
