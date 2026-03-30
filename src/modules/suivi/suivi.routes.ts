import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { requireRole } from "../auth/auth.authorization";
import {
    getSuiviForUser,
    getSuiviDetail,
    updateSuivi,
    listFormationItems,
    getFormationItem,
} from "./suivi.controller";

const router = Router();

// Public routes for listing and fetching formation items
router.get("/formation-items", authenticate, listFormationItems);
router.get("/formation-items/:id", authenticate, getFormationItem);

// Routes for current user's suivis
router.get("/", authenticate, getSuiviForUser);
router.get("/:id", authenticate, getSuiviDetail);

// Protected routes - only admin/superviseur can modify
router.patch("/:id", authenticate, requireRole("admin", "superviseur"), updateSuivi);

export default router;
