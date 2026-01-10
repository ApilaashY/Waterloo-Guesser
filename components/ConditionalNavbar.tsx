"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// Routes where the navbar should be hidden
const HIDDEN_NAVBAR_ROUTES = ["/tutorial", "/game", "/versus"];

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Hide navbar on certain routes
    const shouldHide = HIDDEN_NAVBAR_ROUTES.some(route => pathname?.startsWith(route));

    if (shouldHide) {
        return null;
    }

    return <Navbar />;
}
