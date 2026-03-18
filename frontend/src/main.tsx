import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.tsx";
import { API_BASE_URL } from "./api/config";

axios.defaults.baseURL = API_BASE_URL;

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    console.log('Axios interceptor - Token:', token ? 'exists' : 'missing');
    console.log('Axios interceptor - URL:', config.url);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
