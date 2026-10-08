// Shared domain types. DB documents use ObjectId; API/UI-facing types use string ids.

export type ResourceType =
  | "notes"
  | "pyqs"
  | "lab files"
  | "assignments"
  | "cheat sheets"
  | "slides"
  | "study guides"
  | "reference material";

export const RESOURCE_TYPES: ResourceType[] = [
  "notes",
  "pyqs",
  "lab files",
  "assignments",
  "cheat sheets",
  "slides",
  "study guides",
  "reference material",
];

export type Urgency = "low" | "medium" | "high";
export type RequestStatus = "open" | "in-progress" | "resolved";

export interface UserDoc {
  _id: string;
  name: string;
  department: string;
  year: number;
  bio: string;
  skills: string[];
  subjects: string[];
  canHelpWith: string[];
  learning: string[];
  createdAt: string;
}

export interface ResourceDoc {
  _id: string;
  title: string;
  description: string;
  subject: string;
  unit: string | null;
  topics: string[];
  resourceType: ResourceType;
  tags: string[];
  uploaderId: string;
  fileUrl: string;
  helpfulCount: number;
  viewCount: number;
  helpfulBy: string[];
  createdAt: string;
}

export interface OfferDoc {
  _id: string;
  requestId: string;
  responderId: string;
  message: string;
  createdAt: string;
}

export interface RequestDoc {
  _id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  skills: string[];
  urgency: Urgency;
  creatorId: string;
  status: RequestStatus;
  createdAt: string;
}

export interface BookmarkDoc {
  _id: string;
  userId: string;
  targetType: "resource" | "person" | "request";
  targetId: string;
  createdAt: string;
}

export interface NotificationDoc {
  _id: string;
  userId: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

// Hydrated shapes used by the UI, with referenced entities populated.

export interface ResourceWithUploader extends ResourceDoc {
  uploader: Pick<UserDoc, "_id" | "name" | "department" | "year"> | null;
}

export interface OfferWithResponder extends OfferDoc {
  responder: Pick<UserDoc, "_id" | "name" | "department" | "year"> | null;
}

export interface RequestWithDetails extends RequestDoc {
  creator: Pick<UserDoc, "_id" | "name" | "department" | "year"> | null;
  offers: OfferWithResponder[];
}

// AI query-understanding contract (Section 5 of the spec).

export type SearchIntent =
  | "find_people"
  | "find_resources"
  | "find_requests"
  | "mixed_search";

export interface ParsedQuery {
  intent: SearchIntent;
  skills: string[];
  subjects: string[];
  topics: string[];
  unit: string | null;
  resourceTypes: string[];
}

export interface SearchResults {
  parsed: ParsedQuery;
  people: UserDoc[];
  resources: ResourceWithUploader[];
  requests: RequestWithDetails[];
}
