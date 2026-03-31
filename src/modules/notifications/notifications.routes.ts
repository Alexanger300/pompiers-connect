import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../auth/auth.authorization";
import {
    deleteNotificationController,
    listNotificationsController,
    postBroadcastNotificationRequest,
    postNotificationCallbackRequest,
} from "./notifications.controller";

const router = Router();

router.get("/", authenticate, requireRole("admin", "superviseur"), listNotificationsController);
router.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /notifications" });
});

router.post(
    "/callback",
    authenticate,
    requireRole("admin", "superviseur"),
    postNotificationCallbackRequest,
);
router.all("/callback", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /notifications/callback" });
});

router.post(
    "/broadcast",
    authenticate,
    requireRole("admin", "superviseur"),
    postBroadcastNotificationRequest,
);
router.all("/broadcast", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /notifications/broadcast" });
});

router.delete(
    "/:id",
    authenticate,
    requireRole("admin", "superviseur"),
    deleteNotificationController,
);
router.all("/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use DELETE /notifications/:id" });
});

export default router;
