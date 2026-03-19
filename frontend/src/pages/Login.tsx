import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PasswordInput from "../components/PasswordInput";

type AuthMode = "login" | "register";

interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [resetToken, setResetToken] = useState("");
    const [forgotSuccess, setForgotSuccess] = useState("");
    const [showResetForm, setShowResetForm] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint =
                mode === "login" ? "/api/auth/login" : "/api/auth/register";
            const payload =
                mode === "login"
                    ? { email, password }
                    : { email, username, password };

            const response = await axios.post<LoginResponse>(endpoint, payload);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            navigate("/dashboard");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || "An error occurred");
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/auth/forgot-password", {
                email: forgotEmail,
            });
            setResetToken(response.data.token);
            setForgotSuccess(response.data.message);
            setShowResetForm(true);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error || "Failed to send reset link",
                );
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setForgotLoading(true);
        try {
            await axios.post("/api/auth/reset-password", {
                token: resetToken,
                password: newPassword,
                confirmPassword,
            });
            setForgotSuccess("Password reset successfully! Please log in.");
            setTimeout(() => {
                setShowForgotPassword(false);
                setShowResetForm(false);
                setForgotEmail("");
                setResetToken("");
                setNewPassword("");
                setConfirmPassword("");
                setForgotSuccess("");
            }, 2000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error || "Failed to reset password",
                );
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setForgotLoading(false);
        }
    };

    // Forgot Password Modal
    if (showForgotPassword) {
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

                    {!showResetForm ? (
                        <form onSubmit={handleForgotPassword}>
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
                            {forgotSuccess && resetToken && (
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
                                    <div style={{ marginBottom: "8px" }}>
                                        {forgotSuccess}
                                    </div>
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
                                        {resetToken}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                resetToken,
                                            );
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
                                        onClick={() => setShowResetForm(true)}
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

                            <div style={{ marginBottom: "16px" }}>
                                <label
                                    htmlFor="forgot-email"
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
                                    id="forgot-email"
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) =>
                                        setForgotEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                    disabled={forgotLoading}
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
                                disabled={forgotLoading}
                                style={{
                                    width: "100%",
                                    padding: "10px 16px",
                                    backgroundColor: "#c8401a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: forgotLoading
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: forgotLoading ? 0.6 : 1,
                                    fontFamily: "Inter, sans-serif",
                                    marginBottom: "12px",
                                }}
                            >
                                {forgotLoading
                                    ? "Sending..."
                                    : "Send Reset Link"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setForgotEmail("");
                                    setError("");
                                    setForgotSuccess("");
                                    setResetToken("");
                                }}
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
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
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
                            {forgotSuccess && (
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
                                    {forgotSuccess}
                                </div>
                            )}

                            <div style={{ marginBottom: "16px" }}>
                                <label
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
                                <PasswordInput
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    style={{
                                        marginBottom: "16px",
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label
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
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={forgotLoading}
                                style={{
                                    width: "100%",
                                    padding: "10px 16px",
                                    backgroundColor: "#c8401a",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    cursor: forgotLoading
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity: forgotLoading ? 0.6 : 1,
                                    fontFamily: "Inter, sans-serif",
                                    marginBottom: "12px",
                                }}
                            >
                                {forgotLoading
                                    ? "Resetting..."
                                    : "Reset Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowResetForm(false);
                                    setForgotEmail("");
                                    setResetToken("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setError("");
                                    setForgotSuccess("");
                                }}
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
                                Back
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

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
                    borderRadius: "16px",
                    padding: "40px",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.03)",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        margin: "0 0 8px 0",
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#1a1612",
                        fontFamily: "Inter, sans-serif",
                        letterSpacing: "-0.5px",
                    }}
                >
                    AI·HUB
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        margin: "0 0 32px 0",
                        fontSize: "13px",
                        color: "#999",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    Your AI Learning Dashboard
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        marginBottom: "32px",
                        backgroundColor: "var(--bg)",
                        borderRadius: "12px",
                        padding: "4px",
                    }}
                >
                    <button
                        onClick={() => setMode("login")}
                        style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: "none",
                            backgroundColor:
                                mode === "login" ? "#c8401a" : "transparent",
                            color: mode === "login" ? "white" : "#666",
                            cursor: "pointer",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            fontWeight: 600,
                            fontSize: "14px",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode("register")}
                        style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: "none",
                            backgroundColor:
                                mode === "register" ? "#c8401a" : "transparent",
                            color: mode === "register" ? "white" : "#666",
                            cursor: "pointer",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                            fontWeight: 600,
                            fontSize: "14px",
                            fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
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
                                padding: "12px",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontFamily: "Inter, sans-serif",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {mode === "register" && (
                        <div style={{ marginBottom: "16px" }}>
                            <label
                                htmlFor="username"
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    color: "#1a1612",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontFamily: "Inter, sans-serif",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: "8px" }}>
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
                            Password
                        </label>
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    {mode === "login" && (
                        <div
                            style={{ textAlign: "right", marginBottom: "16px" }}
                        >
                            <span
                                onClick={() => setShowForgotPassword(true)}
                                style={{
                                    fontSize: "12px",
                                    color: "#c8401a",
                                    cursor: "pointer",
                                    fontFamily: "Inter, sans-serif",
                                }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            backgroundColor: "#c8401a",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.6 : 1,
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.backgroundColor = "#a83315";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#c8401a";
                        }}
                    >
                        {loading
                            ? "Loading..."
                            : mode === "login"
                              ? "Login"
                              : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};
