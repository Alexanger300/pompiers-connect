import { supabase } from "../../config/supabase";

export type UserDevice = {
    id: number;
    userId: number;
    platform: "android" | "ios";
    pushToken: string;
    deviceName: string | null;
    isActive: boolean;
    lastSeenAt: string;
    createdAt: string;
};

function mapUserDeviceRow(row: any): UserDevice {
    return {
        id: row.id,
        userId: row.user_id,
        platform: row.platform,
        pushToken: row.push_token,
        deviceName: row.device_name,
        isActive: row.is_active,
        lastSeenAt: row.last_seen_at,
        createdAt: row.created_at,
    };
}

function throwOnError(error: { message: string; code?: string } | null): void {
    if (error) {
        throw { status: 500, message: error.message, code: error.code };
    }
}

export async function upsertUserDevice(data: {
    userId: number;
    platform: "android" | "ios";
    pushToken: string;
    deviceName?: string;
}): Promise<UserDevice> {
    const { data: inserted, error } = await supabase
        .from("user_devices")
        .upsert(
            {
                user_id: data.userId,
                platform: data.platform,
                push_token: data.pushToken,
                device_name: data.deviceName ?? null,
                is_active: true,
                last_seen_at: new Date().toISOString(),
            },
            { onConflict: "push_token" },
        )
        .select("id, user_id, platform, push_token, device_name, is_active, last_seen_at, created_at")
        .single();

    throwOnError(error);
    return mapUserDeviceRow(inserted);
}

export async function listDevicesByUserIds(userIds: number[]): Promise<UserDevice[]> {
    if (userIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("user_devices")
        .select("id, user_id, platform, push_token, device_name, is_active, last_seen_at, created_at")
        .in("user_id", userIds)
        .eq("is_active", true);

    throwOnError(error);
    return (data ?? []).map(mapUserDeviceRow);
}

export async function listDevicesForUser(userId: number): Promise<UserDevice[]> {
    const { data, error } = await supabase
        .from("user_devices")
        .select("id, user_id, platform, push_token, device_name, is_active, last_seen_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    throwOnError(error);
    return (data ?? []).map(mapUserDeviceRow);
}

export async function disableDeviceById(id: number, userId: number): Promise<void> {
    const { error } = await supabase
        .from("user_devices")
        .update({ is_active: false, last_seen_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

    throwOnError(error);
}

export async function disableDevicesByPushTokens(pushTokens: string[]): Promise<void> {
    if (pushTokens.length === 0) {
        return;
    }

    const { error } = await supabase
        .from("user_devices")
        .update({ is_active: false, last_seen_at: new Date().toISOString() })
        .in("push_token", pushTokens);

    throwOnError(error);
}
