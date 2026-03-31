import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { deleteMyDevice, listMyDevices, registerMyDevice } from "./devices.controller";

const router = Router();

router.get("/", authenticate, listMyDevices);
router.post("/", authenticate, registerMyDevice);
router.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET or POST /devices" });
});

router.delete("/:id", authenticate, deleteMyDevice);
router.all("/:id", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use DELETE /devices/:id" });
});

export default router;
