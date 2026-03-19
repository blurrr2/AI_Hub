import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import { useIsMobile } from "../hooks/useIsMobile";

interface Article {
    id: number;
    title: string;
    url: string;
    source: string;
    tag: string;
    region: string;
    publishedAt: string;
    createdAt: string;
}

interface Toast {
    id: string;
    message: string;
    type: "success" | "error";
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

interface QueryParams {
    region: string;
    page: number;
    limit: number;
    tag?: string;
    search?: string;
}

export const NewsFeed: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isMobile = useIsMobile();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Filters
    const [region, setRegion] = useState("world");
    const [tag, setTag] = useState("");
    const [search, setSearch] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 10;

    // Bookmarks state
    const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<number>>(
        new Set(),
    );
    const [toasts, setToasts] = useState<Toast[]>([]);

    // AI Summary state
    const [summaries, setSummaries] = useState<Record<string, string>>({});
    const [loadingSummary, setLoadingSummary] = useState<Record<string, boolean>>({});

    const tags = ["llm", "open", "reg", "tool", "research"];

    // Refreshing state
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            // Trigger news sync
            await axios.post("/api/news/sync");
            // Reload articles
            await fetchArticles(1);
            showToast("News synced successfully!");
        } catch (err) {
            console.error("Sync failed:", err);
            showToast("Failed to sync news", "error");
        } finally {
            setTimeout(() => setRefreshing(false), 1000);
        }
    };

    // Toast helper
    const showToast = (
        message: string,
        type: "success" | "error" = "success",
    ) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // Load bookmarked articles
    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await axios.get("/api/news/bookmarks", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const bookmarkedIds = new Set<number>(
                    (response.data.data as Article[]).map(
                        (article) => article.id,
                    ),
                );
                setBookmarkedArticles(bookmarkedIds);
            } catch (err) {
                console.error("Failed to load bookmarks:", err);
            }
        };

        loadBookmarks();
    }, []);

    // Fetch articles - wrapped in useCallback to avoid dependency issues
    const fetchArticles = useCallback(
        async (page: number = 1) => {
            try {
                setLoading(true);
                setError("");

                // If bookmarks tab is selected, use bookmarks endpoint
                if (region === "bookmarks") {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        setError("Please log in to view bookmarks");
                        setLoading(false);
                        return;
                    }

                    const response = await axios.get("/api/news/bookmarks", {
                        params: {
                            page,
                            limit: 100,
                        },
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    setArticles(response.data.data);
                    setPagination(response.data.pagination);
                } else {
                    const params: QueryParams = {
                        region,
                        page,
                        limit: 100,
                    };

                    if (tag) params.tag = tag;
                    if (search) params.search = search;

                    const response = await axios.get("/api/news", { params });
                    setArticles(response.data.data);
                    setPagination(response.data.pagination);
                }
            } catch (err) {
                setError("Failed to fetch articles");
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [region, tag, search],
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, region, tag]);

    // Handle bookmark toggle
    const handleBookmark = async (e: React.MouseEvent, articleId: number) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                showToast("Please log in to bookmark articles", "error");
                return;
            }

            const response = await axios.post(
                `/api/news/${articleId}/bookmark`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            const isBookmarked = response.data.bookmarked;

            setBookmarkedArticles((prev) => {
                const newSet = new Set(prev);
                if (isBookmarked) {
                    newSet.add(articleId);
                    showToast("Saved to bookmarks");
                } else {
                    newSet.delete(articleId);
                    showToast("Removed from bookmarks");
                }
                return newSet;
            });
        } catch (err) {
            console.error("Bookmark error:", err);
            if (axios.isAxiosError(err)) {
                console.error("Bookmark error response:", err.response?.data);
            }
            showToast("Failed to update bookmark", "error");
        }
    };

    const generateSummary = async (article: Article) => {
        if (summaries[article.id]) return; // already generated
        setLoadingSummary(prev => ({...prev, [article.id]: true}));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/ai/generate', {
                prompt: `Summarize this article in 2-3 sentences:\nTitle: ${article.title}\nSource: ${article.source}`,
                maxTokens: 150
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const summary = response.data.text || 'Could not generate summary';
            setSummaries(prev => ({...prev, [article.id]: summary}));
        } catch {
            setSummaries(prev => ({...prev, [article.id]: 'Failed to generate summary'}));
        } finally {
            setLoadingSummary(prev => ({...prev, [article.id]: false}));
        }
    };

    // Initial load and when filters change
    useEffect(() => {
        fetchArticles(1);
    }, [fetchArticles]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchArticles(1);
    };

    const getTagColor = (t: string) => {
        const colors: Record<string, string> = {
            llm: "#0066cc",
            open: "#10b981",
            reg: "#8b5cf6",
            tool: "#f59e0b",
            research: "#666",
        };
        return colors[t] || "#666";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                return `${diffMinutes}m ago`;
            }
            return `${diffHours}h ago`;
        }
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    };

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
            }}
        >
            <style>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
            {!isMobile && (
                <div className="sidebar">
                    <Sidebar user={user} onLogout={handleLogout} />
                </div>
            )}

            {/* RIGHT MAIN CONTENT */}
            <div
                className="main-content"
                style={{
                    flex: 1,
                    background: "var(--bg)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    marginTop: isMobile ? '52px' : 0,
                    marginBottom: isMobile ? '60px' : 0,
                }}
            >
                {/* TOPBAR - Title, Search, Updated, Refresh */}
                <div
                    style={{
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        padding: "18px 28px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        minHeight: "52px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: 20,
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        News Feed
                    </div>

                    {/* Divider */}
                    <div
                        style={{
                            width: "1px",
                            height: "24px",
                            background: "var(--border)",
                        }}
                    />

                    {/* Search */}
                    <form
                        onSubmit={handleSearch}
                        style={{
                            display: "flex",
                            gap: 8,
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "180px",
                                padding: "8px 12px",
                                borderRadius: "4px",
                                border: "1px solid var(--border)",
                                background: "var(--bg)",
                                fontSize: "13px",
                                color: "var(--ink)",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "4px",
                                border: "1px solid #c8401a",
                                background: "#c8401a",
                                color: "var(--surface)",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#a83018";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#c8401a";
                            }}
                        >
                            Search
                        </button>
                    </form>

                    {/* Updated X ago */}
                    <div
                        style={{
                            fontSize: "12px",
                            color: "var(--ink3)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Updated just now
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--ink2)",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                "var(--surface2)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--bg)";
                        }}
                    >
                        <span className={refreshing ? "spinning" : ""}>↻</span>{" "}
                        Refresh
                    </button>
                </div>

                {/* TAB BAR - Region Tabs + Tag Pills */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border)",
                        padding: "0 28px",
                        background: "var(--surface)",
                        flexShrink: 0,
                        minHeight: "44px",
                    }}
                >
                    {/* Region Tabs on Left */}
                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            alignItems: "center",
                        }}
                    >
                        {[
                            { label: " All", value: "all" },
                            { label: " Worldwide", value: "world" },
                            { label: "🇩🇪 Germany", value: "de" },
                            { label: " Bookmarks", value: "bookmarks" },
                        ].map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRegion(r.value)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    padding: "12px 0",
                                    fontSize: "13px",
                                    fontWeight: region === r.value ? 600 : 400,
                                    color:
                                        region === r.value ? "#c8401a" : "#999",
                                    cursor: "pointer",
                                    borderBottom:
                                        region === r.value
                                            ? "2px solid #c8401a"
                                            : "2px solid transparent",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    if (region !== r.value) {
                                        e.currentTarget.style.color = "#666";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (region !== r.value) {
                                        e.currentTarget.style.color = "#999";
                                    }
                                }}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    {/* Tag Pills on Right */}
                    <div
                        style={{
                            marginLeft: "auto",
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            padding: "6px 0",
                            overflowX: "auto",
                            flexWrap: "nowrap",
                            scrollbarWidth: "none",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        {tags.map((t) => (
                            <button
                                key={t}
                                onClick={() => setTag(tag === t ? "" : t)}
                                style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    border: "1px solid",
                                    background:
                                        tag === t
                                            ? getTagColor(t)
                                            : "var(--surface2)",
                                    color:
                                        tag === t
                                            ? "var(--surface)"
                                            : getTagColor(t),
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    borderColor:
                                        tag === t
                                            ? getTagColor(t)
                                            : "var(--border)",
                                    textTransform: "capitalize",
                                }}
                                onMouseEnter={(e) => {
                                    if (tag !== t) {
                                        e.currentTarget.style.borderColor =
                                            getTagColor(t);
                                        e.currentTarget.style.background =
                                            "var(--surface2)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (tag !== t) {
                                        e.currentTarget.style.borderColor =
                                            "var(--border)";
                                        e.currentTarget.style.background =
                                            "var(--surface2)";
                                    }
                                }}
                            >
                                {t === "llm"
                                    ? "LLM"
                                    : t === "open"
                                      ? "Open Source"
                                      : t === "reg"
                                        ? "Regulation"
                                        : t === "tool"
                                          ? "Tools"
                                          : "Research"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Count Info */}
                <div
                    style={{
                        fontSize: "12px",
                        color: "#999",
                        padding: "12px 24px",
                        background: "var(--bg)",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    {pagination.total} articles
                </div>

                {/* Articles List */}
                <div
                    style={{
                        flex: 1,
                        padding: "20px 24px",
                        overflowY: "auto",
                        WebkitOverflowScrolling: "touch"
                    }}
                >
                    {error && (
                        <div
                            style={{
                                padding: "12px 16px",
                                borderRadius: "6px",
                                background: "#fee",
                                color: "#c00",
                                fontSize: "13px",
                                marginBottom: "16px",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div
                            style={{
                                textAlign: "center",
                                color: "#999",
                                padding: "40px",
                            }}
                        >
                            Loading articles...
                        </div>
                    ) : articles.length === 0 ? (
                        <div
                            style={{
                                textAlign: "center",
                                color: "#999",
                                padding: "40px",
                            }}
                        >
                            No articles found
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 12,
                            }}
                        >
                            {articles
                                .slice(
                                    (currentPage - 1) * articlesPerPage,
                                    currentPage * articlesPerPage,
                                )
                                .map((article) => {
                                const isBookmarked = bookmarkedArticles.has(
                                    article.id,
                                );
                                return (
                                    <a
                                        key={article.id}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            position: "relative",
                                            display: "flex",
                                            padding: "16px",
                                            background: isBookmarked
                                                ? "#fffbf7"
                                                : "var(--surface)",
                                            borderRadius: "8px",
                                            border: isBookmarked
                                                ? "2px solid #ffd699"
                                                : "1px solid var(--border)",
                                            textDecoration: "none",
                                            color: "inherit",
                                            transition: "all 0.2s",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor =
                                                isBookmarked
                                                    ? "#ffc966"
                                                    : "#c8401a";
                                            e.currentTarget.style.boxShadow =
                                                isBookmarked
                                                    ? "0 2px 8px rgba(255, 214, 153, 0.2)"
                                                    : "0 2px 8px rgba(200, 64, 26, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor =
                                                isBookmarked
                                                    ? "#ffd699"
                                                    : "var(--border)";
                                            e.currentTarget.style.boxShadow =
                                                "none";
                                        }}
                                    >
                                        {/* Bookmark Button - Top Right */}
                                        <button
                                            onClick={(e) =>
                                                handleBookmark(e, article.id)
                                            }
                                            style={{
                                                position: "absolute",
                                                top: "12px",
                                                right: "12px",
                                                background: "none",
                                                border: "none",
                                                fontSize: "18px",
                                                cursor: "pointer",
                                                padding: "4px",
                                                color: isBookmarked
                                                    ? "#f59e0b"
                                                    : "#ccc",
                                                transition: "all 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color =
                                                    isBookmarked
                                                        ? "#fbbf24"
                                                        : "#999";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color =
                                                    isBookmarked
                                                        ? "#f59e0b"
                                                        : "#ccc";
                                            }}
                                            title={
                                                isBookmarked
                                                    ? "Remove bookmark"
                                                    : "Add bookmark"
                                            }
                                        >
                                            {isBookmarked ? "" : ""}
                                        </button>

                                        <div
                                            style={{
                                                flex: 1,
                                                paddingRight: "32px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    color: "#1a1a1a",
                                                    marginBottom: "6px",
                                                    lineHeight: "1.4",
                                                }}
                                            >
                                                {article.title}
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 12,
                                                    fontSize: "12px",
                                                    color: "#999",
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                <span>{article.source}</span>
                                                <span>·</span>
                                                <span>
                                                    {formatDate(
                                                        article.publishedAt,
                                                    )}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "2px 8px",
                                                        borderRadius: "3px",
                                                        background: `${getTagColor(article.tag)}20`,
                                                        color: getTagColor(
                                                            article.tag,
                                                        ),
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {article.tag}
                                                </span>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "2px 8px",
                                                        borderRadius: "3px",
                                                        background:
                                                            "var(--surface2)",
                                                        color: "var(--ink3)",
                                                        fontSize: "11px",
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {article.region === "de"
                                                        ? "🇩🇪 DE"
                                                        : " World"}
                                                </span>
                                            </div>
                                            <div style={{marginTop:'8px'}}>
                                                {summaries[article.id] ? (
                                                    <div style={{
                                                        padding:'10px 12px', borderRadius:'8px',
                                                        background:'var(--surface2)', fontSize:'12px',
                                                        color:'var(--ink2)', lineHeight:'1.6',
                                                        borderLeft:'3px solid #c8401a'
                                                    }}>
                                                        <span style={{fontSize:'11px', fontWeight:600, color:'#c8401a'}}>AI Summary</span>
                                                        <p style={{margin:'4px 0 0'}}>{summaries[article.id]}</p>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); generateSummary(article); }}
                                                        disabled={loadingSummary[article.id]}
                                                        style={{
                                                            padding:'4px 10px', borderRadius:'6px', fontSize:'11px',
                                                            border:'1px solid #c8401a', background:'transparent',
                                                            color:'#c8401a', cursor:'pointer', fontWeight:600
                                                        }}>
                                                        {loadingSummary[article.id] ? 'Generating...' : '✨ AI Summary'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </a>
                                );
                            })}

                        {/* Pagination */}
                        {articles.length > articlesPerPage && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "6px",
                                    padding: "16px",
                                    flexWrap: "wrap",
                                }}
                            >
                                {Array.from(
                                    {
                                        length: Math.ceil(
                                            articles.length / articlesPerPage,
                                        ),
                                    },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background:
                                                currentPage === page
                                                    ? "#c8401a"
                                                    : "var(--surface)",
                                            color:
                                                currentPage === page
                                                    ? "white"
                                                    : "var(--ink)",
                                            cursor: "pointer",
                                            fontWeight:
                                                currentPage === page ? 700 : 400,
                                            fontSize: "13px",
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>
                    )}
                </div>

                {/* Toast Notifications */}
                <div
                    style={{
                        position: "fixed",
                        bottom: "24px",
                        right: "24px",
                        zIndex: 1000,
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            style={{
                                padding: "12px 16px",
                                borderRadius: "6px",
                                background:
                                    toast.type === "success"
                                        ? "#dff0d8"
                                        : "#f2dede",
                                color:
                                    toast.type === "success"
                                        ? "#3c763d"
                                        : "#a94442",
                                fontSize: "13px",
                                fontWeight: 500,
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                animation: "slideIn 0.3s ease-out",
                            }}
                        >
                            {toast.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
