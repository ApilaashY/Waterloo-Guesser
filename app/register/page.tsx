"use client";

import { useRef, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const processing = useRef(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing.current) return;

    processing.current = true;

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LINK}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    setToast(data.message);

    if (res.ok) {
      Cookies.set("user", JSON.stringify(data.user));
      await setTimeout(() => {
        router.push("/");
      }, 1000);
    }
    processing.current = false;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center"
        onSubmit={handleRegister}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Register</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/4 right-4 text-sm text-blue-600 hover:underline focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          type="submit"
          value="Register"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                      transition-colors duration-200 cursor-pointer"
        />

        {toast && setTimeout(() => setToast(null), 5000) && (
          <div
            className={`mt-4 p-3 ${
              toast.startsWith("Registration successful")
                ? "bg-green-100"
                : "bg-yellow-100"
            } ${
              toast.startsWith("Registration successful")
                ? "text-green-800"
                : "text-yellow-800"
            } rounded-md text-sm`}
          >
            {toast}
          </div>
        )}

        <Link href="/login">
          <p className="mt-4 text-sm text-gray-600">Already have an Account</p>
        </Link>
      </form>
    </div>
  );
}
