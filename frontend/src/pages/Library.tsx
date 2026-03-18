import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Library.module.css";
import { Sidebar } from "../components/Sidebar";
import {
    getResources,
    createResource,
    updateResource,
    deleteResource,
    scrapeUrl,
    getCommunity,
} from "../api/resources";

interface Resource {
    id: number;
    title: string;
    url: string;
    type: string;
    category: string;
    language: string;
    rating: number;
    progress: number;
    reason: string;
    visibility: string;
    userId: number;
    createdAt: string;
}

interface Filters {
    category: string;
    type: string;
    language: string;
    progress: string;
    search: string;
}

const Library: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [mobileView, setMobileView] = useState<'filters' | 'cards' | 'detail'>('cards');
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };
    const [tab, setTab] = useState<"my" | "community" | "papers">("my");
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Resource | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        category: "All",
        type: "All Types",
        language: " All",
        progress: "All",
        search: "",
    });

    // Modal state
    const [modalUrl, setModalUrl] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [modalType, setModalType] = useState("");
    const [modalCategory, setModalCategory] = useState("");
    const [modalLanguage, setModalLanguage] = useState("");
    const [modalReason, setModalReason] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");

    // Fetch resources based on tab and filters
    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                ...(filters.search && { search: filters.search }),
                ...(filters.category !== "All" && {
                    category: filters.category,
                }),
                ...(filters.type !== "All Types" && { type: filters.type }),
                ...(filters.language !== " All" && {
                    lang: filters.language.split(" ")[1] || filters.language,
                }),
                ...(filters.progress !== "All" && {
                    progress: filters.progress,
                }),
            };

            let response;
            if (tab === "community") {
                response = await getCommunity(params);
            } else {
                response = await getResources(params);
            }

            setResources(response.data);
            setSelected(null);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        } finally {
            setLoading(false);
        }
    }, [tab, filters]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleAutoFill = async () => {
        if (!modalUrl.trim()) {
            setModalError("Please enter a URL");
            return;
        }

        try {
            setModalLoading(true);
            setModalError("");
            const response = await scrapeUrl(modalUrl);

            setModalTitle(response.data.title || "");
            setModalType(response.data.type || "");
        } catch (error) {
            setModalError("Failed to fetch URL metadata");
            console.error("Scrape error:", error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddResource = async () => {
        if (
            !modalTitle.trim() ||
            !modalUrl.trim() ||
            !modalType ||
            !modalCategory ||
            !modalLanguage
        ) {
            setModalError("All fields are required");
            return;
        }

        try {
            setModalLoading(true);
            setModalError("");
            await createResource({
                title: modalTitle,
                url: modalUrl,
                type: modalType,
                category: modalCategory,
                language: modalLanguage,
                reason: modalReason,
            });

            setShowModal(false);
            setModalUrl("");
            setModalTitle("");
            setModalType("");
            setModalCategory("");
            setModalLanguage("");
            setModalReason("");
            await fetchResources();
        } catch (err) {
            setModalError("Failed to add resource");
            console.error(err);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdateProgress = async (progress: number) => {
        if (!selected) return;
        try {
            await updateResource(selected.id, { progress });
            const updated = { ...selected, progress };
            setSelected(updated);
            setResources(
                resources.map((r) => (r.id === selected.id ? updated : r)),
            );
        } catch (err) {
            console.error("Failed to update progress:", err);
        }
    };

    const handleUpdateRating = async (rating: number) => {
        if (!selected) return;
        try {
            await updateResource(selected.id, { rating });
            const updated = { ...selected, rating };
            setSelected(updated);
            setResources(
                resources.map((r) => (r.id === selected.id ? updated : r)),
            );
        } catch (err) {
            console.error("Failed to update rating:", err);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!confirm("Delete this resource?")) return;

        try {
            await deleteResource(selected.id);
            setSelected(null);
            setResources(resources.filter((r) => r.id !== selected.id));
        } catch (err) {
            console.error("Failed to delete resource:", err);
        }
    };

    const getTypeIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            YouTube: "▶️",
            Bilibili: "",
            arXiv: "",
            GitHub: "",
            Article: "",
            X: "𝕏",
        };
        return icons[type] || "";
    };

    const getTypeColor = (type: string) => {
        const colors: { [key: string]: string } = {
            YouTube: "#FF0000",
            Bilibili: "#00A1D6",
            arXiv: "#B31B1B",
            GitHub: "#333333",
            Article: "#666666",
            X: "#000000",
        };
        return colors[type] || "#999999";
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            Python: "#3B7FDB",
            "MLAI": "#9D4EDD",
            Java: "#FF9F43",
            JavaScript: "#FFD93D",
            Other: "#B8B8B8",
        };
        return colors[category] || "#999999";
    };

    const getLanguageFlag = (lang: string) => {
        const flags: { [key: string]: string } = {
            EN: "🇬🇧",
            DE: "🇩🇪",
            CN: "🇨🇳",
            zh: "🇨🇳",
        };
        return flags[lang] || "";
    };

    const getProgressColor = (progress: number) => {
        if (progress === 0) return "#EF4444"; // red
        if (progress === 100) return "#22C55E"; // green
        return "#F59E0B"; // amber
    };

    // Count resources by category/type/progress
    const counts = {
        categories: {} as { [key: string]: number },
        types: {} as { [key: string]: number },
        progress: {
            notStarted: resources.filter((r) => r.progress === 0).length,
            inProgress: resources.filter(
                (r) => r.progress > 0 && r.progress < 100,
            ).length,
            done: resources.filter((r) => r.progress === 100).length,
        },
    };

    resources.forEach((r) => {
        counts.categories[r.category] =
            (counts.categories[r.category] || 0) + 1;
        counts.types[r.type] = (counts.types[r.type] || 0) + 1;
    });

    // Filter resources
    const filtered = resources.filter((r) => {
        if (filters.category !== "All" && r.category !== filters.category)
            return false;
        if (filters.type !== "All Types" && r.type !== filters.type)
            return false;
        if (
            filters.language !== " All" &&
            !r.language.includes(
                filters.language.split(" ")[1] || filters.language,
            )
        )
            return false;
        if (filters.progress === "Not Started" && r.progress !== 0)
            return false;
        if (
            filters.progress === "In Progress" &&
            (r.progress === 0 || r.progress === 100)
        )
            return false;
        if (filters.progress === "Done" && r.progress !== 100) return false;
        if (
            filters.search &&
            !r.title.toLowerCase().includes(filters.search.toLowerCase())
        )
            return false;
        return true;
    });

    // Group by category
    const grouped: { [key: string]: Resource[] } = {};
    filtered.forEach((r) => {
        if (!grouped[r.category]) grouped[r.category] = [];
        grouped[r.category].push(r);
    });

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <div className="sidebar">
                <Sidebar user={user} onLogout={handleLogout} />
            </div>

            {/* Main Area */}
            <div className={`${styles.main} main-content`}>
                {/* Topbar */}
                <div
                    style={{
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        padding: "16px 28px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        minHeight: "52px",
                    }}
                >
                    <h1
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: 20,
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                            color: "var(--ink)",
                            margin: 0,
                            padding: 0,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Learning Library
                    </h1>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={filters.search}
                        onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value })
                        }
                        style={{
                            flex: 1,
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
                        onClick={() => setShowModal(true)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#a63015";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#c8401a";
                        }}
                    >
                         Add Resource
                    </button>
                </div>

                {/* Tabs Row */}
                <div
                    style={{
                        display: "flex",
                        borderBottom: "1px solid var(--border)",
                        padding: "0 28px",
                        background: "var(--surface)",
                        gap: "24px",
                    }}
                >
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            padding: "12px 0",
                            fontSize: "13px",
                            fontWeight: tab === "my" ? 600 : 400,
                            color: tab === "my" ? "#c8401a" : "#999",
                            cursor: "pointer",
                            borderBottom:
                                tab === "my"
                                    ? "2px solid #c8401a"
                                    : "2px solid transparent",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onClick={() => setTab("my")}
                        onMouseEnter={(e) => {
                            if (tab !== "my") {
                                e.currentTarget.style.color = "#666";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tab !== "my") {
                                e.currentTarget.style.color = "#999";
                            }
                        }}
                    >
                         My Resources
                        <span
                            style={{
                                fontSize: "11px",
                                background: "var(--surface2)",
                                color: "var(--ink3)",
                                padding: "2px 6px",
                                borderRadius: "2px",
                            }}
                        >
                            {resources.length}
                        </span>
                    </button>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            padding: "12px 0",
                            fontSize: "13px",
                            fontWeight: tab === "community" ? 600 : 400,
                            color: tab === "community" ? "#c8401a" : "#999",
                            cursor: "pointer",
                            borderBottom:
                                tab === "community"
                                    ? "2px solid #c8401a"
                                    : "2px solid transparent",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onClick={() => setTab("community")}
                        onMouseEnter={(e) => {
                            if (tab !== "community") {
                                e.currentTarget.style.color = "#666";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tab !== "community") {
                                e.currentTarget.style.color = "#999";
                            }
                        }}
                    >
                         Community Picks
                        <span
                            style={{
                                fontSize: "11px",
                                background: "var(--surface2)",
                                color: "var(--ink3)",
                                padding: "2px 6px",
                                borderRadius: "2px",
                            }}
                        >
                            {resources.length}
                        </span>
                    </button>
                    <button
                        style={{
                            background: "none",
                            border: "none",
                            padding: "12px 0",
                            fontSize: "13px",
                            fontWeight: tab === "papers" ? 600 : 400,
                            color: tab === "papers" ? "#c8401a" : "#999",
                            cursor: "pointer",
                            borderBottom:
                                tab === "papers"
                                    ? "2px solid #c8401a"
                                    : "2px solid transparent",
                            transition: "all 0.2s",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        onClick={() => setTab("papers")}
                        onMouseEnter={(e) => {
                            if (tab !== "papers") {
                                e.currentTarget.style.color = "#666";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (tab !== "papers") {
                                e.currentTarget.style.color = "#999";
                            }
                        }}
                    >
                         AI Papers
                        <span
                            style={{
                                fontSize: "11px",
                                background: "var(--surface2)",
                                color: "var(--ink3)",
                                padding: "2px 6px",
                                borderRadius: "2px",
                            }}
                        >
                            0
                        </span>
                    </button>
                </div>

                {/* Body: 3 Columns */}
                <div className={styles.body}>
                    {/* Mobile Tab Bar */}
                    {isMobile && (
                        <div className={styles.mobileTabBar}>
                            <button
                                className={`${styles.mobileTabBtn} ${mobileView === 'filters' ? styles.activeMobileTab : ''}`}
                                onClick={() => setMobileView('filters')}
                            >
                                Filters
                            </button>
                            <button
                                className={`${styles.mobileTabBtn} ${mobileView === 'cards' ? styles.activeMobileTab : ''}`}
                                onClick={() => setMobileView('cards')}
                            >
                                Cards
                            </button>
                            <button
                                className={`${styles.mobileTabBtn} ${mobileView === 'detail' ? styles.activeMobileTab : ''}`}
                                onClick={() => setMobileView('detail')}
                                disabled={!selected}
                                style={!selected ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
                            >
                                Detail
                            </button>
                        </div>
                    )}

                    {/* LEFT: Filter Panel */}
                    <div className={`${styles.filterPanel} ${!isMobile || mobileView === 'filters' ? styles.mobileVisible : ''}`}>
                        <div className={styles.filterGroup}>
                            <h3>Category</h3>
                            {[
                                "All",
                                "Python",
                                "MLAI",
                                "Java",
                                "JavaScript",
                                "Other",
                            ].map((cat) => (
                                <label key={cat} className={styles.filterItem}>
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={filters.category === cat}
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                category: cat,
                                            })
                                        }
                                    />
                                    <span
                                        className={styles.colorDot}
                                        style={{
                                            backgroundColor:
                                                cat === "All"
                                                    ? "transparent"
                                                    : getCategoryColor(cat),
                                        }}
                                    />
                                    {cat}
                                    {cat !== "All" && (
                                        <span className={styles.count}>
                                            {counts.categories[cat] || 0}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>Type</h3>
                            {[
                                "All Types",
                                "YouTube",
                                "Bilibili",
                                "arXiv",
                                "GitHub",
                                "Article",
                                "X",
                            ].map((t) => (
                                <label key={t} className={styles.filterItem}>
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={filters.type === t}
                                        onChange={() =>
                                            setFilters({ ...filters, type: t })
                                        }
                                    />
                                    <span className={styles.icon}>
                                        {getTypeIcon(
                                            t === "All Types" ? "All" : t,
                                        )}
                                    </span>
                                    {t}
                                    {t !== "All Types" && (
                                        <span className={styles.count}>
                                            {counts.types[t] || 0}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>Language</h3>
                            {[" All", "🇨🇳 中文", "🇬🇧 EN", "🇩🇪 DE"].map(
                                (lang) => (
                                    <label
                                        key={lang}
                                        className={styles.filterItem}
                                    >
                                        <input
                                            type="radio"
                                            name="language"
                                            checked={filters.language === lang}
                                            onChange={() =>
                                                setFilters({
                                                    ...filters,
                                                    language: lang,
                                                })
                                            }
                                        />
                                        {lang}
                                    </label>
                                ),
                            )}
                        </div>

                        <div className={styles.filterGroup}>
                            <h3>Progress</h3>
                            {[
                                { label: "All", value: "All" },
                                {
                                    label: "Not Started",
                                    value: "Not Started",
                                    color: "#EF4444",
                                },
                                {
                                    label: "In Progress",
                                    value: "In Progress",
                                    color: "#F59E0B",
                                },
                                {
                                    label: "Done",
                                    value: "Done",
                                    color: "#22C55E",
                                },
                            ].map((p) => (
                                <label
                                    key={p.value}
                                    className={styles.filterItem}
                                >
                                    <input
                                        type="radio"
                                        name="progress"
                                        checked={filters.progress === p.value}
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                progress: p.value,
                                            })
                                        }
                                    />
                                    {p.value !== "All" && (
                                        <span
                                            className={styles.progressDot}
                                            style={{ backgroundColor: p.color }}
                                        />
                                    )}
                                    {p.label}
                                    {p.value === "Not Started" && (
                                        <span className={styles.count}>
                                            {counts.progress.notStarted}
                                        </span>
                                    )}
                                    {p.value === "In Progress" && (
                                        <span className={styles.count}>
                                            {counts.progress.inProgress}
                                        </span>
                                    )}
                                    {p.value === "Done" && (
                                        <span className={styles.count}>
                                            {counts.progress.done}
                                        </span>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* CENTER: Cards Panel */}
                    <div className={`${styles.cardsPanel} ${!isMobile || mobileView === 'cards' ? styles.mobileVisible : ''}`}>
                        {loading ? (
                            <div className={styles.empty}>Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div className={styles.empty}>
                                No resources found
                            </div>
                        ) : (
                            Object.entries(grouped).map(([category, cards]) => (
                                <div
                                    key={category}
                                    className={styles.cardGroup}
                                >
                                    <h3
                                        className={styles.groupTitle}
                                        style={{
                                            borderLeftColor:
                                                getCategoryColor(category),
                                        }}
                                    >
                                        {category}
                                    </h3>
                                    {cards.map((card) => (
                                        <div
                                            key={card.id}
                                            className={`${styles.card} ${selected?.id === card.id ? styles.selectedCard : ""}`}
                                            onClick={() => setSelected(card)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <div
                                                    className={styles.cardType}
                                                >
                                                    <div
                                                        className={
                                                            styles.typeIcon
                                                        }
                                                        style={{
                                                            backgroundColor:
                                                                getTypeColor(
                                                                    card.type,
                                                                ),
                                                        }}
                                                    >
                                                        {getTypeIcon(card.type)}
                                                    </div>
                                                </div>
                                                <div
                                                    className={styles.cardMeta}
                                                >
                                                    <h4>{card.title}</h4>
                                                    <p
                                                        className={
                                                            styles.cardUrl
                                                        }
                                                    >
                                                        {card.url}
                                                    </p>
                                                </div>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (
                                                            selected?.id ===
                                                            card.id
                                                        ) {
                                                            handleDelete();
                                                        }
                                                    }}
                                                >
                                                    ️
                                                </button>
                                            </div>
                                            <div className={styles.cardFooter}>
                                                <span className={styles.tag}>
                                                    {card.category}
                                                </span>
                                                <span className={styles.flag}>
                                                    {getLanguageFlag(
                                                        card.language,
                                                    )}
                                                </span>
                                                <div className={styles.rating}>
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <span
                                                                key={i}
                                                                className={
                                                                    i <
                                                                    card.rating
                                                                        ? styles.starFilled
                                                                        : styles.starEmpty
                                                                }
                                                            >
                                                                ?
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.progressBar
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            getProgressColor(
                                                                card.progress,
                                                            ),
                                                        width: `${card.progress}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT: Detail Panel */}
                    <div className={`${styles.detailPanel} ${!isMobile || mobileView === 'detail' ? styles.mobileVisible : ''}`}>
                        {!selected ? (
                            <div className={styles.empty}>
                                 Select a resource
                            </div>
                        ) : (
                            <div className={styles.detailContent}>
                                <div className={styles.detailType}>
                                    <div
                                        className={styles.typeBadge}
                                        style={{
                                            backgroundColor: getTypeColor(
                                                selected.type,
                                            ),
                                        }}
                                    >
                                        {getTypeIcon(selected.type)}{" "}
                                        {selected.type}
                                    </div>
                                </div>

                                <h3 className={styles.detailTitle}>
                                    {selected.title}
                                </h3>

                                <a
                                    href={selected.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.detailUrl}
                                >
                                    {selected.url}
                                </a>

                                <div className={styles.detailTags}>
                                    <span className={styles.detailTag}>
                                        {selected.category}
                                    </span>
                                    <span className={styles.detailFlag}>
                                        {getLanguageFlag(selected.language)}
                                    </span>
                                </div>

                                <div className={styles.progressSection}>
                                    <h4>Progress</h4>
                                    <div className={styles.progressButtons}>
                                        {[
                                            { label: "Not Started", value: 0 },
                                            { label: "In Progress", value: 50 },
                                            { label: "Done", value: 100 },
                                        ].map((p) => (
                                            <button
                                                key={p.value}
                                                className={`${styles.progressBtn} ${selected.progress === p.value ? styles.activeProgressBtn : ""}`}
                                                onClick={() =>
                                                    handleUpdateProgress(
                                                        p.value,
                                                    )
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.progressDot
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            getProgressColor(
                                                                p.value,
                                                            ),
                                                    }}
                                                />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.ratingSection}>
                                    <h4>Rating</h4>
                                    <div className={styles.stars}>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <button
                                                key={i}
                                                className={`${styles.star} ${i <= selected.rating ? styles.starFilled : ""}`}
                                                onClick={() =>
                                                    handleUpdateRating(i)
                                                }
                                            >
                                                ⭐
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.reasonSection}>
                                    <h4>Reason</h4>
                                    <textarea
                                        className={styles.reasonInput}
                                        value={selected.reason || ""}
                                        onChange={(e) => {
                                            const updated = {
                                                ...selected,
                                                reason: e.target.value,
                                            };
                                            setSelected(updated);
                                            updateResource(selected.id, {
                                                reason: e.target.value,
                                            });
                                        }}
                                        placeholder="Why I recommend it..."
                                    />
                                </div>

                                <button
                                    className={styles.openBtn}
                                    onClick={() =>
                                        window.open(selected.url, "_blank")
                                    }
                                >
                                    ?Open Resource
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Resource Modal */}
            {showModal && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Add New Resource</h2>

                        <div className={styles.formGroup}>
                            <label>URL</label>
                            <div className={styles.urlRow}>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={modalUrl}
                                    onChange={(e) =>
                                        setModalUrl(e.target.value)
                                    }
                                    className={styles.input}
                                />
                                <button
                                    className={styles.autoFillBtn}
                                    onClick={handleAutoFill}
                                    disabled={modalLoading}
                                >
                                    Auto-fill
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <div className={styles.typeButtons}>
                                {[
                                    "YouTube",
                                    "Bilibili",
                                    "arXiv",
                                    "GitHub",
                                    "Article",
                                ].map((t) => (
                                    <button
                                        key={t}
                                        className={`${styles.typeBtn} ${modalType === t ? styles.activeTypeBtn : ""}`}
                                        onClick={() => setModalType(t)}
                                    >
                                        {getTypeIcon(t)} {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input
                                type="text"
                                placeholder="Resource title"
                                value={modalTitle}
                                onChange={(e) => setModalTitle(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Category</label>
                                <select
                                    value={modalCategory}
                                    onChange={(e) =>
                                        setModalCategory(e.target.value)
                                    }
                                    className={styles.input}
                                >
                                    <option value="">Select...</option>
                                    {[
                                        "Python",
                                        "MLAI",
                                        "Java",
                                        "JavaScript",
                                        "Other",
                                    ].map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Language</label>
                                <select
                                    value={modalLanguage}
                                    onChange={(e) =>
                                        setModalLanguage(e.target.value)
                                    }
                                    className={styles.input}
                                >
                                    <option value="">Select...</option>
                                    {["EN", "DE", "CN"].map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Reason (Optional)</label>
                            <textarea
                                placeholder="Why I recommend it..."
                                value={modalReason}
                                onChange={(e) => setModalReason(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        {modalError && (
                            <div className={styles.error}>{modalError}</div>
                        )}

                        <div className={styles.modalButtons}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.submitBtn}
                                onClick={handleAddResource}
                                disabled={modalLoading}
                            >
                                {modalLoading ? "Adding..." : "Add to Library"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;
