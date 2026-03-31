import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../auth/auth.authorization";
import {
    getSuiviForUser,
    getSuiviDetail,
    updateSuivi,
    listFormationItems,
    getFormationItem,
    listAllSuivis,
    listPendingSuivis,
} from "./suivi.controller";

const router = Router();

router.get("/admin", authenticate, requireRole("admin", "superviseur"), listAllSuivis);
router.all("/admin", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /suivi/admin" });
});

router.get("/pending", authenticate, requireRole("admin", "superviseur"), listPendingSuivis);
router.all("/pending", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /suivi/pending" });
});

// Public routes for listing and fetching formation items
router.get("/formation-items", authenticate, listFormationItems);
router.all("/formation-items", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /suivi/formation-items" });
});

router.get("/formation-items/:id", authenticate, getFormationItem);
router.all("/formation-items/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /suivi/formation-items/:id" });
});

// Routes for current user's suivis
router.get("/", authenticate, getSuiviForUser);
router.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /suivi" });
});

router.get("/:id", authenticate, getSuiviDetail);

// Protected routes - only admin/superviseur can modify
router.patch("/:id", authenticate, requireRole("admin", "superviseur"), updateSuivi);
router.all("/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET or PATCH /suivi/:id" });
});

export default router;
