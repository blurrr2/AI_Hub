import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/auth/forgot-password", {
                email,
            });
            setToken(response.data.token);
            setMessage(response.data.message);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "Failed to send reset link");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--bg)",
                padding: "20px",
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "32px",
                    maxWidth: "400px",
                    width: "100%",
                    border: "1px solid #e5ddd2",
                }}
            >
                <h2
                    style={{
                        margin: "0 0 24px 0",
                        fontSize: "24px",
                        fontWeight: 700,
                        color: "#1a1612",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    Forgot Password
                </h2>

                {error && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            backgroundColor: "#fee",
                            border: "1px solid #fcc",
                            borderRadius: "6px",
                            color: "#c00",
                            fontSize: "14px",
                        }}
                    >
                        {error}
                    </div>
                )}

                {message && token && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "12px",
                            backgroundColor: "#efe",
                            border: "1px solid #cfc",
                            borderRadius: "6px",
                            color: "#060",
                            fontSize: "14px",
                        }}
                    >
                        <div style={{ marginBottom: "8px" }}>{message}</div>
                        <div
                            style={{
                                padding: "8px",
                                backgroundColor: "#fff",
                                border: "1px solid #cfc",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontFamily: "monospace",
                                wordBreak: "break-all",
                                marginBottom: "8px",
                            }}
                        >
                            {token}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(token);
                            }}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#060",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "pointer",
                                marginRight: "8px",
                            }}
                        >
                            Copy Token
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/reset-password?token=${token}`)}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#060",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                        >
                            Go to Reset Page
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            htmlFor="email"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#1a1612",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #e5ddd2",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "10px 16px",
                            backgroundColor: "#c8401a",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                            fontFamily: "Inter, sans-serif",
                            marginBottom: "12px",
                        }}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={{
                            width: "100%",
                            padding: "10px 16px",
                            backgroundColor: "transparent",
                            color: "#1a1612",
                            border: "1px solid #e5ddd2",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
};
