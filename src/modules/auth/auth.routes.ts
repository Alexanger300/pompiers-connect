import { Router } from "express";

import { authenticate } from "./auth.middleware";
import { requireRole } from "./auth.authorization";
import { login, logout, me, refresh, register } from "./auth.controller";

const router = Router();

router.post("/register", authenticate, requireRole("admin", "superviseur"), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
