import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        console.log("Reset password submit:", { token, password, confirmPassword });

        if (!token) {
            setError("Token is missing from URL");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            console.log("Sending reset request with:", { token, password, confirmPassword });
            await axios.post("/api/auth/reset-password", {
                token,
                password,
                confirmPassword,
            });
            setSuccess("Password reset successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Reset password error:", err.response?.data);
                setError(err.response?.data?.error || "Failed to reset password");
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
                    Reset Password
                </h2>

                {token && (
                    <div
                        style={{
                            marginBottom: "16px",
                            padding: "8px",
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                        }}
                    >
                        Token: {token.substring(0, 20)}...
                    </div>
                )}

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

                {success && (
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
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            htmlFor="password"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#1a1612",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
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

                    <div style={{ marginBottom: "16px" }}>
                        <label
                            htmlFor="confirmPassword"
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: "#1a1612",
                                fontFamily: "Inter, sans-serif",
                            }}
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
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
                        {loading ? "Resetting..." : "Reset Password"}
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
