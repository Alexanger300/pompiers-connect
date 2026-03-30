import { supabase } from "../../config/supabase";

export type AuthUser = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    role: string;
    passwordHash: string;
};

export type AuthSession = {
    id: number;
    userId: number;
    refreshTokenHash: string;
    deviceName: string | null;
    expiresAt: Date;
    revokedAt: Date | null;
};

function mapUserRow(row: any): AuthUser {
    return {
        id: row.id,
        nom: row.nom,
        prenom: row.prenom,
        email: row.email,
        telephone: row.telephone,
        role: row.role,
        passwordHash: row.password_hash,
    };
}

function mapSessionRow(row: any): AuthSession {
    return {
        id: row.id,
        userId: row.user_id,
        refreshTokenHash: row.refresh_token_hash,
        deviceName: row.device_name,
        expiresAt: new Date(row.expires_at),
        revokedAt: row.revoked_at ? new Date(row.revoked_at) : null,
    };
}

function throwOnError(error: { message: string } | null): void {
    if (error) {
        throw { status: 500, message: error.message };
    }
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
    const { data, error } = await supabase
        .from("users")
        .select("id, nom, prenom, email, telephone, role, password_hash")
        .eq("email", email)
        .maybeSingle();

    throwOnError(error);
    return data ? mapUserRow(data) : null;
}

export async function findUserById(id: number): Promise<AuthUser | null> {
    const { data, error } = await supabase
        .from("users")
        .select("id, nom, prenom, email, telephone, role, password_hash")
        .eq("id", id)
        .maybeSingle();

    throwOnError(error);
    return data ? mapUserRow(data) : null;
}

export async function createUser(data: {
    email: string;
    passwordHash: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role?: string;
}): Promise<AuthUser> {
    const { data: inserted, error } = await supabase
        .from("users")
        .insert({
            email: data.email,
            password_hash: data.passwordHash,
            nom: data.nom,
            prenom: data.prenom,
            telephone: data.telephone ?? null,
            role: data.role ?? "agent",
        })
        .select("id, nom, prenom, email, telephone, role, password_hash")
        .single();

    if (error) {
        if (error.code === "23505") {
            throw { status: 409, message: "Email already in use" };
        }
        throw { status: 500, message: error.message };
    }

    return mapUserRow(inserted);
}

export async function createSession(data: {
    userId: number;
    refreshTokenHash: string;
    deviceName?: string;
    expiresAt: Date;
}): Promise<AuthSession> {
    const { data: inserted, error } = await supabase
        .from("sessions")
        .insert({
            user_id: data.userId,
            refresh_token_hash: data.refreshTokenHash,
            device_name: data.deviceName ?? null,
            expires_at: data.expiresAt.toISOString(),
        })
        .select("id, user_id, refresh_token_hash, device_name, expires_at, revoked_at")
        .single();

    throwOnError(error);
    return mapSessionRow(inserted);
}

export async function findSessionByRefreshTokenHash(
    refreshTokenHash: string,
): Promise<AuthSession | null> {
    const { data, error } = await supabase
        .from("sessions")
        .select("id, user_id, refresh_token_hash, device_name, expires_at, revoked_at")
        .eq("refresh_token_hash", refreshTokenHash)
        .maybeSingle();

    throwOnError(error);
    return data ? mapSessionRow(data) : null;
}

export async function rotateSession(
    sessionId: number,
    data: { refreshTokenHash: string; expiresAt: Date; lastUsedAt: Date },
): Promise<AuthSession> {
    const { data: updated, error } = await supabase
        .from("sessions")
        .update({
            refresh_token_hash: data.refreshTokenHash,
            expires_at: data.expiresAt.toISOString(),
            last_used_at: data.lastUsedAt.toISOString(),
        })
        .eq("id", sessionId)
        .select("id, user_id, refresh_token_hash, device_name, expires_at, revoked_at")
        .single();

    throwOnError(error);
    return mapSessionRow(updated);
}

export async function revokeSession(sessionId: number): Promise<AuthSession> {
    const { data: updated, error } = await supabase
        .from("sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", sessionId)
        .select("id, user_id, refresh_token_hash, device_name, expires_at, revoked_at")
        .single();

    throwOnError(error);
    return mapSessionRow(updated);
}
