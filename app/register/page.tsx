"use client";

import { useRef, useState } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/components/SessionProvider";

export default function RegisterPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [department, setDepartment] = useState<string>("Arts");
  const [waterlooUsername, setWaterlooUsername] = useState<string>("");
  const [emailLocked, setEmailLocked] = useState<boolean>(false);
  const [departmentLocked, setDepartmentLocked] = useState<boolean>(false);

  const router = useRouter();
  const processing = useRef(false);
  const { register } = useSession();

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing.current) return;

    processing.current = true;

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const waterlooUsername = formData.get("waterloousername") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const result = await register({
      username,
      waterlooUsername,
      email,
      department,
      password,
      confirmPassword,
    });
    setToast(result.message);

    if (result.success) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/");
    }

    processing.current = false;
  }

  async function getAccountData(waterlooUsername: string) {
    console.log("Getting account data...");

    const data = await fetch(
      `${process.env.NEXT_PUBLIC_LINK}/api/auth/getUserInfo?user=${waterlooUsername}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (data.ok) {
      const user = await data.json();
      console.log(user);
      if (user.email) {
        setEmailLocked(true);
        setEmail(user.email);
      } else {
        setEmailLocked(false);
        setEmail("");
      }

      if (user.department) {
        setDepartmentLocked(true);
        setDepartment(user.department);
      } else {
        setDepartmentLocked(false);
        setDepartment("Arts");
      }
    }
  }

  // Debounce helper
  function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Debounced version of getAccountData
  const debouncedGetAccountData = useCallback(
    debounce(getAccountData, 600),
    []
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center text-black"
        onSubmit={handleRegister}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Register</h1>

        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          name="waterloousername"
          placeholder="Waterloo Username"
          value={waterlooUsername}
          onChange={(e) => {
            setWaterlooUsername(e.target.value);
            debouncedGetAccountData(e.target.value);
          }}
          onBlur={(e) => getAccountData(e.target.value)}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            if (!emailLocked) setEmail(e.target.value);
          }}
          disabled={emailLocked}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          name="department"
          value={department}
          onChange={(e) => {
            if (!departmentLocked) setDepartment(e.target.value);
          }}
          disabled={departmentLocked}
          className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Arts">Arts</option>
          <option value="Engineering">Engineering</option>
          <option value="Environment">Environment</option>
          <option value="Health">Health</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
          <option value="Other">Other</option>
        </select>

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

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-6 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute top-1/4 right-4 text-sm text-blue-600 hover:underline focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showConfirmPassword ? "Hide" : "Show"}
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
