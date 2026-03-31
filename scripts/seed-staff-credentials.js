const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { createClient } = require("@supabase/supabase-js");

const SALT_ROUNDS = 10;
const DEFAULT_ADMIN_EMAIL = "admin@pompiers-connect.local";
const DEFAULT_SUPERVISEUR_EMAIL = "superviseur@pompiers-connect.local";

function stripWrappingQuotes(value) {
    if (
        value.length >= 2 &&
        ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
    ) {
        return value.slice(1, -1);
    }
    return value;
}

function loadEnvFile() {
    const envPath = path.resolve(__dirname, "..", ".env");
    if (!fs.existsSync(envPath)) {
        return;
    }

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}

function getEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function getOptionalEnv(key, fallback) {
    const value = process.env[key];
    return value && value.trim() ? value.trim() : fallback;
}

function generatePassword(length = 20) {
    const alphabet =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=";
    const bytes = crypto.randomBytes(length);

    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function maskPassword(password) {
    return `${password.slice(0, 4)}${"*".repeat(Math.max(password.length - 8, 0))}${password.slice(-4)}`;
}

async function findUserByEmail(supabase, email) {
    const { data, error } = await supabase
        .from("users")
        .select("id, email, role")
        .eq("email", email)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to find user ${email}: ${error.message}`);
    }

    return data;
}

async function createUser(supabase, user) {
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const payload = {
        email: user.email,
        password_hash: passwordHash,
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        role: user.role,
    };

    const { data, error } = await supabase
        .from("users")
        .insert(payload)
        .select("id, email, role")
        .single();

    if (error) {
        throw new Error(`Failed to create user ${user.email}: ${error.message}`);
    }

    return { user: data, password };
}

async function ensureUser(supabase, user) {
    const existingUser = await findUserByEmail(supabase, user.email);
    if (existingUser) {
        return { created: false, user: existingUser };
    }

    const created = await createUser(supabase, user);
    return { created: true, user: created.user, password: created.password };
}

async function main() {
    loadEnvFile();

    const supabaseUrl = getEnv("VITE_SUPABASE_URL");
    const supabaseKey = getEnv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const staffUsers = [
        {
            label: "Admin",
            role: "admin",
            email: getOptionalEnv("SEED_ADMIN_EMAIL", DEFAULT_ADMIN_EMAIL),
            nom: getOptionalEnv("SEED_ADMIN_NOM", "Systeme"),
            prenom: getOptionalEnv("SEED_ADMIN_PRENOM", "Admin"),
            telephone: getOptionalEnv("SEED_ADMIN_TELEPHONE", null),
        },
        {
            label: "Superviseur",
            role: "superviseur",
            email: getOptionalEnv("SEED_SUPERVISEUR_EMAIL", DEFAULT_SUPERVISEUR_EMAIL),
            nom: getOptionalEnv("SEED_SUPERVISEUR_NOM", "Systeme"),
            prenom: getOptionalEnv("SEED_SUPERVISEUR_PRENOM", "Superviseur"),
            telephone: getOptionalEnv("SEED_SUPERVISEUR_TELEPHONE", null),
        },
    ];

    console.log("");
    console.log("Seeding staff credentials...");

    for (const staffUser of staffUsers) {
        const result = await ensureUser(supabase, staffUser);

        if (!result.created) {
            console.log(
                `[SKIP] ${staffUser.label} already exists: ${result.user.email} (${result.user.role})`,
            );
            continue;
        }

        console.log(`[CREATED] ${staffUser.label}`);
        console.log(`  email: ${result.user.email}`);
        console.log(`  password: ${result.password}`);
        console.log(`  role: ${result.user.role}`);
        console.log(`  masked password: ${maskPassword(result.password)}`);
    }

    console.log("Done.");
    console.log("");
}

main().catch((error) => {
    console.error("");
    console.error("Seed failed.");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("");
    process.exit(1);
});
