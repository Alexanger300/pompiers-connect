import { Router } from "express";

import { authenticate } from "./auth.middleware";
import { requireRole } from "./auth.authorization";
import { login, logout, me, refresh, register } from "./auth.controller";

const router = Router();

router.post("/register", authenticate, requireRole("admin", "superviseur"), register);
router.all("/register", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /auth/register" });
});

router.post("/login", login);
router.all("/login", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /auth/login" });
});

router.post("/refresh", refresh);
router.all("/refresh", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /auth/refresh" });
});

router.post("/logout", logout);
router.all("/logout", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /auth/logout" });
});

router.get("/me", authenticate, me);
router.all("/me", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /auth/me" });
});

export default router;
