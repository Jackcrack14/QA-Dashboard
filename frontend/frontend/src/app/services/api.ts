import { Question } from "@/types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  getQuestions: async (): Promise<Question[]> => {
    const res = await fetch(`${API_URL}/questions/`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  },

  postQuestion: async (content: string): Promise<Question> => {
    const res = await fetch(`${API_URL}/questions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to post question");
    return res.json();
  },

  markAnswered: async (id: number, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/questions/${id}/answer`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to mark as answered");
  },
  postReply: async (questionId: number, content: string) => {
    const res = await fetch(`${API_URL}/questions/${questionId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to reply");
    return res.json();
  },
  escalateQuestion: async (id: number, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/questions/${id}/escalate`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    if (!res.ok) throw new Error("Failed to escalate");
  },
  upvoteQuestion: async (id: number): Promise<void> => {
    await fetch(`${API_URL}/questions/${id}/upvote`, { method: "POST" });
  },

  getAiSuggestion: async (id: number, token: string): Promise<string> => {
    const res = await fetch(`${API_URL}/questions/${id}/suggest`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.suggestion;
  },
};
