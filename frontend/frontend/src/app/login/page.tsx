"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/signup";
    const url = `http://localhost:8000${endpoint}`;

    let headers: HeadersInit;
    let body: BodyInit;

    if (isLogin) {
      headers = { "Content-Type": "application/x-www-form-urlencoded" };
      body = new URLSearchParams({ username, password });
    } else {
      headers = { "Content-Type": "application/json" };
      body = JSON.stringify({ username, password });
    }

    try {
      const res = await fetch(url, { method: "POST", headers, body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Authentication failed");

      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {isLogin ? "Welcome Back" : "Join the Team"}
          </h1>
          <p className="text-zinc-500 mt-2">
            {isLogin
              ? "Login to manage the Q&A board"
              : "Create an admin account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">
              Username
            </label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              placeholder="admin_user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              className="w-full bg-zinc-950 border border-zinc-800 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={12}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 text-red-400 text-sm rounded-lg border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-lg transition shadow-lg shadow-blue-900/20"
          >
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-zinc-800">
          <p className="text-sm text-zinc-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="text-blue-400 font-semibold hover:text-blue-300 focus:outline-none"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-xs text-zinc-600 hover:text-zinc-400 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
