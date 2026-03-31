import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../auth/auth.authorization";
import {
    createDisponibiliteController,
    listDisponibilitesController,
    patchDisponibiliteController,
    rejectDisponibiliteController,
    validateDisponibiliteController,
} from "./disponibilites.controller";

const router = Router();

router.get("/", authenticate, listDisponibilitesController);
router.post("/", authenticate, createDisponibiliteController);
router.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET or POST /disponibilites" });
});

router.patch("/:id", authenticate, patchDisponibiliteController);
router.all("/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use PATCH /disponibilites/:id" });
});

router.patch(
    "/:id/validate",
    authenticate,
    requireRole("admin", "superviseur"),
    validateDisponibiliteController,
);
router.all("/:id/validate", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use PATCH /disponibilites/:id/validate" });
});

router.patch(
    "/:id/reject",
    authenticate,
    requireRole("admin", "superviseur"),
    rejectDisponibiliteController,
);
router.all("/:id/reject", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use PATCH /disponibilites/:id/reject" });
});

export default router;
