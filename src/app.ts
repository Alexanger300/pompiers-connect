import cors from "cors";
import express from "express";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import suiviRoutes from "./modules/suivi/suivi.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ message: "API running" });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/suivi", suiviRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
