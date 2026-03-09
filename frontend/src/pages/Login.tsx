import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Login.module.css";

type AuthMode = "login" | "register" | "forgot" | "reset";

interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
    };
}

interface ForgotPasswordResponse {
    message: string;
    resetToken: string;
    expiresIn: string;
}

export const Login: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    // Forgot password / reset password states
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "forgot") {
                // Handle forgot password
                const response = await axios.post("/api/auth/forgot-password", {
                    email,
                });
                setSuccess("Reset token generated!");
                setResetToken(response.data.resetToken);
                setMode("reset");
                setEmail("");
            } else if (mode === "reset") {
                // Handle reset password
                if (newPassword !== confirmPassword) {
                    setError("Passwords do not match");
                    setLoading(false);
                    return;
                }

                await axios.post("/api/auth/reset-password", {
                    token: resetToken,
                    password: newPassword,
                });
                setSuccess("Password reset successfully! Please log in.");
                setResetToken("");
                {mode !== "reset" && mode !== "forgot" && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
                            onClick={() => setMode("login")}
                        >
                            Login
                        </button>
                        <button
                            className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
                            onClick={() => setMode("register")}
                        >
                            Register
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}
                    {success && (
                        <div
                            className={styles.error}
                            style={{ color: "green", borderColor: "green" }}
                        >
                            {success}
                        </div>
                    )}

                    {mode === "reset" ? (
                        <>
                            <div className={styles.formGroup}>
                                <label>Reset Token (auto-filled)</label>
                                <input
                                    type="text"
                                    value={resetToken}
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="new-password">
                                    New Password
                                </label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="Enter new password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="confirm-password">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitBtn}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                style={{
                                    marginTop: "8px",
                                    padding: "8px 16px",
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                            >
                                Back to Login
                            </button>
                        </>
                    ) : mode === "forgot" ? (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="forgot-email">Email</label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitBtn}
                            >
                                {loading ? "Sending..." : "Get Reset Token"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode("login")}
                                style={{
                                    marginTop: "8px",
                                    padding: "8px 16px",
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                            >
                                Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {mode === "register" && (
                                <div className={styles.formGroup}>
                                    <label htmlFor="username">Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Choose a username"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitBtn}
                            >
                                {loading
                                    ? "Loading..."
                                    : mode === "login"
                                      ? "Login"
                                      : "Register"}
                            </button>

                            {mode === "login" && (
                                <button
                                    type="button"
                                    onClick={() => setMode("forgot")}
                                    style={{
                                        marginTop: "8px",
                                        padding: "8px 16px",
                                        background: "transparent",
                                        border: "none",
                                        color: "var(--accent)",
                                        cursor: "pointer",
                                        width: "100%",
                                        fontSize: "14px",
                                    }}
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </>
                    )}nChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>

                    {mode === "register" && (
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitBtn}
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
