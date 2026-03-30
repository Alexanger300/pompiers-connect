import { supabase } from "../config/supabase";

async function checkDatabaseConnection(): Promise<boolean> {
    try {
        // Simple health check - try to access users table metadata
        const { data, error } = await supabase
            .from("users")
            .select("id")
            .limit(1);

        if (error) {
            console.error("❌ Database connection failed:", error.message);
            return false;
        }

        console.log("✅ Database connection successful");
        return true;
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("❌ Database connection error:", errorMsg);
        return false;
    }
}

export async function initializeServices(): Promise<void> {
    console.log("\n🚀 Initializing services...");
    console.log("📍 Environment:", process.env.NODE_ENV || "development");
    console.log("📡 Supabase URL:", process.env.VITE_SUPABASE_URL);

    await checkDatabaseConnection();

    console.log("✨ Services initialized\n");
}
