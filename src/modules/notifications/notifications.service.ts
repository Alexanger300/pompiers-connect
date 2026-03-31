import { config } from "../../config/env";
import { listUsers } from "../users/users.repository";
import { disableDevicesByPushTokens, listDevicesByUserIds } from "../devices/devices.repository";
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

function isAndroidPushEnabled(): boolean {
    return config.expoPushAndroidEnabled;
}

function isIosPushEnabled(): boolean {
    return config.expoPushIosEnabled;
}

function getExpoPushHeaders(): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(config.expoAccessToken
            ? { Authorization: `Bearer ${config.expoAccessToken}` }
            : {}),
    };
}

async function dispatchToExpoPushService(messages: Array<Record<string, unknown>>): Promise<{
    sent: number;
    failedTokens: string[];
}> {
    if (messages.length === 0) {
        return { sent: 0, failedTokens: [] };
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: getExpoPushHeaders(),
        body: JSON.stringify(messages),
    });

    if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        throw { status: 502, message: `Expo push failed: ${response.status} ${responseText}` };
    }

    const body = (await response.json()) as {
        data?: Array<{ status?: string; details?: { error?: string } }>;
        errors?: unknown[];
    };

    const failedTokens: string[] = [];
    let sent = 0;

    (body.data ?? []).forEach((result, index) => {
        if (result.status === "ok") {
            sent += 1;
            return;
        }

        const token = String(messages[index]?.to ?? "");
        if (token) {
            failedTokens.push(token);
        }
    });

    return { sent, failedTokens };
}

async function dispatchPushNotification(payload: {
    title: string;
    message: string;
    data: Record<string, unknown>;
    recipientUserIds: number[];
}): Promise<{
    recipientCount: number;
}> {
    const devices = await listDevicesByUserIds(payload.recipientUserIds);
    const androidDevices = devices.filter((device) => device.platform === "android");
    const iosDevices = devices.filter((device) => device.platform === "ios");
    const messages: Array<Record<string, unknown>> = [];

    if (isAndroidPushEnabled()) {
        messages.push(
            ...androidDevices.map((device) => ({
                to: device.pushToken,
                title: payload.title,
                body: payload.message,
                data: payload.data,
                sound: "default",
                priority: "high",
            })),
        );
    }

    if (isIosPushEnabled()) {
        messages.push(
            ...iosDevices.map((device) => ({
                to: device.pushToken,
                title: payload.title,
                body: payload.message,
                data: payload.data,
                sound: "default",
                priority: "high",
            })),
        );
    }

    if (messages.length === 0) {
        createHttpError(503, "No Expo push platform is enabled for the targeted devices");
    }

    const result = await dispatchToExpoPushService(messages);

    await disableDevicesByPushTokens([
        ...result.failedTokens,
    ]);

    return {
        recipientCount: result.sent,
    };
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
        recipientCount: 0,
        title,
        message,
        data,
    });

    try {
        const result = await dispatchPushNotification({
            recipientUserIds,
            title,
            message,
            data,
        });
        await updateNotificationStatus(notification.id, "sent", result.recipientCount);
        notification.recipientCount = result.recipientCount;
    } catch (error) {
        await updateNotificationStatus(notification.id, "failed");
        throw error;
    }

    return { id: notification.id, recipients: notification.recipientCount };
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
        recipientCount: 0,
        title,
        message,
        data,
    });

    try {
        const result = await dispatchPushNotification({
            recipientUserIds,
            title,
            message,
            data,
        });
        await updateNotificationStatus(notification.id, "sent", result.recipientCount);
        notification.recipientCount = result.recipientCount;
    } catch (error) {
        await updateNotificationStatus(notification.id, "failed");
        throw error;
    }

    return { id: notification.id, recipients: notification.recipientCount };
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
