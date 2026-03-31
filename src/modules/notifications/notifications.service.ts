import { config } from "../../config/env";
import { listUsers } from "../users/users.repository";
import {
    createNotificationRecord,
    deleteNotificationById,
    listNotifications,
    updateNotificationStatus,
} from "./notifications.repository";

type NotificationPayload = {
    title?: string;
    message?: string;
    data?: Record<string, unknown>;
};

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

function validateNotificationPayload(payload: NotificationPayload): {
    title: string;
    message: string;
    data: Record<string, unknown>;
} {
    const title = payload.title?.trim();
    const message = payload.message?.trim();
    const data =
        payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
            ? payload.data
            : {};

    if (!title || !message) {
        createHttpError(400, "title and message are required");
    }

    return { title, message, data };
}

async function dispatchToMobileCallback(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch(config.mobileNotificationCallbackUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(config.mobileNotificationCallbackSecret
                ? { "x-notification-secret": config.mobileNotificationCallbackSecret }
                : {}),
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw {
            status: 502,
            message: responseText
                ? `Notification callback failed: ${response.status} ${responseText}`
                : `Notification callback failed with status ${response.status}`,
        };
    }
}

function ensureManager(role?: string): void {
    const isManager = role === "admin" || role === "superviseur";
    if (!isManager) {
        createHttpError(403, "Forbidden");
    }
}

export async function sendNotificationToRecipients(payload: {
    senderUserId: number;
    senderRole?: string;
    recipientUserIds?: number[];
    title?: string;
    message?: string;
    data?: Record<string, unknown>;
}) {
    ensureManager(payload.senderRole);

    const { title, message, data } = validateNotificationPayload(payload);
    const recipientUserIds = Array.isArray(payload.recipientUserIds)
        ? payload.recipientUserIds.filter(
              (value, index, array) =>
                  Number.isInteger(value) && value > 0 && array.indexOf(value) === index,
          )
        : [];

    if (recipientUserIds.length === 0) {
        createHttpError(400, "recipientUserIds is required");
    }

    const notification = await createNotificationRecord({
        type: "direct",
        senderUserId: payload.senderUserId,
        recipientUserIds,
        recipientCount: recipientUserIds.length,
        title,
        message,
        data,
    });

    try {
        await dispatchToMobileCallback({
            notificationId: notification.id,
            type: "direct",
            senderUserId: payload.senderUserId,
            recipientUserIds,
            title,
            message,
            data,
        });
        await updateNotificationStatus(notification.id, "sent");
    } catch (error) {
        await updateNotificationStatus(notification.id, "failed");
        throw error;
    }

    return { id: notification.id, recipients: recipientUserIds.length };
}

export async function broadcastNotificationToOthers(payload: {
    senderUserId: number;
    senderRole?: string;
    title?: string;
    message?: string;
    data?: Record<string, unknown>;
}) {
    ensureManager(payload.senderRole);

    const { title, message, data } = validateNotificationPayload(payload);
    const users = await listUsers();
    const recipientUserIds = users
        .map((user) => user.id)
        .filter((userId) => userId !== payload.senderUserId);

    if (recipientUserIds.length === 0) {
        createHttpError(404, "No recipients found");
    }

    const notification = await createNotificationRecord({
        type: "broadcast",
        senderUserId: payload.senderUserId,
        recipientUserIds,
        recipientCount: recipientUserIds.length,
        title,
        message,
        data,
    });

    try {
        await dispatchToMobileCallback({
            notificationId: notification.id,
            type: "broadcast",
            senderUserId: payload.senderUserId,
            recipientUserIds,
            title,
            message,
            data,
        });
        await updateNotificationStatus(notification.id, "sent");
    } catch (error) {
        await updateNotificationStatus(notification.id, "failed");
        throw error;
    }

    return { id: notification.id, recipients: recipientUserIds.length };
}

export async function getNotifications(payload: {
    senderRole?: string;
    senderUserId: number;
    type?: string;
    status?: string;
}) {
    ensureManager(payload.senderRole);
    return listNotifications({
        senderUserId: payload.senderRole === "admin" ? undefined : payload.senderUserId,
        type: payload.type,
        status: payload.status,
    });
}

export async function removeNotification(payload: {
    senderRole?: string;
    id: number;
}) {
    ensureManager(payload.senderRole);
    await deleteNotificationById(payload.id);
}
