export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
    /\/$/,
    "",
);

export const buildApiUrl = (path: string): string => {
    if (!path.startsWith("/")) {
        return API_BASE_URL ? `${API_BASE_URL}/${path}` : `/${path}`;
    }

    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
};
