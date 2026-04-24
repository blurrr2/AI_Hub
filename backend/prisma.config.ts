import { defineConfig } from "@prisma/config";

export default defineConfig({
    earlyAccess: true,
    // CLI 专用配置：将迁移和结构推送的连接指向直连端口（5432）
    datasource: {
        url: process.env.DIRECT_URL,
    },
});
