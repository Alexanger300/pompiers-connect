import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import {
    deleteUserById,
    getUserById,
    listUsersController,
    patchUserById,
    patchUserRoleById,
    postEmailToUserById,
} from "./users.controller";
import { requireRole } from "../auth/auth.authorization";

const router = Router();

router.get("/", authenticate, requireRole("admin", "superviseur"), listUsersController);
router.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /users" });
});

router.patch("/:id/role", authenticate, requireRole("admin"), patchUserRoleById);
router.all("/:id/role", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use PATCH /users/:id/role" });
});

router.get("/:id", authenticate, getUserById);
router.patch("/:id", authenticate, patchUserById);
router.delete("/:id", authenticate, deleteUserById);

router.post("/:id/email", authenticate, postEmailToUserById);
router.all("/:id/email", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use POST /users/:id/email" });
});

router.all("/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET, PATCH or DELETE /users/:id" });
});

export default router;
