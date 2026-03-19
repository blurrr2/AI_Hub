import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { NewsFeed } from "./pages/NewsFeed";
import Library from "./pages/Library";
import Journal from "./pages/Journal";
import Community from "./pages/Community";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";
import MobileHeader from "./components/MobileHeader";
import "./App.css";
import * as React from "react";

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

// Layout wrapper for protected routes
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <>
            <MobileHeader />
            {children}
            <BottomNav />
        </>
    );
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
                                <ProtectedLayout>
                                    <Dashboard />
                                </ProtectedLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/news"
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout>
                                    <NewsFeed />
                                </ProtectedLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/library"
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout>
                                    <Library />
                                </ProtectedLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/journal"
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout>
                                    <Journal />
                                </ProtectedLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/community"
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout>
                                    <Community />
                                </ProtectedLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProtectedLayout>
                                    <Profile />
                                </ProtectedLayout>
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
