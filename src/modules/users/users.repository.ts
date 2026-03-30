import { supabase } from "../../config/supabase";

type UserView = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    createdAt: string;
};

function mapUserViewRow(row: any): UserView {
    return {
        id: row.id,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        telephone: row.telephone,
        createdAt: row.created_at,
    };
}

function throwOnError(error: { message: string } | null): void {
    if (error) {
        throw { status: 500, message: error.message };
    }
}

export async function findUserById(id: number): Promise<UserView | null> {
    const { data, error } = await supabase
        .from("users")
        .select("id, nom, prenom, email, telephone, created_at")
        .eq("id", id)
        .maybeSingle();

    throwOnError(error);
    return data ? mapUserViewRow(data) : null;
}

export async function updateUserById(
    id: number,
    data: { nom?: string; prenom?: string; email?: string; telephone?: string },
): Promise<UserView> {
    const payload: Record<string, unknown> = {};
    if (data.nom !== undefined) payload.nom = data.nom;
    if (data.prenom !== undefined) payload.prenom = data.prenom;
    if (data.email !== undefined) payload.email = data.email;
    if (data.telephone !== undefined) payload.telephone = data.telephone;

    const { data: updated, error } = await supabase
        .from("users")
        .update(payload)
        .eq("id", id)
        .select("id, nom, prenom, email, telephone, created_at")
        .single();

    if (error) {
        if (error.code === "23505") {
            throw { status: 409, message: "Email already in use", code: error.code };
        }
        throw { status: 500, message: error.message };
    }

    return mapUserViewRow(updated);
}

export async function deleteUserById(id: number): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", id);
    throwOnError(error);
}
