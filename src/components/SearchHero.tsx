"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = [
  "I need someone who knows C++ and can help me with linked lists.",
  "Find me DBMS Unit 3 notes.",
  "I have an OOP viva tomorrow and need inheritance notes.",
];

export default function SearchHero() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function go(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        action="/search"
        method="get"
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
        className="surface rounded-2xl p-2 flex items-center gap-2"
      >
        <svg
          className="ml-2 shrink-0 text-[var(--fg-subtle)]"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.2-3.2" />
        </svg>
        <input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What are you looking for?"
          className="flex-1 bg-transparent py-3 text-base sm:text-lg outline-none placeholder:text-[var(--fg-subtle)]"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => go(ex)}
            className="tag hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-left"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
