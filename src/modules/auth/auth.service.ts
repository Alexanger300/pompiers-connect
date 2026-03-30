import crypto from "crypto";

import { config } from "../../config/env";
import {
    createSession,
    createUser,
    findSessionByRefreshTokenHash,
    findUserByEmail,
    findUserById,
    revokeSession,
    rotateSession,
} from "./auth.repository";
import { comparePassword, hashPassword } from "../../utils/hash";
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} from "../../utils/jwt";

type PublicUser = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
};

type AuthResult = {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
};

type RefreshResult = {
    accessToken: string;
    refreshToken: string;
};

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

function validateEmailAndPassword(email: string, password: string): void {
    if (!email || !password) {
        createHttpError(400, "Email and password are required");
    }

    if (password.length < 8) {
        createHttpError(400, "Password must be at least 8 characters long");
    }
}

function hashRefreshToken(token: string): string {
    // Deterministic hash lets us find/revoke sessions without storing raw token.
    return crypto.createHash("sha256").update(token).digest("hex");
}

function getSessionExpiryDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + config.sessionExpiryDays);
    return date;
}

function parseUserId(userId: string): number {
    const parsed = Number(userId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        createHttpError(401, "Invalid token payload");
    }
    return parsed;
}

function toPublicUser(user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
}): PublicUser {
    return {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
    };
}

export async function registerUser(
    email: string,
    password: string,
    nom?: string,
    prenom?: string,
    telephone?: string,
    deviceName?: string,
    role?: string,
): Promise<AuthResult> {
    validateEmailAndPassword(email, password);

    if (!nom || !prenom) {
        createHttpError(400, "Nom and prenom are required");
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
        createHttpError(409, "Email already in use");
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, nom, prenom, telephone, role });

    const accessToken = signAccessToken(String(user.id), user.role);
    const refreshToken = signRefreshToken(String(user.id));

    await createSession({
        userId: user.id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        deviceName,
        expiresAt: getSessionExpiryDate(),
    });

    return {
        user: toPublicUser(user),
        accessToken,
        refreshToken,
    };
}

export async function loginUser(
    email: string,
    password: string,
    deviceName?: string,
): Promise<AuthResult> {
    if (!email || !password) {
        createHttpError(400, "Email and password are required");
    }

    const user = await findUserByEmail(email);
    if (!user) {
        createHttpError(401, "Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        createHttpError(401, "Invalid credentials");
    }

    const accessToken = signAccessToken(String(user.id), user.role);
    const refreshToken = signRefreshToken(String(user.id));

    await createSession({
        userId: user.id,
        refreshTokenHash: hashRefreshToken(refreshToken),
        deviceName,
        expiresAt: getSessionExpiryDate(),
    });

    return {
        user: toPublicUser(user),
        accessToken,
        refreshToken,
    };
}

export async function refreshSession(refreshToken: string): Promise<RefreshResult> {
    if (!refreshToken) {
        createHttpError(400, "Refresh token is required");
    }

    const payload = verifyRefreshToken(refreshToken);
    const userId = parseUserId(payload.sub);
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await findSessionByRefreshTokenHash(refreshTokenHash);

    if (!session || session.userId !== userId) {
        createHttpError(401, "Invalid refresh token");
    }

    if (session.revokedAt) {
        createHttpError(401, "Session revoked");
    }

    if (session.expiresAt <= new Date()) {
        createHttpError(401, "Session expired");
    }

    const user = await findUserById(userId);
    if (!user) {
        createHttpError(401, "User not found");
    }

    const newAccessToken = signAccessToken(String(userId), user.role);
    const newRefreshToken = signRefreshToken(String(userId));

    await rotateSession(session.id, {
        refreshTokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: getSessionExpiryDate(),
        lastUsedAt: new Date(),
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
}

export async function logoutUser(refreshToken: string): Promise<void> {
    if (!refreshToken) {
        createHttpError(400, "Refresh token is required");
    }

    const payload = verifyRefreshToken(refreshToken);
    const userId = parseUserId(payload.sub);
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await findSessionByRefreshTokenHash(refreshTokenHash);

    if (!session || session.userId !== userId || session.revokedAt) {
        createHttpError(401, "Invalid refresh token");
    }

    await revokeSession(session.id);
}

export async function getMe(userId: string) {
    const user = await findUserById(parseUserId(userId));

    if (!user) {
        createHttpError(404, "User not found");
    }

    return toPublicUser(user);
}
