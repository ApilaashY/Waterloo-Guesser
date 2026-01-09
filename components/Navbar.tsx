"use client";

import { useState, useEffect } from "react";
import { useSession } from "./SessionProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./Logo";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const isHomePage = pathname === "/";
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (isHomePage) {
      const animationTimer = setTimeout(() => {
        setAnimationComplete(true);
      }, 2000);

      return () => {
        clearTimeout(animationTimer);
      };
    }
  }, [isHomePage]);

  // Early return AFTER all hooks
  if (pathname && pathname.toLowerCase().endsWith("/game")) {
    return null;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full absolute top-4 left-0 z-50 bg-transparent px-4 py-2 mx-auto">
      <div className="flex items-center w-full">
        {/* Logo - left side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center gap-1">
            {isHomePage ? (
              <Logo
                animationComplete={animationComplete}
                isHeroPage={isHomePage}
              />
            ) : (
              <img
                src="/6-UWGuesser logo-colored.png"
                alt="UW Guesser Logo"
                className="h-20 w-auto"
              />
            )}
            <span className="sr-only">UW Guesser</span>
          </Link>
        </div>

        {/* Spacer to push auth section to the right */}
        <div className="flex-1"></div>

        {/* Auth section - desktop, always right-aligned */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-white/80">
                Welcome, {user?.username}
              </span>
              <div className="relative">
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-white px-4 py-2 rounded transition shadow-xs hover:bg-white/10 cursor-pointer"
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <span className="flex items-center justify-center">
                      <span className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                      Logging out...
                    </span>
                  ) : (
                    "Logout"
                  )}
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className={`text-sm font-semibold px-4 py-2 rounded transition shadow-xs ${
                isHomePage ? "text-white" : "text-yellow-900"
              }`}
              style={{
                backgroundColor: isHomePage ? "#3D52D5" : "#FFD600",
              }}
            >
              Log in →
            </Link>
          )}
        </div>

        {/* Hamburger for mobile - right side */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div
          className={`fixed inset-y-0 left-0 z-50 w-3/4 overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10 transform transition-transform duration-500 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <img
                src="/UWguesser-logo-beige.png"
                alt="UW Guesser Logo"
                className="h-10 opacity-50"
              />
              <span className="text-white text-lg font-bold tracking-tight">
                UW Guesser
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-2 text-gray-200"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="py-6">
                {isAuthenticated ? (
                  <>
                    <div className="mb-4 text-white/80 text-sm px-3">
                      Welcome, {user?.username}
                    </div>
                    <div className="relative">
                      <button
                        onClick={handleLogout}
                        className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-white/10"
                        disabled={loggingOut}
                      >
                        {loggingOut ? (
                          <span className="flex items-center justify-center">
                            <span className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                            Logging out...
                          </span>
                        ) : (
                          "Logout"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={`-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold ${
                      isHomePage ? "text-white" : "text-yellow-900"
                    }`}
                    style={{
                      backgroundColor: isHomePage ? "#3D52D5" : "#FFD600",
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out ${
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          {" "}
        </div>
      </div>
    </nav>
  );
}
