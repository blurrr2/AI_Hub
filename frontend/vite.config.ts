import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    base: "/AI_Hub/",
    plugins: [react()],
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3001",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "/api"),
            },
        },
        hmr: {
            host: "localhost",
            port: 5173,
            protocol: "ws",
        },
        watch: {
            usePolling: true,
            interval: 100,
        },
        middlewareMode: false,
        cors: true,
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "[name].[hash].js",
                chunkFileNames: "[name].[hash].js",
                assetFileNames: "[name].[hash].[ext]",
            },
        },
    },
});
