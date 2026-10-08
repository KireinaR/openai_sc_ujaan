"use client";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("cc_theme", next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn btn-ghost !px-2.5"
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {/* Shown in light mode: sun. CSS (driven by [data-theme]) swaps these, no JS state needed. */}
      <svg className="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="4.5" />
        <path strokeLinecap="round" d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
      <svg className="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
