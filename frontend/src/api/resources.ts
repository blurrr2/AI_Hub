import axios from "axios";

export const getResources = (params?: object) =>
    axios.get("/api/resources", { params });

export const createResource = (data: object) =>
    axios.post("/api/resources", data);

export const updateResource = (id: number, data: object) =>
    axios.put(`/api/resources/${id}`, data);

export const deleteResource = (id: number) =>
    axios.delete(`/api/resources/${id}`);

export const scrapeUrl = (url: string) =>
    axios.post("/api/resources/scrape", { url });

export const getCommunity = (params?: object) =>
    axios.get("/api/resources/community/all", { params });
