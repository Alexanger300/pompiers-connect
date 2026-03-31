import {
    disableDeviceById,
    listDevicesForUser,
    upsertUserDevice,
} from "./devices.repository";

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

function normalizePlatform(platform?: string): "android" | "ios" {
    const value = platform?.trim().toLowerCase();
    if (value === "android" || value === "ios") {
        return value;
    }
    createHttpError(400, "platform must be android or ios");
}

export async function registerDevice(payload: {
    userId: number;
    platform?: string;
    pushToken?: string;
    deviceName?: string;
}) {
    const pushToken = payload.pushToken?.trim();
    if (!pushToken) {
        createHttpError(400, "pushToken is required");
    }

    return upsertUserDevice({
        userId: payload.userId,
        platform: normalizePlatform(payload.platform),
        pushToken,
        deviceName: payload.deviceName?.trim(),
    });
}

export async function getMyDevices(userId: number) {
    return listDevicesForUser(userId);
}

export async function unregisterDevice(payload: {
    userId: number;
    deviceId: number;
}) {
    await disableDeviceById(payload.deviceId, payload.userId);
}
