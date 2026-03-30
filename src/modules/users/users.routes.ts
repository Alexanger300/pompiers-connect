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

export default router;
