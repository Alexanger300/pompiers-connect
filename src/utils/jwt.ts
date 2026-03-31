import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/env";

export type TokenPayload = JwtPayload & { sub: string; role: string };

const accessSecret = config.jwtAccessSecret;
const refreshSecret = config.jwtRefreshSecret;

export function signAccessToken(userId: string, role: string = "agent"): string {
    return jwt.sign({ sub: userId, role }, accessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, refreshSecret, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, refreshSecret) as TokenPayload;
}
