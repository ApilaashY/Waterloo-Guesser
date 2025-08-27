"use client";

import { useState } from "react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState<string>("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_LINK}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    console.log(data);

    setToast(data.message);

    if (res.ok) {
      Cookies.set("user", JSON.stringify(data.user));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center"
        onSubmit={handleLogin}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="submit"
          value="Login"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                      transition-colors duration-200 cursor-pointer"
        />

        {toast && setTimeout(() => setToast(null), 5000) && (
          <div
            className={`mt-4 p-3 ${
              toast.startsWith("Login successful")
                ? "bg-green-100"
                : "bg-yellow-100"
            } ${
              toast.startsWith("Login successful")
                ? "text-green-800"
                : "text-yellow-800"
            } rounded-md text-sm`}
          >
            {toast}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-600">Create an account</p>
      </form>
    </div>
  );
}
