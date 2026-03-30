import { Router } from "express";

import { authenticate } from "../auth/auth.middleware";
import { deleteUserById, getUserById, patchUserById } from "./users.controller";

const router = Router();

router.get("/:id", authenticate, getUserById);
router.patch("/:id", authenticate, patchUserById);
router.delete("/:id", authenticate, deleteUserById);

export default router;
