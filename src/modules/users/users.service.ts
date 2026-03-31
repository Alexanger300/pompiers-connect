import { deleteUserById, findUserById, listUsers, updateUserById } from "./users.repository";
import { sendMailTo } from "../../utils/mailer";

function createHttpError(status: number, message: string): never {
    throw { status, message };
}

export async function getUser(id: number) {
    const user = await findUserById(id);

    if (!user) {
        createHttpError(404, "User not found");
    }

    return user;
}

export async function getAllUsers() {
    return listUsers();
}

export async function updateUser(
    id: number,
    payload: { nom?: string; prenom?: string; email?: string; telephone?: string },
) {
    if (!payload.email && !payload.nom && !payload.prenom && payload.telephone === undefined) {
        createHttpError(400, "At least one field is required");
    }

    try {
        return await updateUserById(id, payload);
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505") {
            createHttpError(409, "Email already in use");
        }
        throw error;
    }
}

export async function updateUserRole(
    id: number,
    payload: { role?: string },
) {
    const role = payload.role?.trim();
    if (!role || !["agent", "superviseur", "admin"].includes(role)) {
        createHttpError(400, "role must be one of: agent, superviseur, admin");
    }

    const user = await findUserById(id);
    if (!user) {
        createHttpError(404, "User not found");
    }

    try {
        return await updateUserById(id, { role });
    } catch (error) {
        throw error;
    }
}

export async function removeUser(id: number): Promise<void> {
    const user = await findUserById(id);

    if (!user) {
        createHttpError(404, "User not found");
    }

    await deleteUserById(id);
}

export async function sendEmailToUser(
    id: number,
    payload: { subject?: string; message?: string },
): Promise<void> {
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!subject || !message) {
        createHttpError(400, "subject and message are required");
    }

    const user = await findUserById(id);

    if (!user) {
        createHttpError(404, "User not found");
    }

    await sendMailTo(user.email, subject, message);
}
