import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import {
    deleteUserById,
    getUserById,
    patchUserById,
    postEmailToUserById,
} from "./users.controller";

const router = Router();

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
