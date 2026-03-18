import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useEffect, useState } from "react";
import { buildApiUrl } from "../api/config";
import styles from "./Journal.module.css";
import { useIsMobile } from "../hooks/useIsMobile";

interface Problem {
    id: string;
    title: string;
    type: string;
    status: string;
    difficulty?: string;
    language?: string;
    problem?: string;
    solution?: string;
    learned?: string;
    description?: string;
    isPublic?: boolean;
    createdAt: string;
    _count?: {
        likes: number;
        comments: number;
    };
}

export default function Journal() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isMobile = useIsMobile();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedType, setSelectedType] = useState<string>("");
    const [formData, setFormData] = useState({
        title: "",
        language: "JavaScript",
        topic: "General",
        status: "Open",
        problem: "",
        solution: "",
        learned: "",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        type: "",
        status: "",
        lang: "",
        problem: "",
        solution: "",
        learned: "",
        description: "",
    });

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(buildApiUrl("/api/problems"), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setProblems(data);
                if (data.length > 0) setSelectedId(data[0].id);
            } catch {
                setError("Failed to load problems");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this entry?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(buildApiUrl(`/api/problems/${id}`), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete");
            setProblems(problems.filter((p) => p.id !== id));
            setSelectedId(null);
        } catch {
            alert("Error deleting entry");
        }
    };

    const handleUpdate = async () => {
        if (!selectedId) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                buildApiUrl(`/api/problems/${selectedId}`),
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: editData.title,
                        type: editData.type,
                        status: editData.status,
                        lang: editData.lang,
                        problem: editData.problem,
                        solution: editData.solution,
                        learned: editData.learned,
                        description: editData.description,
                    }),
                },
            );
            if (!response.ok) throw new Error("Failed to update");
            const updated = await response.json();
            setProblems(problems.map((p) => (p.id === selectedId ? updated : p)));
            setEditMode(false);
        } catch {
            alert("Error updating entry");
        }
    };

    const selected = problems.find((p) => p.id === selectedId);
    const filtered = problems.filter((p) => {
        if (typeFilter && p.type !== typeFilter) return false;
        if (
            searchQuery &&
            !p.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
            return false;
        return true;
    });

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
            }}
        >
            {!isMobile && (
                <div className="sidebar">
                    <Sidebar user={user} onLogout={handleLogout} />
                </div>
            )}

            {/* RIGHT MAIN AREA */}
            <div
                className="main-content"
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    marginTop: isMobile ? '52px' : 0,
                    marginBottom: isMobile ? '60px' : 0,
                }}
            >
                {/* TOPBAR - Single row */}
                <div
                    style={{
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 24px",
                        gap: "16px",
                        minHeight: "52px",
                    }}
                >
                    {/* Title */}
                    <h2
                        style={{
                            margin: 0,
                            padding: 0,
                            fontSize: 20,
                            fontWeight: 700,
                            fontFamily: "Inter, sans-serif",
                            letterSpacing: "-0.3px",
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Journal
                    </h2>

                    {/* Divider */}
                    <div
                        style={{
                            width: "1px",
                            height: "24px",
                            background: "var(--border)",
                        }}
                    />

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: "0 0 180px",
                            padding: "6px 10px",
                            fontSize: "13px",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            fontFamily: "Inter, sans-serif",
                            background: "var(--surface)",
                            color: "var(--ink)",
                        }}
                    />

                    {/* Filter Pills */}
                    <div style={{ display: "flex", gap: "6px" }}>
                        {[
                            { label: " Bug", value: "bug" },
                            { label: " Solution", value: "solution" },
                            { label: " Note", value: "note" },
                            { label: " Challenge", value: "challenge" },
                        ].map((f) => (
                            <button
                                key={f.value}
                                onClick={() =>
                                    setTypeFilter(
                                        typeFilter === f.value ? null : f.value,
                                    )
                                }
                                style={{
                                    padding: "4px 10px",
                                    fontSize: "12px",
                                    border: "1px solid",
                                    borderColor:
                                        typeFilter === f.value
                                            ? "var(--accent)"
                                            : "var(--border)",
                                    background:
                                        typeFilter === f.value
                                            ? "var(--surface2)"
                                            : "var(--surface)",
                                    color:
                                        typeFilter === f.value
                                            ? "var(--accent)"
                                            : "var(--ink2)",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    fontWeight:
                                        typeFilter === f.value ? 600 : 400,
                                    transition: "all 0.2s",
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* New Entry Button */}
                    <button
                        onClick={() => {
                            setShowModal(true);
                            setSelectedType("");
                            setFormData({
                                title: "",
                                language: "JavaScript",
                                topic: "General",
                                status: "Open",
                                problem: "",
                                solution: "",
                                learned: "",
                                description: "",
                            });
                        }}
                        style={{
                            marginLeft: "auto",
                            padding: "6px 14px",
                            fontSize: "13px",
                            background: "#c8401a",
                            color: "var(--surface)",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: 600,
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#a63015";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#c8401a";
                        }}
                    >
                         New Entry
                    </button>
                </div>

                {/* SPLIT BODY */}
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    {/* LEFT: Entry List Panel - 300px */}
                    <div
                        className={styles.entryList}
                        style={{
                            width: "300px",
                            flex: "0 0 300px",
                            background: "var(--surface)",
                            borderRight: "1px solid #e1ddd4",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {loading ? (
                            <div
                                style={{
                                    padding: "24px",
                                    color: "#5a5450",
                                    textAlign: "center",
                                }}
                            >
                                Loading...
                            </div>
                        ) : error ? (
                            <div
                                style={{
                                    padding: "24px",
                                    color: "#da3633",
                                    textAlign: "center",
                                }}
                            >
                                {error}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div
                                style={{
                                    padding: "24px",
                                    color: "#8b949e",
                                    textAlign: "center",
                                }}
                            >
                                {problems.length === 0
                                    ? "No journal entries yet. Click + New Entry to start!"
                                    : "No entries"}
                            </div>
                        ) : (
                            filtered.map((problem) => (
                                <div
                                    key={problem.id}
                                    onClick={() => setSelectedId(problem.id)}
                                    style={{
                                        padding: "12px",
                                        borderBottom: "1px solid var(--border)",
                                        cursor: "pointer",
                                        background:
                                            selectedId === problem.id
                                                ? "var(--surface2)"
                                                : "var(--surface)",
                                        borderLeft:
                                            selectedId === problem.id
                                                ? "3px solid #c8401a"
                                                : "3px solid transparent",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedId !== problem.id) {
                                            e.currentTarget.style.background =
                                                "#fafafa";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedId !== problem.id) {
                                            e.currentTarget.style.background =
                                                "var(--surface)";
                                        }
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#0f1117",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {problem.title}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "6px",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                background: "var(--surface2)",
                                                color: "var(--ink2)",
                                                padding: "2px 6px",
                                                borderRadius: "2px",
                                            }}
                                        >
                                            {problem.type}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                background:
                                                    problem.status === "solved"
                                                        ? "#d4edda"
                                                        : "#fff3cd",
                                                color:
                                                    problem.status === "solved"
                                                        ? "#155724"
                                                        : "#856404",
                                                padding: "2px 6px",
                                                borderRadius: "2px",
                                            }}
                                        >
                                            {problem.status}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color: "#8b949e",
                                        }}
                                    >
                                        {new Date(
                                            problem.createdAt,
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* RIGHT: Editor Area - flex:1 */}
                    <div
                        className={styles.editor}
                        style={{
                            flex: 1,
                            background: "var(--bg)",
                            overflowY: "auto",
                            padding: "24px",
                        }}
                    >
                        {!selected ? (
                            <div
                                style={{
                                    textAlign: "center",
                                    color: "#8b949e",
                                    marginTop: "60px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "48px",
                                        marginBottom: "16px",
                                    }}
                                >
                                    
                                </div>
                                <h3
                                    style={{
                                        fontSize: "18px",
                                        fontWeight: 600,
                                        color: "#5a5450",
                                        margin: "0 0 8px 0",
                                    }}
                                >
                                    No Entry Selected
                                </h3>
                                <p style={{ margin: 0, fontSize: "14px" }}>
                                    Choose an entry from the left or create a
                                    new one
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div
                                    style={{
                                        marginBottom: "20px",
                                        paddingBottom: "16px",
                                        borderBottom: "1px solid #e1ddd4",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h2
                                            style={{
                                                margin: "0 0 8px 0",
                                                fontSize: 20,
                                                fontWeight: 700,
                                                fontFamily: "Inter, sans-serif",
                                                color: "#0f1117",
                                            }}
                                        >
                                            {selected.title}
                                        </h2>
                                        <div
                                            style={{ display: "flex", gap: "12px" }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    background: "var(--surface2)",
                                                    color: "var(--ink2)",
                                                    padding: "4px 10px",
                                                    borderRadius: "3px",
                                                }}
                                            >
                                                Type: {selected.type}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                background: "var(--surface2)",
                                                color: "var(--ink2)",
                                                padding: "4px 10px",
                                                borderRadius: "3px",
                                            }}
                                        >
                                            Status: {selected.status}
                                        </span>
                                        {selected.language && (
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    background:
                                                        "var(--surface2)",
                                                    color: "var(--ink2)",
                                                    padding: "4px 10px",
                                                    borderRadius: "3px",
                                                }}
                                            >
                                                Lang: {selected.language}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem("token");
                                                    const response = await fetch(buildApiUrl(`/api/problems/${selected.id}/visibility`), {
                                                        method: "PATCH",
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({ isPublic: !selected.isPublic }),
                                                    });
                                                    if (response.ok) {
                                                        const updated = await response.json();
                                                        setProblems(problems.map(p => p.id === selected.id ? updated : p));
                                                        setSelectedId(selected.id);
                                                    } else {
                                                        alert("Failed to toggle visibility");
                                                    }
                                                } catch {
                                                    alert("Failed to toggle visibility");
                                                }
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                background: "var(--surface2)",
                                                color: "var(--ink)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {selected.isPublic ? " Public" : " Private"}
                                        </button>
                                        {selected.isPublic && selected._count && (
                                            <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--ink2)" }}>
                                                <span> {selected._count.likes}</span>
                                                <span> {selected._count.comments}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditMode(true);
                                                setEditData({
                                                    title: selected.title,
                                                    type: selected.type,
                                                    status: selected.status,
                                                    lang: selected.language || "",
                                                    problem: selected.problem || "",
                                                    solution: selected.solution || "",
                                                    learned: selected.learned || "",
                                                    description: selected.description || "",
                                                });
                                            }}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                background: "#c8401a",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selected.id)}
                                            style={{
                                                padding: "6px 12px",
                                                fontSize: "12px",
                                                background: "#da3633",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Description Section */}
                                {selected.description && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "#0f1117",
                                                margin: "0 0 8px 0",
                                            }}
                                        >
                                             Description
                                        </h4>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#5a5450",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {selected.description}
                                        </p>
                                    </div>
                                )}

                                {/* Problem Section */}
                                {selected.problem && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "#0f1117",
                                                margin: "0 0 8px 0",
                                            }}
                                        >
                                             Problem
                                        </h4>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#5a5450",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {selected.problem}
                                        </p>
                                    </div>
                                )}

                                {/* Solution Section */}
                                {selected.solution && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "#0f1117",
                                                margin: "0 0 8px 0",
                                            }}
                                        >
                                             Solution
                                        </h4>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#5a5450",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {selected.solution}
                                        </p>
                                    </div>
                                )}

                                {/* Learned Section */}
                                {selected.learned && (
                                    <div>
                                        <h4
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "#0f1117",
                                                margin: "0 0 8px 0",
                                            }}
                                        >
                                             What I Learned
                                        </h4>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#5a5450",
                                                whiteSpace: "pre-wrap",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {selected.learned}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* NEW ENTRY MODAL */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            background: "var(--surface)",
                            borderRadius: "8px",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                            width: "90%",
                            maxWidth: "700px",
                            maxHeight: "90vh",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* MODAL HEADER */}
                        <div
                            style={{
                                padding: "24px",
                                borderBottom: "1px solid #e1ddd4",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontSize: "28px",
                                        marginBottom: "8px",
                                    }}
                                >
                                </div>
                                <h3
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 700,
                                        color: "#0f1117",
                                        margin: 0,
                                        marginBottom: "4px",
                                    }}
                                >
                                    New Journal Entry
                                </h3>
                                <p
                                    style={{
                                        fontSize: "13px",
                                        color: "#8b949e",
                                        margin: 0,
                                    }}
                                >
                                    Capture your learning journey
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#8b949e",
                                    padding: 0,
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                ?
                            </button>
                        </div>

                        {/* MODAL BODY */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "24px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "20px",
                            }}
                        >
                            {/* TYPE SELECTION GRID */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#0f1117",
                                        marginBottom: "12px",
                                    }}
                                >
                                    Entry Type
                                </label>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: "12px",
                                    }}
                                >
                                    {[
                                        {
                                            icon: "",
                                            label: "Bug Log",
                                            value: "bug",
                                        },
                                        {
                                            icon: "",
                                            label: "Solution",
                                            value: "solution",
                                        },
                                        {
                                            icon: "",
                                            label: "Daily Note",
                                            value: "note",
                                        },
                                        {
                                            icon: "",
                                            label: "Challenge",
                                            value: "challenge",
                                        },
                                    ].map((type) => (
                                        <div
                                            key={type.value}
                                            onClick={() =>
                                                setSelectedType(type.value)
                                            }
                                            style={{
                                                padding: "16px",
                                                border:
                                                    selectedType === type.value
                                                        ? "2px solid #c8401a"
                                                        : "1px solid #e1ddd4",
                                                borderRadius: "6px",
                                                background:
                                                    selectedType === type.value
                                                        ? "#fff5e6"
                                                        : "#f9f9f9",
                                                cursor: "pointer",
                                                textAlign: "center",
                                                transition: "all 0.2s",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (
                                                    selectedType !== type.value
                                                ) {
                                                    e.currentTarget.style.borderColor =
                                                        "#d0ccc3";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (
                                                    selectedType !== type.value
                                                ) {
                                                    e.currentTarget.style.borderColor =
                                                        "#e1ddd4";
                                                }
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "24px",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                {type.icon}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 600,
                                                    color:
                                                        selectedType ===
                                                        type.value
                                                            ? "#c8401a"
                                                            : "#5a5450",
                                                }}
                                            >
                                                {type.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TITLE INPUT */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#0f1117",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="What's the title of this entry?"
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        fontSize: "14px",
                                        border: "1px solid #e1ddd4",
                                        borderRadius: "4px",
                                        fontFamily: "Inter, sans-serif",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            {/* DESCRIPTION TEXTAREA */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#0f1117",
                                        marginBottom: "6px",
                                    }}
                                >
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Briefly describe this problem or topic..."
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        padding: "8px 12px",
                                        fontSize: "14px",
                                        border: "1px solid #e1ddd4",
                                        borderRadius: "4px",
                                        fontFamily: "Inter, sans-serif",
                                        boxSizing: "border-box",
                                        resize: "vertical",
                                    }}
                                />
                            </div>

                            {/* LANGUAGE + TOPIC ROW */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px",
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#0f1117",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Language
                                    </label>
                                    <select
                                        value={formData.language}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                language: e.target.value,
                                            })
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            border: "1px solid #e1ddd4",
                                            borderRadius: "4px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        <option>JavaScript</option>
                                        <option>TypeScript</option>
                                        <option>Python</option>
                                        <option>Java</option>
                                        <option>C++</option>
                                        <option>Go</option>
                                        <option>Rust</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#0f1117",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Topic Tag
                                    </label>
                                    <select
                                        value={formData.topic}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                topic: e.target.value,
                                            })
                                        }
                                        style={{
                                            width: "100%",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            border: "1px solid #e1ddd4",
                                            borderRadius: "4px",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                    >
                                        <option>General</option>
                                        <option>Algorithms</option>
                                        <option>Data Structures</option>
                                        <option>React</option>
                                        <option>Web Dev</option>
                                        <option>Backend</option>
                                        <option>Database</option>
                                        <option>DevOps</option>
                                    </select>
                                </div>
                            </div>

                            {/* STATUS SELECTOR */}
                            <div>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#0f1117",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Initial Status
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                    }}
                                >
                                    {["Open", "Learning", "Solved"].map(
                                        (status) => (
                                            <button
                                                key={status}
                                                onClick={() =>
                                                    setFormData({
                                                        ...formData,
                                                        status,
                                                    })
                                                }
                                                style={{
                                                    flex: 1,
                                                    padding: "8px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    border:
                                                        formData.status ===
                                                        status
                                                            ? "2px solid #c8401a"
                                                            : "1px solid #e1ddd4",
                                                    borderRadius: "4px",
                                                    background:
                                                        formData.status ===
                                                        status
                                                            ? "#fff5e6"
                                                            : "#f9f9f9",
                                                    color:
                                                        formData.status ===
                                                        status
                                                            ? "#c8401a"
                                                            : "#5a5450",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {status}
                                            </button>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* MODAL FOOTER */}
                        <div
                            style={{
                                padding: "16px 24px",
                                borderTop: "1px solid var(--border)",
                                display: "flex",
                                gap: "12px",
                                justifyContent: "flex-end",
                            }}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    background: "var(--surface2)",
                                    color: "var(--ink2)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                    cursor: submitting
                                        ? "not-allowed"
                                        : "pointer",
                                    transition: "all 0.2s",
                                    opacity: submitting ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.background =
                                            "var(--surface2)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.background =
                                            "var(--surface2)";
                                    }
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!formData.title || !selectedType) {
                                        alert(
                                            "Please fill in title and select a type",
                                        );
                                        return;
                                    }
                                    setSubmitting(true);
                                    try {
                                        const token =
                                            localStorage.getItem("token");
                                        const response = await fetch(
                                            buildApiUrl("/api/problems"),
                                            {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type":
                                                        "application/json",
                                                    Authorization: `Bearer ${token}`,
                                                },
                                                body: JSON.stringify({
                                                    title: formData.title,
                                                    type: selectedType,
                                                    status: formData.status,
                                                    lang: formData.language,
                                                    problem: formData.problem,
                                                    solution: formData.solution,
                                                    learned: formData.learned,
                                                    description: formData.description,
                                                }),
                                            },
                                        );
                                        if (!response.ok)
                                            throw new Error("Failed to create");
                                        const newProblem =
                                            await response.json();
                                        setProblems([...problems, newProblem]);
                                        setSelectedId(newProblem.id);
                                        setShowModal(false);
                                    } catch (err) {
                                        alert("Error creating entry");
                                        console.error(err);
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                                disabled={submitting}
                                style={{
                                    padding: "8px 16px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    background: "#c8401a",
                                    color: "var(--surface)",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: submitting
                                        ? "not-allowed"
                                        : "pointer",
                                    transition: "all 0.2s",
                                    opacity: submitting ? 0.8 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.background =
                                            "#a63015";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!submitting) {
                                        e.currentTarget.style.background =
                                            "#c8401a";
                                    }
                                }}
                            >
                                {submitting ? "Creating..." : "Create Entry "}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editMode && selected && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                    onClick={() => setEditMode(false)}
                >
                    <div
                        style={{
                            background: "var(--surface)",
                            borderRadius: "8px",
                            padding: "24px",
                            width: "90%",
                            maxWidth: "600px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 16px 0" }}>Edit Entry</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <input
                                value={editData.title}
                                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                placeholder="Title"
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}
                            />
                            <textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                placeholder="Description"
                                rows={3}
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)", resize: "vertical" }}
                            />
                            <textarea
                                value={editData.problem}
                                onChange={(e) => setEditData({ ...editData, problem: e.target.value })}
                                placeholder="Problem"
                                rows={4}
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}
                            />
                            <textarea
                                value={editData.solution}
                                onChange={(e) => setEditData({ ...editData, solution: e.target.value })}
                                placeholder="Solution"
                                rows={4}
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}
                            />
                            <textarea
                                value={editData.learned}
                                onChange={(e) => setEditData({ ...editData, learned: e.target.value })}
                                placeholder="What I learned"
                                rows={3}
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid var(--border)" }}
                            />
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
                                <button
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        padding: "8px 16px",
                                        background: "var(--surface2)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    style={{
                                        padding: "8px 16px",
                                        background: "#c8401a",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
