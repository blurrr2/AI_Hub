import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
    user?: { username?: string };
    onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user = {}, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "News Feed", path: "/news" },
        { label: "Learning Library", path: "/library" },
        { label: "Coding Journal", path: "/journal" },
    ];

    return (
        <div
            style={{
                width: "220px",
                background: isDark ? "#0f1117" : "#ffffff",
                borderRight: `1px solid ${isDark ? "#1e2535" : "#e2ddd6"}`,
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: "20px 18px",
                    borderBottom: `1px solid ${isDark ? "#1e2535" : "#e2ddd6"}`,
                }}
            >
                <div
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 800,
                        fontSize: 20,
                        color: isDark ? "#ffffff" : "#1a1612",
                        letterSpacing: "-0.5px",
                    }}
                >
                    AI<span style={{ color: "#c8401a" }}>·</span>HUB
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "20px 12px", overflow: "auto" }}>
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
                                    padding: "12px 12px",
                                    marginBottom: "4px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    color: isActive
                                        ? isDark
                                            ? "#ffffff"
                                            : "#1a1612"
                                        : isDark
                                          ? "#4a5568"
                                          : "#6b7280",
                                    backgroundColor: isActive
                                        ? isDark
                                            ? "#131820"
                                            : "#f5f0eb"
                                        : "transparent",
                                    borderLeft: isActive
                                        ? "2px solid #c8401a"
                                        : "2px solid transparent",
                                    paddingLeft: isActive ? "10px" : "12px",
                                    fontWeight: isActive ? 600 : 400,
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = isDark
                                            ? "#cbd5e1"
                                            : "#1a1612";
                                        e.currentTarget.style.backgroundColor =
                                            isDark ? "#0f1117" : "#f9f5f0";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = isDark
                                            ? "#4a5568"
                                            : "#6b7280";
                                        e.currentTarget.style.backgroundColor =
                                            "transparent";
                                    }
                                }}
                            >
                                {item.label}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: User & Theme */}
            <div
                style={{
                    borderTop: `1px solid ${isDark ? "#1e2535" : "#e2ddd6"}`,
                    padding: "12px",
                }}
            >
                <div style={{ marginBottom: "12px" }}>
                    <ThemeToggle />
                </div>
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                        marginBottom: "12px",
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#c8401a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {user.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: isDark ? "#cbd5e1" : "#1a1612",
                            }}
                        >
                            {user.username || "User"}
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                color: isDark ? "#4a5568" : "#6b7280",
                            }}
                        >
                            Active
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: `1px solid ${isDark ? "#1e2535" : "#e2ddd6"}`,
                        background: isDark ? "#0f1117" : "#f0ece4",
                        color: isDark ? "#4a5568" : "#4a4540",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#da3633";
                        e.currentTarget.style.color = "#da3633";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isDark
                            ? "#1e2535"
                            : "#e2ddd6";
                        e.currentTarget.style.color = isDark
                            ? "#4a5568"
                            : "#4a4540";
                    }}
                >
                    🚪 Logout
                </button>
            </div>
        </div>
    );
};
