import { getDb } from "./mongodb";
import { serialize } from "./serialize";
import { hydrateRequests, hydrateResources } from "./hydrate";
import type {
  ParsedQuery,
  RequestDoc,
  ResourceDoc,
  SearchResults,
  UserDoc,
} from "./types";

function escapeRegExp(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Builds an array of case-insensitive RegExps from free-form search terms. */
function toRegexes(terms: string[]): RegExp[] {
  return terms
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => new RegExp(escapeRegExp(t), "i"));
}

const RESULT_LIMIT = 12;

export async function runSearch(parsed: ParsedQuery): Promise<SearchResults> {
  const db = await getDb();

  // People are matched on skills, canHelpWith, learning and subjects --
  // anything the AI extracted as a skill or topic is a reasonable match
  // against what a person can help with.
  const personTerms = toRegexes([...parsed.skills, ...parsed.topics, ...parsed.subjects]);
  const peopleQuery =
    personTerms.length > 0
      ? {
          $or: [
            { skills: { $in: personTerms } },
            { canHelpWith: { $in: personTerms } },
            { learning: { $in: personTerms } },
            { subjects: { $in: personTerms } },
          ],
        }
      : {};

  // Resources are matched on subject/topics/tags/resourceType, plus an
  // explicit unit filter when one was extracted.
  const resourceTerms = toRegexes([...parsed.subjects, ...parsed.topics]);
  const resourceTypeTerms = toRegexes(parsed.resourceTypes);
  const resourceOr: Record<string, unknown>[] = [];
  if (resourceTerms.length > 0) {
    resourceOr.push(
      { subject: { $in: resourceTerms } },
      { topics: { $in: resourceTerms } },
      { tags: { $in: resourceTerms } },
      { title: { $in: resourceTerms } }
    );
  }
  if (resourceTypeTerms.length > 0) {
    resourceOr.push({ resourceType: { $in: resourceTypeTerms } });
  }
  const resourcesQuery: Record<string, unknown> = {};
  if (resourceOr.length > 0) resourcesQuery.$or = resourceOr;
  if (parsed.unit) resourcesQuery.unit = parsed.unit;

  // Requests are matched the same way people are: skills/topics/subjects,
  // restricted to open requests so stale/resolved ones don't surface.
  const requestTerms = toRegexes([...parsed.skills, ...parsed.topics, ...parsed.subjects]);
  const requestsQuery =
    requestTerms.length > 0
      ? {
          status: "open",
          $or: [
            { skills: { $in: requestTerms } },
            { topics: { $in: requestTerms } },
            { subject: { $in: requestTerms } },
            { title: { $in: requestTerms } },
          ],
        }
      : { status: "open" };

  const hasAnyTerms = personTerms.length > 0 || resourceTerms.length > 0 || resourceTypeTerms.length > 0;

  const [peopleDocs, resourceDocs, requestDocs] = await Promise.all([
    hasAnyTerms
      ? db.collection("users").find(peopleQuery).limit(RESULT_LIMIT).toArray()
      : [],
    db.collection("resources").find(resourcesQuery).limit(RESULT_LIMIT).toArray(),
    requestTerms.length > 0
      ? db.collection("requests").find(requestsQuery).limit(RESULT_LIMIT).toArray()
      : [],
  ]);

  const people = serialize(peopleDocs) as unknown as UserDoc[];
  const resources = serialize(resourceDocs) as unknown as ResourceDoc[];
  const requests = serialize(requestDocs) as unknown as RequestDoc[];

  const [hydratedResources, hydratedRequests] = await Promise.all([
    hydrateResources(db, resources),
    hydrateRequests(db, requests),
  ]);

  return {
    parsed,
    people,
    resources: hydratedResources,
    requests: hydratedRequests,
  };
}
