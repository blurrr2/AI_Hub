import { useNavigate } from "react-router-dom";
import * as React from "react";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";

interface StatCardProps {
    label: string;
    value: string | number;
    color: string;
}

interface ActivityItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    time: string;
}

interface ActionItem {
    icon: string;
    label: string;
    color: string;
}

// Custom hook for count-up animation
function useCountUp(target: number, duration: number = 1200) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Stats state
    const [stats, setStats] = React.useState({
        newsRead: 0,
        resources: 0,
        bugsSolved: 0,
        papers: 0,
        streak: 0,
    });

    // Activities state
    const [activities, setActivities] = React.useState<ActivityItem[]>([]);

    // Fetch dashboard stats and activities from API
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch stats
                const statsResponse = await axios.get("/api/dashboard/stats", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setStats(statsResponse.data);

                // Fetch activities
                const activitiesResponse = await axios.get("/api/dashboard/activity", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Map backend activities to frontend format
                const mappedActivities = activitiesResponse.data.map((act: any, index: number) => {
                    const icons: Record<string, string> = {
                        news: "",
                        resource: "",
                        problem: "",
                        default: "",
                    };

                    const timeAgo = new Date(act.createdAt).toLocaleDateString();

                    return {
                        id: index.toString(),
                        title: act.type,
                        description: act.description,
                        icon: icons[act.type.toLowerCase()] || icons.default,
                        time: timeAgo,
                    };
                });

                setActivities(mappedActivities);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    // Toast state
    const [toasts, setToasts] = React.useState<
        Array<{ id: string; message: string }>
    >([]);

    const showToast = (message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // Syncing state
    const [syncing, setSyncing] = React.useState(false);

    const handleSync = () => {
        setSyncing(true);
        setTimeout(() => setSyncing(false), 2000);
    };

    // Handle Quick Action clicks
    const handleQuickAction = (label: string) => {
        switch (label) {
            case "Add Resource":
                navigate("/library");
                break;
            case "Solve Problem":
                navigate("/journal");
                break;
            case "Read News":
                navigate("/news");
                break;
            case "New Journal":
                navigate("/journal");
                break;
            case "Start Timer":
                showToast("Timer started! ⏱️");
                break;
            case "Join Group":
                showToast("Coming soon! ");
                break;
            default:
                break;
        }
    };

    const statCards: StatCardProps[] = [
        { label: "News Read", value: stats.newsRead, color: "#0066cc" },
        { label: "Resources", value: stats.resources, color: "#10b981" },
        { label: "Bugs Solved", value: stats.bugsSolved, color: "#f59e0b" },
        { label: "Papers", value: stats.papers, color: "#8b5cf6" },
        { label: "Streak", value: stats.streak, color: "#c8401a" },
    ];

    const quickActions: ActionItem[] = [
        { icon: "", label: "Add Resource", color: "#0066cc" },
        { icon: "", label: "Solve Problem", color: "#c8401a" },
        { icon: "", label: "Read News", color: "#10b981" },
        { icon: "", label: "New Journal", color: "#8b5cf6" },
        { icon: "⏱️", label: "Start Timer", color: "#f59e0b" },
        { icon: "", label: "Join Group", color: "#06b6d4" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
            <Sidebar user={user} onLogout={handleLogout} />

            {/* RIGHT MAIN - light */}
            <div
                style={{
                    flex: 1,
                    background: "var(--bg)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                {/* TOP: greeting + 5 stat cards in ONE horizontal row */}
                <div
                    style={{
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        padding: "18px 24px 14px",
                    }}
                >
                    {/* Subtitle */}
                    <div
                        style={{
                            fontSize: "12px",
                            color: "var(--ink3)",
                            marginBottom: "4px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <span>Dashboard</span>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                            }}
                        >
                            <span>{new Date().toLocaleDateString()}</span>
                            <button
                                onClick={handleSync}
                                style={{
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                    borderRadius: "3px",
                                    border: "1px solid var(--border)",
                                    background: "var(--bg)",
                                    color: "var(--ink2)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "var(--surface2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        "var(--bg)";
                                }}
                            >
                                <span className={syncing ? "spinning" : ""}>
                                    ↻
                                </span>{" "}
                                Sync
                            </button>
                        </div>
                    </div>
                    <div
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            fontSize: 20,
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                            color: "var(--ink)",
                            margin: 0,
                            padding: 0,
                            marginBottom: "12px",
                        }}
                    >
                        Guten Tag, {user.username || "User"}!
                    </div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 12,
                        }}
                    >
                        {statCards.map((card, idx) => {
                            const animatedCount = useCountUp(
                                typeof card.value === "number" ? card.value : 0,
                            );
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        background: "var(--surface)",
                                        borderTop: `3px solid ${card.color}`,
                                        border: `1px solid var(--border)`,
                                        borderTopWidth: "3px",
                                        borderRadius: "6px",
                                        padding: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        minHeight: "80px",
                                        transition: "transform 0.2s ease",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform =
                                            "translateY(0)";
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            fontWeight: 500,
                                            color: "var(--ink2)",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        {card.label}
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontFamily:
                                                    "JetBrains Mono, monospace",
                                                fontSize: "20px",
                                                fontWeight: "bold",
                                                color: card.color,
                                            }}
                                        >
                                            {animatedCount}
                                            {card.label === "Streak" && ""}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* BOTTOM: 2 columns side by side */}
                <div
                    style={{
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: "1.5fr 1fr",
                        gap: 16,
                        padding: 20,
                        overflow: "hidden",
                    }}
                >
                    {/* Recent Activity list - scrollable */}
                    <div
                        style={{
                            background: "var(--surface)",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                marginBottom: "12px",
                                color: "var(--ink)",
                            }}
                        >
                            Recent Activity
                        </div>
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {activities.length === 0 ? (
                                <p
                                    style={{
                                        color: "var(--ink3)",
                                        textAlign: "center",
                                        padding: "20px",
                                    }}
                                >
                                    No activity yet. Start by reading news or solving a problem!
                                </p>
                            ) : (
                                activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        style={{
                                            padding: "12px",
                                            background: "var(--bg)",
                                            borderRadius: "4px",
                                            border: "1px solid var(--border)",
                                            display: "flex",
                                            gap: "10px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "18px",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {activity.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "var(--ink)",
                                                    marginBottom: "2px",
                                                }}
                                            >
                                                {activity.title}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    color: "var(--ink2)",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {activity.description}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "11px",
                                                color: "var(--ink3)",
                                                flexShrink: 0,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {activity.time}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions 2x3 grid */}
                    <div
                        style={{
                            background: "var(--surface)",
                            borderRadius: "8px",
                            border: "1px solid var(--border)",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                fontFamily: "Inter, sans-serif",
                                marginBottom: "12px",
                                color: "var(--ink)",
                            }}
                        >
                            Quick Actions
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 12,
                                flex: 1,
                            }}
                        >
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() =>
                                        handleQuickAction(action.label)
                                    }
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: "16px 12px",
                                        background: "var(--surface)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        color: "var(--ink)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--accent)";
                                        e.currentTarget.style.background =
                                            "var(--surface2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor =
                                            "var(--border)";
                                        e.currentTarget.style.background =
                                            "var(--surface)";
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "20px",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        {action.icon}
                                    </div>
                                    <div>{action.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
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
                                background: "var(--success)",
                                color: "var(--surface)",
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

                {/* Toast Animation */}
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
            </div>
        </div>
    );
};
