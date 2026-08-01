const fs = require("fs/promises");
const path = require("path");

const TEMP_DIR = path.join(__dirname, "../../temp");

// Delete folders older than 1 hour
const MAX_AGE = 60 * 60 * 1000;

async function cleanupTemp() {
    try {
        const entries = await fs.readdir(TEMP_DIR, { withFileTypes: true });

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const folder = path.join(TEMP_DIR, entry.name);

            try {
                const stat = await fs.stat(folder);

                if (Date.now() - stat.mtimeMs > MAX_AGE) {
                    await fs.rm(folder, {
                        recursive: true,
                        force: true,
                    });

                    console.log(`Deleted stale temp folder: ${entry.name}`);
                }
            } catch (err) {
                console.error(`Failed to clean ${entry.name}:`, err.message);
            }
        }
    } catch (err) {
        // temp directory may not exist yet
    }
}

function startTempCleanup() {
    // Run once when server starts
    cleanupTemp();

    // Then every 30 minutes
    setInterval(cleanupTemp, 30 * 60 * 1000);
}

module.exports = {
    startTempCleanup,
};