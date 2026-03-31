import { NextFunction, Request, Response } from "express";

import {
    broadcastNotificationToOthers,
    getNotifications,
    removeNotification,
    sendNotificationToRecipients,
} from "./notifications.service";

function parseAuthenticatedUserId(req: Request): number {
    const userId = Number(req.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        throw { status: 401, message: "Unauthorized" };
    }
    return userId;
}

export async function postTargetedNotificationRequest(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await sendNotificationToRecipients({
            senderUserId: parseAuthenticatedUserId(req),
            senderRole: req.userRole,
            recipientUserIds: req.body.recipientUserIds,
            title: req.body.title,
            message: req.body.message,
            data: req.body.data,
        });

        res.status(202).json({
            message: "Targeted notification requested",
            id: result.id,
            recipients: result.recipients,
        });
    } catch (error) {
        next(error);
    }
}

export async function postBroadcastNotificationRequest(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const result = await broadcastNotificationToOthers({
            senderUserId: parseAuthenticatedUserId(req),
            senderRole: req.userRole,
            title: req.body.title,
            message: req.body.message,
            data: req.body.data,
        });

        res.status(202).json({
            message: "Broadcast notification requested",
            id: result.id,
            recipients: result.recipients,
        });
    } catch (error) {
        next(error);
    }
}

export async function listNotificationsController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
        const status = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
        const notifications = await getNotifications({
            senderUserId: parseAuthenticatedUserId(req),
            senderRole: req.userRole,
            type: typeof type === "string" ? type : undefined,
            status: typeof status === "string" ? status : undefined,
        });
        res.status(200).json(notifications);
    } catch (error) {
        next(error);
    }
}

export async function deleteNotificationController(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            throw { status: 400, message: "Invalid notification id" };
        }

        await removeNotification({
            senderRole: req.userRole,
            id,
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}
