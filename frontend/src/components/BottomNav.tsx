import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export const BottomNav: React.FC = () => {
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: "📊" },
        { label: "News", path: "/news", icon: "📰" },
        { label: "Library", path: "/library", icon: "📚" },
        { label: "Journal", path: "/journal", icon: "📝" },
        { label: "Community", path: "/community", icon: "👥" },
    ];

    return (
        <div
            style={{
                display: "none",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                height: "70px",
                background: isDark ? "#0f1117" : "#ffffff",
                borderTop: `1px solid ${isDark ? "#1e2535" : "#e2ddd6"}`,
                zIndex: 1000,
            }}
            className="bottom-nav-container"
        >
            <nav
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    height: "100%",
                    padding: "0 8px",
                }}
            >
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{ textDecoration: "none" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    color: isActive ? "#c8401a" : "var(--ink2)",
                                    fontSize: "12px",
                                    fontWeight: isActive ? 600 : 500,
                                    transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = "var(--ink)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = "var(--ink2)";
                                    }
                                }}
                            >
                                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
