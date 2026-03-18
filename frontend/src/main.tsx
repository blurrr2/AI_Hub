import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.tsx";
import { API_BASE_URL } from "./api/config";

axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Keep backend alive (Render free tier sleeps after 15min inactivity)
setInterval(() => {
    fetch('https://ai-hub-4wce.onrender.com/api/health').catch(() => {});
}, 10 * 60 * 1000); // ping every 10 minutes

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
