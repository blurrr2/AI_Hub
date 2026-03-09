import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { NewsFeed } from "./pages/NewsFeed";
import Library from "./pages/Library";
import Journal from "./pages/Journal";
import "./App.css";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <ThemeProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/news"
                        element={
                            <ProtectedRoute>
                                <NewsFeed />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/library"
                        element={
                            <ProtectedRoute>
                                <Library />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/journal"
                        element={
                            <ProtectedRoute>
                                <Journal />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </ThemeProvider>
    );
}

export default App;
