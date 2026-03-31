import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../auth/auth.middleware";
import { getMyDevices, registerDevice, unregisterDevice } from "./devices.service";

function parseAuthenticatedUserId(req: AuthenticatedRequest): number {
    const userId = Number(req.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        throw { status: 401, message: "Unauthorized" };
    }
    return userId;
}

export async function registerMyDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const device = await registerDevice({
            userId: parseAuthenticatedUserId(req),
            platform: req.body.platform,
            pushToken: req.body.pushToken,
            deviceName: req.body.deviceName,
        });
        res.status(201).json(device);
    } catch (error) {
        next(error);
    }
}

export async function listMyDevices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const devices = await getMyDevices(parseAuthenticatedUserId(req));
        res.status(200).json(devices);
    } catch (error) {
        next(error);
    }
}

export async function deleteMyDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const deviceId = Number(req.params.id);
        if (!Number.isInteger(deviceId) || deviceId <= 0) {
            throw { status: 400, message: "Invalid device id" };
        }

        await unregisterDevice({
            userId: parseAuthenticatedUserId(req),
            deviceId,
        });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
