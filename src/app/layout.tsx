import type { Metadata } from "next";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";
import ThemeScript from "@/components/ThemeScript";
import Navbar from "@/components/Navbar";
import RouteProgress from "@/components/RouteProgress";
import { UserProvider } from "@/context/UserContext";
import { BookmarksProvider } from "@/context/BookmarksContext";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Campus Connect",
  description:
    "Find the people, knowledge, and resources you need — one search across your campus.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSerif.variable} h-full`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <UserProvider>
          <BookmarksProvider>
            <RouteProgress />
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <footer className="border-t border-[var(--border)] py-10 mt-20">
              <div className="mx-auto max-w-6xl px-6 sm:px-8 text-sm text-[var(--fg-subtle)] italic flex flex-col sm:flex-row gap-2 sm:gap-6 justify-between">
                <span>Campus Connect — a campus utility, not a chatbot.</span>
                <span>Demo data only.</span>
              </div>
            </footer>
          </BookmarksProvider>
        </UserProvider>
      </body>
    </html>
  );
}
