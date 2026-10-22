import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prehendo: Every post is a case",
  description:
    "A detective mini game that teaches students aged 13–16 to spot fake news, powered by open-weight AI (Gemma 4) with teachers in the loop.",
};

export const viewport: Viewport = {
  themeColor: "#12101c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Fonts load in the browser, so the build never needs network access. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Nunito:wght@400;600;700;800&family=Special+Elite&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
