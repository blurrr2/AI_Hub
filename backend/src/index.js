import dotenv from "dotenv";
import app from "./app.js";
import { initializeNewsCron, syncNewsFeeds } from "./services/newsService.js";

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Initialize news cron job (every 2 hours)
    initializeNewsCron();

    // Run initial sync on startup
    syncNewsFeeds().catch((err) => {
        console.error("Initial news sync failed:", err);
    });
});
