"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession } from './SessionProvider';
export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useSession();
  
  if (pathname && pathname.toLowerCase().endsWith('/game')) {
    return null;
  }
  
  const [active, setActive] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const items = [
    // { id: "home", label: "Home", href: "#" },
    // { id: 'profile', label: 'Profile', href: '#' },
    // { id: 'ranked', label: 'Ranked', href: '#' },
    { id: 'play', label: 'Play', href: '/game' },
    // { id: 'collection', label: 'Collection', href: '#' },
    // { id: "leaderboard", label: "Leaderboard", href: "/leaderboard" },
    // { id: 'store', label: 'Store', href: '#' }
  ];

  return (
    <header className={`w-full bg-transparent fixed top-0 left-0 z-50 transition-all duration-300 ${pathname && pathname.toLowerCase().endsWith('/game') ? (visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none') : 'opacity-100 pointer-events-auto'}`}>
      <nav className="flex items-center justify-center px-6 py-4 max-w-7xl mx-auto relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/UWguesser-logo.png"
            alt="UW Guesser Logo"
            className="h-10 rounded-lg shadow-lg"
          />
          <span className="sr-only">UW Guesser</span>
        </Link>
        {/* Desktop Nav items centered */}
        <div
          className="hidden md:flex flex-1 justify-center gap-8 relative"
          id="nav-items"
        >
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="relative flex items-center justify-center"
            >
              <Link
                href={"/game"}
                className={`relative ${
                  it.id === "play" ? "text-lg md:text-xl" : "text-sm"
                } font-semibold px-6 py-1 transition-all duration-200 ${
                  active === it.id
                    ? "text-[#f4b834]"
                    : "text-white/70 hover:text-white"
                }`}
                onClick={() => setActive(it.id)}
              >
                {it.label}
              </Link>
            </div>
          ))}
        </div>
        {/* Auth section - desktop */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-white/80">
                Welcome, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-white px-4 py-2 rounded transition shadow-xs hover:bg-white/10"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-white px-4 py-2 rounded transition shadow-xs"
              style={{ backgroundColor: "#f4b834" }}
            >
              Log in &rarr;
            </Link>
          )}
        </div>
        {/* Hamburger for mobile */}
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
      </nav>
      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="md:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/UWguesser-logo.png"
                alt="UW Guesser Logo"
                className="h-14 rounded-lg shadow-lg"
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
              <div className="space-y-2 py-6">
                {items.map((it) => (
                  <Link
                    key={it.id}
                    href={it.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-[#f4b834]/20"
                    onClick={() => {
                      setActive(it.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {it.label}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {isAuthenticated ? (
                  <>
                    <div className="mb-4 text-white/80 text-sm px-3">
                      Welcome, {user?.username}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-white/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white"
                    style={{ backgroundColor: "#f4b834" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
