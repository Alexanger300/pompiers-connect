import { supabase } from "../../config/supabase";

export type Disponibilite = {
    id: number;
    userId: number;
    dateJour: string;
    tranche: string;
    statut: string;
    dateSaisie: string;
};

function mapDisponibiliteRow(row: any): Disponibilite {
    return {
        id: row.id,
        userId: row.user_id,
        dateJour: row.date_jour,
        tranche: row.tranche,
        statut: row.statut,
        dateSaisie: row.date_saisie,
    };
}

function throwOnError(error: { message: string; code?: string } | null): void {
    if (error) {
        throw { status: 500, message: error.message, code: error.code };
    }
}

export async function listDisponibilites(filters: {
    userId?: number;
    dateJour?: string;
}): Promise<Disponibilite[]> {
    let query = supabase
        .from("disponibilites")
        .select("id, user_id, date_jour, tranche, statut, date_saisie")
        .order("date_jour", { ascending: true })
        .order("tranche", { ascending: true });

    if (filters.userId !== undefined) {
        query = query.eq("user_id", filters.userId);
    }
    if (filters.dateJour !== undefined) {
        query = query.eq("date_jour", filters.dateJour);
    }

    const { data, error } = await query;
    throwOnError(error);
    return (data ?? []).map(mapDisponibiliteRow);
}

export async function findDisponibiliteById(id: number): Promise<Disponibilite | null> {
    const { data, error } = await supabase
        .from("disponibilites")
        .select("id, user_id, date_jour, tranche, statut, date_saisie")
        .eq("id", id)
        .maybeSingle();

    throwOnError(error);
    return data ? mapDisponibiliteRow(data) : null;
}

export async function createDisponibilite(data: {
    userId: number;
    dateJour: string;
    tranche: string;
    statut?: string;
}): Promise<Disponibilite> {
    const { data: inserted, error } = await supabase
        .from("disponibilites")
        .insert({
            user_id: data.userId,
            date_jour: data.dateJour,
            tranche: data.tranche,
            statut: data.statut ?? "disponible",
        })
        .select("id, user_id, date_jour, tranche, statut, date_saisie")
        .single();

    if (error) {
        if (error.code === "23505") {
            throw { status: 409, message: "Availability already exists for this slot" };
        }
        throw { status: 500, message: error.message };
    }

    return mapDisponibiliteRow(inserted);
}

export async function updateDisponibiliteById(
    id: number,
    updates: { dateJour?: string; tranche?: string; statut?: string },
): Promise<Disponibilite> {
    const payload: Record<string, unknown> = {};
    if (updates.dateJour !== undefined) payload.date_jour = updates.dateJour;
    if (updates.tranche !== undefined) payload.tranche = updates.tranche;
    if (updates.statut !== undefined) payload.statut = updates.statut;

    const { data, error } = await supabase
        .from("disponibilites")
        .update(payload)
        .eq("id", id)
        .select("id, user_id, date_jour, tranche, statut, date_saisie")
        .single();

    if (error) {
        if (error.code === "23505") {
            throw { status: 409, message: "Availability already exists for this slot" };
        }
        throw { status: 500, message: error.message };
    }

    return mapDisponibiliteRow(data);
}
