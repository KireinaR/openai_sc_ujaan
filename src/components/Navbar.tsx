"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useDemoUser } from "@/context/UserContext";

const NAV_LINKS = [
  { href: "/people", label: "People" },
  { href: "/resources", label: "Resources" },
  { href: "/requests", label: "Requests" },
  { href: "/bookmarks", label: "Bookmarks" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { users, currentUserId, setCurrentUserId, currentUser, loading } = useDemoUser();

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/85 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-baseline gap-2 shrink-0">
            <span className="text-lg font-bold tracking-tight">Campus Connect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2.5 rounded-md transition-colors ${
                    active
                      ? "text-[var(--accent)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <select
              aria-label="Browsing as"
              className="select !w-auto text-sm py-2"
              value={currentUserId ?? ""}
              onChange={(e) => setCurrentUserId(e.target.value)}
              disabled={loading || users.length === 0}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
            <Link href="/profile" className="btn btn-secondary text-sm">
              {currentUser ? currentUser.name.split(" ")[0] : "Profile"}
            </Link>
            <Link href="/notifications" className="btn btn-ghost !px-2.5" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path strokeLinecap="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="btn btn-ghost !px-2.5"
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {open ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--border)] px-6 sm:px-8 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-2 py-2.5 rounded-md text-[var(--fg)] hover:bg-[var(--bg-sunken)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="px-2 py-2.5 rounded-md text-[var(--fg)] hover:bg-[var(--bg-sunken)]"
          >
            Notifications
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="px-2 py-2.5 rounded-md text-[var(--fg)] hover:bg-[var(--bg-sunken)]"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="px-2 py-2.5 rounded-md text-[var(--fg)] hover:bg-[var(--bg-sunken)]"
          >
            Settings
          </Link>
          <div className="pt-2 mt-1 border-t border-[var(--border)]">
            <span className="field-label block mb-1.5">Browsing as</span>
            <select
              aria-label="Browsing as"
              className="select text-sm"
              value={currentUserId ?? ""}
              onChange={(e) => setCurrentUserId(e.target.value)}
              disabled={loading || users.length === 0}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
