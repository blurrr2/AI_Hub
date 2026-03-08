import axios from "axios";
import { load } from "cheerio";

/**
 * Detect resource type from URL
 */
const detectType = (url) => {
    const urlLower = url.toLowerCase();

    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
        return "YouTube";
    }
    if (urlLower.includes("bilibili.com")) {
        return "Bilibili";
    }
    if (urlLower.includes("arxiv.org")) {
        return "arXiv";
    }
    if (urlLower.includes("github.com")) {
        return "GitHub";
    }
    if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
        return "X";
    }

    return "Article";
};

/**
 * Scrape URL metadata: title and type
 */
export const scrapeUrl = async (url) => {
    try {
        const type = detectType(url);
        let title = "Untitled Resource";

        try {
            // Fetch the page with a timeout
            const response = await axios.get(url, {
                timeout: 8000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                },
            });

            // Parse HTML and extract og:title
            const $ = load(response.data);
            const ogTitle = $('meta[property="og:title"]').attr("content");

            if (ogTitle) {
                title = ogTitle;
            } else {
                // Fallback to page title
                const pageTitle = $("title").text();
                if (pageTitle) {
                    title = pageTitle;
                }
            }
        } catch (err) {
            console.warn(
                `Warning: Could not fetch title from ${url}:`,
                err instanceof Error ? err.message : "Unknown error",
            );
            // Return detected type even if scraping fails
        }

        return { title, type };
    } catch (err) {
        console.error("Error in scrapeUrl:", err);
        return {
            title: "Untitled Resource",
            type: "Article",
        };
    }
};

export default { scrapeUrl };
