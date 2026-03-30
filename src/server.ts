import "dotenv/config";

import app from "./app";
import { config } from "./config/env";
import { initializeServices } from "./utils/initialization";

(async () => {
    // Initialize services and check connections
    await initializeServices();

    app.listen(config.port, () => {
        console.log(`🎯 Server running on port ${config.port}`);
    });
})();
