import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "../components/SocketProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://uw-guesser.vercel.app'),
  title: "UW Guesser",
  description: "A game for guessing locations at the University of Waterloo",
  keywords: "waterloo, uwaterloo, campus, guessing game, geoguessr, map, university, location, education, fun, Uwaterloo guesser, UW Guesser, Waterloo Guesser",
  authors: [
    { name: "Senthil Kirthieswar" },
    { name: "Apilaash Yoharan" }
  ],
  openGraph: {
    title: "UW Guesser - Guess the Waterloo Campus Location!",
    description: "A game for guessing locations at the University of Waterloo.",
    type: "website",
    url: "https://uw-guesser.vercel.app",
    siteName: "UW Guesser",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="UW Guesser" />
        <meta name="google-site-verification" content="N5yttaGD2H0Le5FUfRPbNRnAbWkVaQQ3gw16YdSRiUc" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="keywords" content="waterloo, uwaterloo, campus, guessing game, geoguessr, map, university, location, education, fun, Uwaterloo guesser, UW Guesser, Waterloo Guesser, university of waterloo, waterloo campus, campus game, map game, student life, student game, campus challenge, campus trivia, ontario university, canadian university, geo game, geo challenge, geo guessing, geo campus, geo education, geo trivia, geo fun, geo map, geo university, geo waterloo" />
        <meta name="description" content="A fun, interactive game for guessing locations at the University of Waterloo. Challenge your friends, test your campus knowledge, and explore the UW campus virtually!" />
        <link rel="canonical" href="https://uw-guesser.vercel.app/" />
        {/* Open Graph */}
        <meta property="og:title" content="UW Guesser - Guess the Waterloo Campus Location!" />
        <meta property="og:description" content="A fun, interactive game for guessing locations at the University of Waterloo. Challenge your friends, test your campus knowledge, and explore the UW campus virtually!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://uw-guesser.vercel.app/" />
        <meta property="og:site_name" content="UW Guesser" />
        <meta property="og:image" content="https://uw-guesser.vercel.app/uw-campus-map.png" />
        {/* Structured Data */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "UW Guesser",
              "url": "https://uw-guesser.vercel.app/",
              "description": "A fun, interactive game for guessing locations at the University of Waterloo. Challenge your friends, test your campus knowledge, and explore the UW campus virtually!",
              "author": [
                { "@type": "Person", "name": "Senthil Kirthieswar" },
                { "@type": "Person", "name": "Apilaash Yoharan" }
              ],
              "inLanguage": "en",
              "publisher": {
                "@type": "Organization",
                "name": "UW Guesser"
              }
            }
          `}
        </script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
              <SocketProvider>
        {children}
              </SocketProvider>
      </body>
    </html>
  );
}
