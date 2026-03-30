import { deleteUserById, findUserById, updateUserById } from "./users.repository";

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

export async function removeUser(id: number): Promise<void> {
    const user = await findUserById(id);

    if (!user) {
        createHttpError(404, "User not found");
    }

    await deleteUserById(id);
}
