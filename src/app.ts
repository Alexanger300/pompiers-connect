import cors from "cors";
import express from "express";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import suiviRoutes from "./modules/suivi/suivi.routes";
import disponibilitesRoutes from "./modules/disponibilites/disponibilites.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ message: "API running" });
});
app.all("/", (_req, res) => {
    res.status(405).json({ message: "Method not allowed. Use GET /" });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/suivi", suiviRoutes);
app.use("/disponibilites", disponibilitesRoutes);
app.use("/notifications", notificationsRoutes);

// Compatibility prefix for environments/frontends that call routes under /api.
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/suivi", suiviRoutes);
app.use("/api/disponibilites", disponibilitesRoutes);
app.use("/api/notifications", notificationsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
