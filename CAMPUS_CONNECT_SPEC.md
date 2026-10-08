# Campus Connect — Build Specification

This document is the build spec for **Campus Connect**, a web application. It is written to be handed to Claude Code as the single source of truth for implementation. Follow it precisely; where it is silent, prefer the simplest choice consistent with the principles in Section 10.

---

## 0. Product Summary

Students often need something from other students, but that information is scattered across WhatsApp groups, Google Drive, personal chats, and word of mouth. Campus Connect gives students one place to find:

1. **People** who can help them
2. **Resources** such as notes and PYQs (previous year questions)
3. **Requests** from students who need help

The three systems are connected to each other and to a single natural-language search box, which is the core demo flow (see Section 7).

---

## 1. Tech Stack (required choices)

- **Database:** MongoDB. Connection string comes from the environment variable `MONGODB_URI`. Never hardcode credentials or a connection string. The user will supply the real URI later — build against a local/dev Mongo instance or a placeholder `.env.example` in the meantime.
- **AI / NL understanding:** OpenRouter, used strictly as a query-interpretation layer (see Section 5). API key comes from `OPENROUTER_API_KEY` in env — never hardcoded.
- **Framework:** Next.js (App Router), TypeScript throughout.
- **Styling:** Plain CSS / CSS variables for theming (no Tailwind requirement, but allowed if it stays clean) — see Section 11 for the visual direction.
- Do not introduce other backing services (no Redis, no third-party auth provider, no vector DB) for the MVP — keep the stack to Next.js + MongoDB + OpenRouter.

---

## 2. Domain Model

### 2.1 People (`users` collection)

Each student profile contains:

- Name
- Department
- Year
- Bio
- Skills (array)
- Subjects (array)
- Topics they can help with (array)
- Topics they are learning (array)
- Resources they have shared (references into `resources`)

Students must be searchable/filterable by skills, subjects, department, and year.

### 2.2 Resources (`resources` collection)

Resource types: Notes, PYQs, Lab files, Assignments, Cheat sheets, Slides, Study guides, Reference material.

Each resource contains:

- Title
- Description
- Subject
- Unit
- Topics (array)
- Resource type
- Tags (array)
- Uploader (reference to `users`)
- File/link
- Helpful count
- View/download count

Resources must be searchable, filterable, bookmarkable, and markable as "helpful."

### 2.3 Requests (`requests` collection)

Examples: "Need help with OOP inheritance", "Looking for DBMS Unit 3 notes", "Need a teammate who knows React."

Each request contains:

- Title
- Description
- Subject
- Topics (array)
- Skills (array)
- Urgency
- Creator (reference to `users`)
- Status (e.g. open / in-progress / resolved)
- Responses (array, see `offers`)

### 2.4 Supporting collections

- `offers` — a response from one student to another's request
- `bookmarks` — a user bookmarking a resource (or person/request)
- `notifications` — e.g. "someone responded to your request," "someone bookmarked your resource"

Minimum collection set: `users`, `resources`, `requests`, `offers`, `bookmarks`, `notifications`.

---

## 3. Pages / Routes

```
/
/people
/people/:id
/resources
/resources/:id
/requests
/requests/:id
/search
/profile
/bookmarks
/notifications
/settings
```

Priority order (build these to be fully real and polished first): **Home → Search → People → Resources → Requests → Profile**. Bookmarks, notifications, and settings can be lightweight but must still be functional (not fake/static).

---

## 4. Universal Search — the centerpiece feature

The homepage has one prominent natural-language search box:

```
Find the people, knowledge,
and resources you need.

[ What are you looking for? ]
```

A student types queries like:

- "I need someone who knows C++ and can help me with linked lists."
- "Find me DBMS Unit 3 notes."
- "I have an OOP viva tomorrow. I need someone who understands inheritance and some good notes."

The app interprets intent and searches across **people, resources, and requests simultaneously**, returning structured, categorized results — never a chatbot-style paragraph answer. Example result shape:

```
Searching for:
OOP · inheritance · viva

PEOPLE
Riya Sen — OOP · Java · Inheritance — Can help with OOP
Arjun Das — C++ · OOP · DSA — Can help with inheritance

RESOURCES
OOP Unit 2 Notes
OOP Viva Question Bank
Inheritance Cheat Sheet

REQUESTS
2 students are also looking for OOP help
```

---

## 5. AI Architecture (OpenRouter)

### 5.1 Contract: the model must return structured data only

OpenRouter is used **only** to turn a natural-language query into structured JSON describing search intent. It must never be used to generate a conversational answer shown to the user.

**System-prompt requirements** (enforce all of these):

- Output **JSON only** — no prose, no markdown, no code fences, no explanations before/after the JSON.
- A fixed schema, e.g.:

```json
{
  "intent": "find_people | find_resources | find_requests | mixed_search",
  "skills": ["string"],
  "subjects": ["string"],
  "topics": ["string"],
  "unit": "string | null",
  "resourceTypes": ["string"]
}
```

Examples the model should reproduce:

- "I need someone who knows C++ and can help me with linked lists." →
  ```json
  { "intent": "find_people", "skills": ["C++", "linked lists"], "subjects": [], "topics": ["linked lists"], "resourceTypes": [] }
  ```
- "Find DBMS Unit 3 notes" →
  ```json
  { "intent": "find_resources", "skills": [], "subjects": ["DBMS"], "topics": [], "unit": "3", "resourceTypes": ["notes"] }
  ```
- "I need someone to explain OOP inheritance and some notes" →
  ```json
  { "intent": "mixed_search", "skills": ["OOP", "inheritance"], "subjects": ["OOP"], "topics": ["inheritance"], "resourceTypes": ["notes"] }
  ```

### 5.2 Parsing and validation (server-side, before touching Mongo)

- Parse the raw model response as JSON. If it fails to parse (e.g. the model added stray text), attempt to extract the first `{...}` block; if that still fails, fall back to a naive keyword-based intent guess rather than erroring out to the user.
- Validate the parsed object against the schema (required keys present, correct types, `intent` is one of the allowed enum values). Reject/repair anything that doesn't conform — never pass an unvalidated object into the query layer.
- Cost control: never send the database contents to the model — only the user's raw query (plus the system prompt). The model's only job is query understanding; MongoDB performs the actual search using the structured fields it returns.

### 5.3 Query execution

Use the validated `{ intent, skills, subjects, topics, unit, resourceTypes }` object to build MongoDB queries (text index / regex / `$in` matching across the relevant fields) against `users`, `resources`, and `requests` as appropriate to `intent`, then merge results into the categorized shape described in Section 4.

---

## 6. Seed / Demo Data

Ship the app with realistic, obviously-fictional seed data so it looks populated immediately:

- 15–20 students
- 20–30 resources
- 10 requests
- several offers

Use realistic engineering-college subjects: DSA, DBMS, OOP, Operating Systems, Computer Networks, Computer Architecture, Mathematics, Electronics, Web Development, Machine Learning, Cybersecurity.

Write this as a seed script runnable against `MONGODB_URI` (e.g. `scripts/seed.ts` + an npm script), not as data baked into the UI.

---

## 7. The flow to make extremely polished (core demo)

1. Student opens Campus Connect and sees the hero search box.
2. They type: "I have an OOP viva tomorrow. I need someone who can explain inheritance and some notes."
3. Backend sends the query to OpenRouter → gets back structured JSON (Section 5).
4. Backend queries MongoDB using that structured JSON.
5. Frontend renders categorized results (People / Resources / Requests) as shown in Section 4.

This flow must feel instant, real, and reliable — it is the single most important thing to get right.

---

## 8. MVP Functional Checklist

The app is successful if a student can:

1. Create/browse a student profile
2. Search for people by skills
3. Upload/share a resource
4. Search resources
5. Create a request
6. Respond to a request
7. Search naturally using the AI
8. Get combined people + resource + request results from one query

Build these eight flows to be real and functional before adding anything secondary (settings polish, notification preferences, etc.).

---

## 9. Product Principle: not a chatbot

Do **not** build this as a chatbot. There is no large ChatGPT-style conversation window. The student types naturally into one search box, but the app responds with actual campus entities — people, resources, requests — rendered as structured UI, not a written-out answer. AI is an invisible layer powering search, not a visible conversational feature. The feeling should be "I asked for something and Campus Connect found it," not "I had a conversation with an AI."

---

## 10. Engineering Principles

- Prioritize the 8 flows in Section 8 being genuinely functional over adding more surface area. No disconnected demo screens.
- Don't send the whole database to the AI — AI interprets, MongoDB searches (Section 5.3).
- Validate every AI response before use; never trust raw model output structurally.
- No hardcoded secrets anywhere — `MONGODB_URI` and `OPENROUTER_API_KEY` via environment variables only, with a `.env.example` documenting both.
- Keep abstractions minimal; don't build speculative extensibility beyond what Sections 1–9 ask for.

---

## 11. Visual & Interaction Design Direction

- **Theme:** a dark/light theme toggle is required, with both themes fully designed (not an afterthought palette swap).
- **Overall feel:** should look like something Anthropic would ship — restrained, confident, editorial, not a typical SaaS template. Take inspiration from the visual language of `https://solan.ujaanmukherjee.com/` and `https://www.anthropic.com/` — **do not copy either layout directly**; use them as a reference for tone (typographic confidence, whitespace, restraint, muted palette) rather than a template to clone.
- **No AI-slop visual tropes:** no color gradients, no glassmorphism, no generic glowing blobs, no purple/blue SaaS gradient hero backgrounds, no stock-icon-grid feature sections. Keep it clean and typographic.
- **Typography:** use **Source Serif 4** as the primary typeface.
- **Motion:**
  - Clean, subtle page/element transitions throughout (no bouncy/gratuitous motion).
  - Page loader animation wherever navigation or data fetching would otherwise show a blank screen.
  - Blurred placeholder states for content that takes a moment to load (e.g. search results, resource lists), rather than empty space or a generic spinner.
- **Feature richness:** the UI should feel comprehensive and considered (profiles, filters, bookmarking, helpful-marking, notifications, etc.) rather than a bare-bones skeleton — but richness in *function*, not in decorative visual noise.

---

## 12. Environment Variables

```env
MONGODB_URI=
OPENROUTER_API_KEY=
```

Both are supplied by the user later — do not block implementation on having real values; build against placeholders/local Mongo and wire the env plumbing correctly.
