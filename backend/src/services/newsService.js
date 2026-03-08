import Parser from "rss-parser";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";

const prisma = new PrismaClient();
const parser = new Parser();

const NEWS_SOURCES = [
    {
        url: "https://openai.com/blog/rss.xml",
        name: "OpenAI Blog",
        region: "world",
    },
    {
        url: "https://huggingface.co/blog/feed.xml",
        name: "Hugging Face",
        region: "world",
    },
    {
        url: "https://www.deepmind.com/blog/feed",
        name: "DeepMind Blog",
        region: "world",
    },
    {
        url: "https://www.heise.de/rss/heise-atom.xml",
        name: "Heise Online",
        region: "de",
    },
    {
        url: "https://t3n.de/rss.xml",
        name: "t3n",
        region: "de",
    },
];

/**
 * Auto-detect tag from title keywords
 */
const detectTag = (title) => {
    const titleLower = title.toLowerCase();

    if (/gpt|llm|claude|gemini|model|language/.test(titleLower)) {
        return "llm";
    }
    if (/open source|github|hugging|framework|library/.test(titleLower)) {
        return "open";
    }
    if (/regulation|law|eu|gdpr|bias|ethics|safety/.test(titleLower)) {
        return "reg";
    }
    if (/tool|app|launch|release|product|feature/.test(titleLower)) {
        return "tool";
    }
    return "research";
};

/**
 * Fetch articles from a single RSS feed with error handling
 */
const fetchFromSource = async (source) => {
    try {
        console.log(`Fetching from ${source.name}...`);
        const feed = await parser.parseURL(source.url);

        const articles = [];
        for (const item of feed.items || []) {
            try {
                const url = item.link || item.guid;

                // Skip if URL already exists
                const existing = await prisma.newsArticle.findUnique({
                    where: { url },
                });
                if (existing) continue;

                // Create article with auto-detected tag
                const tag = detectTag(item.title || "");

                const article = await prisma.newsArticle.create({
                    data: {
                        title: item.title || "Untitled",
                        url: url,
                        source: source.name,
                        tag: tag,
                        region: source.region,
                        publishedAt: item.pubDate
                            ? new Date(item.pubDate)
                            : new Date(),
                    },
                });

                articles.push(article);
            } catch (itemErr) {
                // Skip individual items that fail, continue with others
                console.warn(
                    `Error processing item from ${source.name}:`,
                    itemErr.message,
                );
            }
        }

        console.log(`✓ Added ${articles.length} articles from ${source.name}`);
        return articles.length;
    } catch (err) {
        console.error(`✗ Error fetching ${source.name}:`, err.message);
        return 0;
    }
};

/**
 * Sync all RSS feeds
 */
export const syncNewsFeeds = async () => {
    console.log(`\n[${new Date().toISOString()}] Starting news sync...`);

    let totalAdded = 0;

    for (const source of NEWS_SOURCES) {
        try {
            const count = await fetchFromSource(source);
            totalAdded += count;
        } catch (err) {
            console.error(`Fatal error with ${source.name}:`, err.message);
        }
    }

    console.log(`Sync complete. Total new articles: ${totalAdded}\n`);
    return totalAdded;
};

/**
 * Initialize automatic news sync (every 2 hours)
 */
export const initializeNewsCron = () => {
    // Run every 2 hours at minute 0
    cron.schedule("0 */2 * * *", async () => {
        await syncNewsFeeds();
    });

    console.log("✓ News sync cron scheduled (every 2 hours)");
};

export default { syncNewsFeeds, initializeNewsCron };
