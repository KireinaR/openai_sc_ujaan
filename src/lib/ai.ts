import { z } from "zod";
import type { ParsedQuery } from "./types";

// --- Section 5 of the spec: OpenRouter is used ONLY to turn a natural
// language query into structured JSON. It must never produce a
// conversational answer that reaches the user, and the database is never
// sent to the model -- it only ever sees the user's raw query.

const ParsedQuerySchema = z.object({
  intent: z.enum(["find_people", "find_resources", "find_requests", "mixed_search"]),
  skills: z.array(z.string()).default([]),
  subjects: z.array(z.string()).default([]),
  topics: z.array(z.string()).default([]),
  unit: z.string().nullable().default(null),
  resourceTypes: z.array(z.string()).default([]),
});

const SYSTEM_PROMPT = `You are a query-understanding engine for a campus search product called Campus Connect.
Your ONLY job is to convert a student's natural-language search into a single JSON object. You never write prose, never explain, never use markdown or code fences, and never greet the user. Output JSON only, with no leading or trailing text.

The JSON schema is exactly:
{
  "intent": "find_people" | "find_resources" | "find_requests" | "mixed_search",
  "skills": string[],
  "subjects": string[],
  "topics": string[],
  "unit": string | null,
  "resourceTypes": string[]
}

Rules:
- "intent" is "find_people" when the student is looking for a person who can help or teach them something.
- "intent" is "find_resources" when the student wants notes, PYQs, slides, or similar materials.
- "intent" is "find_requests" when the student is asking what other students need, or wants to see open requests.
- "intent" is "mixed_search" when the query implies more than one of the above (e.g. "I need someone to explain X and some notes").
- "subjects" are academic subjects/courses (e.g. "DBMS", "OOP", "Operating Systems").
- "topics" are specific concepts within a subject (e.g. "inheritance", "linked lists", "transactions").
- "skills" are practical/technical skills a person might have (e.g. "C++", "React", "Linux").
- "resourceTypes" is a subset of: "notes", "pyqs", "lab files", "assignments", "cheat sheets", "slides", "study guides", "reference material".
- "unit" is a unit/chapter number if mentioned, otherwise null.
- Never invent values that aren't implied by the query. Arrays may be empty.

Examples:
Input: "I need someone who knows C++ and can help me with linked lists."
Output: {"intent":"find_people","skills":["C++","linked lists"],"subjects":[],"topics":["linked lists"],"unit":null,"resourceTypes":[]}

Input: "Find me DBMS Unit 3 notes."
Output: {"intent":"find_resources","skills":[],"subjects":["DBMS"],"topics":[],"unit":"3","resourceTypes":["notes"]}

Input: "I have an OOP viva tomorrow. I need someone who understands inheritance and some good notes."
Output: {"intent":"mixed_search","skills":["OOP","inheritance"],"subjects":["OOP"],"topics":["inheritance","viva"],"unit":null,"resourceTypes":["notes"]}`;

function extractJsonBlock(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return text.slice(start, end + 1);
}

/** Last-resort heuristic used if OpenRouter is unreachable or returns garbage. */
function fallbackParse(query: string): ParsedQuery {
  const lower = query.toLowerCase();
  const resourceTypeKeywords: Record<string, ResourceTypeKeyword> = {
    notes: "notes",
    pyq: "pyqs",
    "previous year": "pyqs",
    lab: "lab files",
    assignment: "assignments",
    "cheat sheet": "cheat sheets",
    slide: "slides",
    "study guide": "study guides",
    reference: "reference material",
  };
  type ResourceTypeKeyword = ParsedQuery["resourceTypes"][number];

  const resourceTypes = Object.entries(resourceTypeKeywords)
    .filter(([kw]) => lower.includes(kw))
    .map(([, type]) => type);

  const wantsPerson = /\b(someone|people|who knows|teammate|help me|explain|tutor)\b/.test(lower);
  const wantsResource = resourceTypes.length > 0 || /\b(notes|pyq|slides|material)\b/.test(lower);

  const unitMatch = lower.match(/unit\s*(\d+)/);

  // Crude keyword split: strip filler words, keep the rest as free-form terms
  // that we match against skills/subjects/topics fields.
  const stopwords = new Set([
    "i", "a", "an", "the", "need", "someone", "who", "knows", "and", "can", "help", "me",
    "with", "find", "looking", "for", "some", "good", "to", "have", "tomorrow", "is",
    "understands", "explain", "want", "my", "please",
  ]);
  const terms = lower
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopwords.has(w));

  let intent: ParsedQuery["intent"] = "mixed_search";
  if (wantsPerson && !wantsResource) intent = "find_people";
  else if (wantsResource && !wantsPerson) intent = "find_resources";

  return {
    intent,
    skills: terms,
    subjects: terms,
    topics: terms,
    unit: unitMatch ? unitMatch[1] : null,
    resourceTypes,
  };
}

export async function parseSearchQuery(query: string): Promise<ParsedQuery> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  if (!apiKey) {
    return fallbackParse(query);
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
      }),
      // Query understanding should feel instant; don't let a slow model stall search.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return fallbackParse(query);

    const data = await res.json();
    const raw: string | undefined = data?.choices?.[0]?.message?.content;
    if (!raw) return fallbackParse(query);

    const jsonText = extractJsonBlock(raw) ?? raw;
    const parsedJson = JSON.parse(jsonText);
    const result = ParsedQuerySchema.safeParse(parsedJson);
    if (!result.success) return fallbackParse(query);

    return result.data;
  } catch {
    return fallbackParse(query);
  }
}
