import { supabase } from "../../config/supabase";

export type NotificationRecord = {
    id: number;
    type: string;
    senderUserId: number;
    title: string;
    message: string;
    data: Record<string, unknown>;
    recipientUserIds: number[];
    recipientCount: number;
    status: string;
    createdAt: string;
};

function mapNotificationRow(row: any): NotificationRecord {
    return {
        id: row.id,
        type: row.type,
        senderUserId: row.sender_user_id,
        title: row.title,
        message: row.message,
        data: row.data ?? {},
        recipientUserIds: row.recipient_user_ids ?? [],
        recipientCount: row.recipient_count,
        status: row.status,
        createdAt: row.created_at,
    };
}

function throwOnError(error: { message: string } | null): void {
    if (error) {
        throw { status: 500, message: error.message };
    }
}

export async function createNotificationRecord(data: {
    type: string;
    senderUserId: number;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    recipientUserIds: number[];
    recipientCount: number;
    status?: string;
}): Promise<NotificationRecord> {
    const { data: inserted, error } = await supabase
        .from("notifications")
        .insert({
            type: data.type,
            sender_user_id: data.senderUserId,
            title: data.title,
            message: data.message,
            data: data.data ?? {},
            recipient_user_ids: data.recipientUserIds,
            recipient_count: data.recipientCount,
            status: data.status ?? "pending",
        })
        .select(
            "id, type, sender_user_id, title, message, data, recipient_user_ids, recipient_count, status, created_at",
        )
        .single();

    throwOnError(error);
    return mapNotificationRow(inserted);
}

export async function updateNotificationStatus(
    id: number,
    status: string,
): Promise<NotificationRecord> {
    const { data, error } = await supabase
        .from("notifications")
        .update({ status })
        .eq("id", id)
        .select(
            "id, type, sender_user_id, title, message, data, recipient_user_ids, recipient_count, status, created_at",
        )
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            throw { status: 404, message: "Notification not found" };
        }
        throw { status: 500, message: error.message };
    }

    return mapNotificationRow(data);
}

export async function listNotifications(filters: {
    senderUserId?: number;
    type?: string;
    status?: string;
}): Promise<NotificationRecord[]> {
    let query = supabase
        .from("notifications")
        .select(
            "id, type, sender_user_id, title, message, data, recipient_user_ids, recipient_count, status, created_at",
        )
        .order("created_at", { ascending: false });

    if (filters.senderUserId !== undefined) {
        query = query.eq("sender_user_id", filters.senderUserId);
    }
    if (filters.type) {
        query = query.eq("type", filters.type);
    }
    if (filters.status) {
        query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    throwOnError(error);
    return (data ?? []).map(mapNotificationRow);
}

export async function deleteNotificationById(id: number): Promise<void> {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    throwOnError(error);
}
