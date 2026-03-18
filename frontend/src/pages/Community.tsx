import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useEffect, useState } from "react";
import { buildApiUrl } from "../api/config";

interface CommunityEntry {
    id: string;
    title: string;
    type: string;
    status: string;
    language?: string;
    description?: string;
    problem?: string;
    solution?: string;
    learned?: string;
    createdAt: string;
    user: { username: string };
    _count: { likes: number; comments: number };
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { username: string };
}

export default function Community() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [entries, setEntries] = useState<CommunityEntry[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(buildApiUrl("/api/community"), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setEntries(data);
                if (data.length > 0) setSelectedId(data[0].id);
            } catch {
                console.error("Failed to load community entries");
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    useEffect(() => {
        if (!selectedId) {
            setComments([]);
            return;
        }

        let cancelled = false;
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(buildApiUrl(`/api/problems/${selectedId}/comments`), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok && !cancelled) {
                    const data = await response.json();
                    setComments(data);
                }
            } catch {
                if (!cancelled) {
                    console.error("Failed to load comments");
                }
            }
        };
        fetchComments();

        return () => {
            cancelled = true;
        };
    }, [selectedId]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleLike = async (id: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(buildApiUrl(`/api/problems/${id}/like`), {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setEntries(entries.map(e => e.id === id ? {
                    ...e,
                    _count: { ...e._count, likes: e._count.likes + (data.liked ? 1 : -1) }
                } : e));
            }
        } catch {
            alert("Failed to like entry");
        }
    };

    const handleAddComment = async () => {
        if (!selectedId || !newComment.trim()) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(buildApiUrl(`/api/problems/${selectedId}/comments`), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newComment }),
            });
            if (response.ok) {
                const comment = await response.json();
                setComments([...comments, comment]);
                setNewComment("");
                setEntries(entries.map(e => e.id === selectedId ? {
                    ...e,
                    _count: { ...e._count, comments: e._count.comments + 1 }
                } : e));
            }
        } catch {
            alert("Failed to add comment");
        }
    };

    const selected = entries.find((e) => e.id === selectedId);

    return (
        <div style={{ display: "flex", height: "100vh", background: "var(--bg)" }}>
            <div className="sidebar">
                <Sidebar user={user} onLogout={handleLogout} />
            </div>
            <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 32px", borderBottom: "1px solid var(--border)" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--ink)" }}>Community</h1>
                    <p style={{ fontSize: "14px", color: "var(--ink2)", marginTop: "4px" }}>
                        Explore public journal entries from the community
                    </p>
                </div>

                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    <div style={{
                        width: "320px",
                        borderRight: "1px solid var(--border)",
                        overflowY: "auto"
                    }}>
                        {loading ? (
                            <div style={{ padding: "20px", textAlign: "center", color: "var(--ink2)" }}>Loading...</div>
                        ) : entries.length === 0 ? (
                            <div style={{ padding: "20px", textAlign: "center", color: "var(--ink2)" }}>No public entries yet</div>
                        ) : (
                            entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    onClick={() => setSelectedId(entry.id)}
                                    style={{
                                        padding: "16px",
                                        borderBottom: "1px solid var(--border)",
                                        cursor: "pointer",
                                        background: selectedId === entry.id ? "var(--surface)" : "transparent",
                                    }}
                                >
                                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>{entry.title}</div>
                                    <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
                                        by @{entry.user.username}
                                    </div>
                                    <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "12px", color: "var(--ink2)" }}>
                                        <span>️ {entry._count.likes}</span>
                                        <span> {entry._count.comments}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "24px"
                    }}>
                        {selected ? (
                            <>
                                <div style={{ marginBottom: "24px" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--ink)" }}>{selected.title}</h2>
                                    <div style={{ fontSize: "12px", color: "var(--ink2)", marginTop: "4px" }}>
                                        by @{selected.user.username} • {new Date(selected.createdAt).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                        <span style={{ fontSize: "12px", background: "var(--surface2)", color: "var(--ink2)", padding: "4px 10px", borderRadius: "3px" }}>
                                            {selected.type}
                                        </span>
                                        <span style={{ fontSize: "12px", background: "var(--surface2)", color: "var(--ink2)", padding: "4px 10px", borderRadius: "3px" }}>
                                            {selected.status}
                                        </span>
                                        {selected.language && (
                                            <span style={{ fontSize: "12px", background: "var(--surface2)", color: "var(--ink2)", padding: "4px 10px", borderRadius: "3px" }}>
                                                {selected.language}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleLike(selected.id)}
                                        style={{
                                            marginTop: "12px",
                                            padding: "8px 16px",
                                            fontSize: "14px",
                                            background: "#c8401a",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        ️ Like ({selected._count.likes})
                                    </button>
                                </div>

                                {selected.description && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>Description</h4>
                                        <p style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.6 }}>{selected.description}</p>
                                    </div>
                                )}

                                {selected.problem && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>Problem</h4>
                                        <p style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.problem}</p>
                                    </div>
                                )}

                                {selected.solution && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>Solution</h4>
                                        <p style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.solution}</p>
                                    </div>
                                )}

                                {selected.learned && (
                                    <div style={{ marginBottom: "20px" }}>
                                        <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "8px" }}>What I Learned</h4>
                                        <p style={{ fontSize: "14px", color: "var(--ink2)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.learned}</p>
                                    </div>
                                )}

                                <div style={{ marginTop: "32px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--ink)", marginBottom: "12px" }}>
                                        Comments ({comments.length})
                                    </h4>
                                    <div style={{ marginBottom: "16px" }}>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows={3}
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                fontSize: "14px",
                                                border: "1px solid var(--border)",
                                                borderRadius: "4px",
                                                resize: "vertical",
                                            }}
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            style={{
                                                marginTop: "8px",
                                                padding: "8px 16px",
                                                fontSize: "14px",
                                                background: "#c8401a",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {comments.map((comment) => (
                                            <div key={comment.id} style={{ padding: "12px", background: "var(--surface)", borderRadius: "4px" }}>
                                                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                                                    @{comment.user.username}
                                                </div>
                                                <div style={{ fontSize: "14px", color: "var(--ink2)", marginTop: "4px" }}>
                                                    {comment.content}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "4px" }}>
                                                    {new Date(comment.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", color: "var(--ink2)", marginTop: "40px" }}>
                                Select an entry to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
