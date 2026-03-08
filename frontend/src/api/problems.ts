import axios from "axios";

export type ProblemType = "bug" | "solution" | "note" | "challenge";
export type ProblemStatus = "Open" | "Solved" | "Learning" | "Done";

export interface Problem {
    id: number;
    userId: number;
    type: ProblemType;
    title: string;
    language: string;
    tag: string;
    status: ProblemStatus;
    problem: string;
    solution: string;
    learned: string;
    createdAt: string;
}

export interface CreateProblemData {
    type: ProblemType;
    title: string;
    language: string;
    tag: string;
    status: ProblemStatus;
    problem: string;
    solution: string;
    learned: string;
}

export const getProblems = (params?: Record<string, string>) =>
    axios.get("/api/problems", { params });

export const createProblem = (data: CreateProblemData) =>
    axios.post("/api/problems", data);

export const updateProblem = (id: number, data: Partial<Problem>) =>
    axios.put(`/api/problems/${id}`, data);

export const deleteProblem = (id: number) =>
    axios.delete(`/api/problems/${id}`);
