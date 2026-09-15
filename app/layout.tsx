import type { Metadata } from "next";
import { Playfair_Display, Crimson_Pro, Oswald } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const body = Crimson_Pro({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const chrome = Oswald({
  variable: "--font-chrome",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Carnival of Lies",
  description: "A campus-wide detective hunt. Seven suspects. One murderer. Trust nothing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${chrome.variable} h-full`}
    >
      <body className="min-h-full flex flex-col grain-bg">{children}</body>
    </html>
  );
}
