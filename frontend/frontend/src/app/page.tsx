"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/app/hooks/useSocket";
import { validateWithXHR } from "@/app/lib/validation";
import { api } from "@/app/services/api";
import { Question } from "@/types/types";

export default function Dashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const [loadingAi, setLoadingAi] = useState<number | null>(null);

  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/api/v1/questions/ws";
  const { lastMessage, status, refreshConnection } = useSocket(wsUrl);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAdmin(!!token);

    api
      .getQuestions()
      .then(setQuestions)
      .catch((err) => console.error("Failed to load questions", err));
  }, []);

  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "NEW_QUESTION") {
      const newQ = {
        ...lastMessage.data,
        replies: lastMessage.data.replies || [],
      };
      setQuestions((prev) => [newQ, ...prev]);
    } else if (lastMessage.type === "UPDATE_QUESTION") {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === lastMessage.data.id
            ? { ...lastMessage.data, replies: lastMessage.data.replies || [] }
            : q
        )
      );
    }
  }, [lastMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const isValid = await validateWithXHR(input);
      if (!isValid) {
        setError("Question cannot be empty (Validated via legacy XHR).");
        return;
      }
      await api.postQuestion(input);
      setInput("");
    } catch (err) {
      setError("Failed to post question.");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, questionId: number) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    try {
      await api.postReply(questionId, replyInput);
      setReplyInput("");
    } catch (err) {
      alert("Failed to post reply");
    }
  };

  const handleMarkAnswered = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      await api.markAnswered(id, token);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEscalate = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      await api.escalateQuestion(id, token);
    } catch (e) {
      console.error(e);
      alert("Failed to escalate question");
    }
  };

  const handleUpvote = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await api.upvoteQuestion(id);
  };

  const handleAiSuggest = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingAi(id);
    try {
      const suggestion = await api.getAiSuggestion(id, token);
      setReplyInput(suggestion);
    } catch (err) {
      alert("AI Service unavailable");
    } finally {
      setLoadingAi(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    refreshConnection();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Founder Q&A
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {/* Live Status Indicator */}
              <span
                className={`h-2 w-2 rounded-full ${
                  status === "OPEN"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              ></span>
              <p className="text-xs text-zinc-400">
                {status === "OPEN"
                  ? "Live System Operational"
                  : "Reconnecting..."}
              </p>
            </div>
          </div>

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-green-400 bg-green-900/30 border border-green-800 px-3 py-1 rounded-full uppercase tracking-wider">
                  Admin Mode
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-white transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md font-medium transition shadow-lg shadow-blue-900/20"
              >
                Admin Login
              </Link>
            )}
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-zinc-900/50 p-6 rounded-2xl shadow-xl border border-zinc-800/50 mb-10 backdrop-blur-sm">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Ask a Question
            </label>
            <textarea
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none text-zinc-200 placeholder-zinc-600 transition-all"
              placeholder="What would you like to ask the founders?"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-red-400 text-sm font-medium">{error}</span>
              <button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-white/5"
              >
                Post Question
              </button>
            </div>
          </form>
        </section>

        {/* Live Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Live Feed</h2>
            <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              {questions.length} Questions
            </span>
          </div>

          {questions.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
              <p className="text-zinc-500">No questions yet. Be the first!</p>
            </div>
          )}

          {/* Sorting Logic: Escalated -> Votes -> Time */}
          {questions
            .sort((a, b) => {
              if (a.status === "Escalated" && b.status !== "Escalated")
                return -1;
              if (b.status === "Escalated" && a.status !== "Escalated")
                return 1;

              if (b.votes !== a.votes) return (b.votes || 0) - (a.votes || 0);

              return (
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
              );
            })
            .map((q) => (
              <div
                key={q.id}
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  q.status === "Escalated"
                    ? "bg-red-950/20 border-red-900/50 shadow-red-900/10"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 shadow-sm"
                }`}
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">
                      {new Date(q.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {/* Upvote Badge */}
                    <button
                      onClick={(e) => handleUpvote(e, q.id)}
                      className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-[10px] text-zinc-300 transition border border-zinc-700"
                      title="Upvote this question"
                    >
                      <span className="text-blue-400">▲</span>
                      <span className="font-bold">{q.votes || 0}</span>
                    </button>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold tracking-widest uppercase border ${
                      q.status === "Answered"
                        ? "bg-green-950/30 text-green-400 border-green-900/50"
                        : q.status === "Escalated"
                        ? "bg-red-950/30 text-red-400 border-red-900/50"
                        : "bg-yellow-950/30 text-yellow-400 border-yellow-900/50"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <p
                  className={`text-lg leading-relaxed ${
                    q.status === "Answered"
                      ? "text-zinc-500 line-through decoration-zinc-600"
                      : "text-zinc-100"
                  }`}
                >
                  {q.content}
                </p>

                {/* Admin Actions */}
                {isAdmin && q.status !== "Answered" && (
                  <div className="mt-5 pt-4 border-t border-zinc-800 flex gap-4">
                    <button
                      onClick={(e) => handleMarkAnswered(e, q.id)}
                      className="flex items-center text-sm text-green-400 hover:text-green-300 font-medium transition"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Mark Answered
                    </button>
                    {/* Real Functional Escalation Button */}
                    <button
                      onClick={(e) => handleEscalate(e, q.id)}
                      className="flex items-center text-sm text-red-400 hover:text-red-300 font-medium transition"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                      Escalate
                    </button>
                  </div>
                )}

                {/* Accordion: Replies */}
                {expandedId === q.id && (
                  <div
                    className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                      Replies ({q.replies?.length || 0})
                    </h3>

                    {/* List Replies */}
                    <div className="space-y-3 mb-6">
                      {(!q.replies || q.replies.length === 0) && (
                        <p className="text-zinc-600 text-sm italic">
                          No replies yet. Start the conversation!
                        </p>
                      )}
                      {q.replies?.map((reply: any) => (
                        <div
                          key={reply.id}
                          className="bg-zinc-950 p-4 rounded-lg border border-zinc-800"
                        >
                          <p className="text-sm text-zinc-300">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={(e) => handleReplySubmit(e, q.id)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder={
                          isAdmin
                            ? "Type reply or use AI ✨"
                            : "Write a reply..."
                        }
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                      />

                      {/* AI Button (Admin Only) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleAiSuggest(e, q.id)}
                          disabled={loadingAi === q.id}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-lg flex items-center justify-center transition shadow-lg shadow-purple-900/20"
                          title="Auto-Draft with AI"
                        >
                          {loadingAi === q.id ? (
                            <span className="animate-spin text-sm">↻</span>
                          ) : (
                            <span className="text-sm">✨</span>
                          )}
                        </button>
                      )}

                      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                        Reply
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
