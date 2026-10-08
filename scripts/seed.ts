/**
 * Seeds MongoDB with realistic, obviously-fictional demo data for Campus Connect.
 * Run with: npm run seed
 */
import { config as loadEnv } from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

loadEnv({ path: ".env.local" });
loadEnv(); // fall back to .env if present, without overriding .env.local values

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}
const dbName = process.env.MONGODB_DB || "campus_connect";

type SeedUser = {
  key: string;
  name: string;
  department: string;
  year: number;
  bio: string;
  skills: string[];
  subjects: string[];
  canHelpWith: string[];
  learning: string[];
};

const users: SeedUser[] = [
  {
    key: "arjun",
    name: "Arjun Sen",
    department: "CSE",
    year: 2,
    bio: "Low-level tinkerer. Usually found debugging segfaults at 2am.",
    skills: ["C++", "DSA", "Linux", "CUDA"],
    subjects: ["DSA", "Computer Architecture"],
    canHelpWith: ["C++ debugging", "Linked lists", "Linux"],
    learning: ["CUDA kernels", "Compiler design"],
  },
  {
    key: "riya",
    name: "Riya Sen",
    department: "CSE",
    year: 2,
    bio: "DBMS enthusiast, keeps very tidy notes.",
    skills: ["SQL", "Java", "DBMS", "Indexing"],
    subjects: ["DBMS", "OOP"],
    canHelpWith: ["Transactions", "Normalization", "OOP"],
    learning: ["Distributed databases"],
  },
  {
    key: "arjun_das",
    name: "Arjun Das",
    department: "CSE",
    year: 3,
    bio: "TA for OOP lab. Will argue with you about inheritance vs composition.",
    skills: ["C++", "OOP", "DSA", "Design Patterns"],
    subjects: ["OOP", "DSA"],
    canHelpWith: ["Inheritance", "Polymorphism", "C++"],
    learning: ["Rust"],
  },
  {
    key: "meera",
    name: "Meera Iyer",
    department: "CSE",
    year: 4,
    bio: "ML research intern, loves a good gradient (the calculus kind).",
    skills: ["Python", "Machine Learning", "PyTorch", "Statistics"],
    subjects: ["Machine Learning", "Mathematics"],
    canHelpWith: ["Linear regression", "Neural networks", "Python"],
    learning: ["Reinforcement learning"],
  },
  {
    key: "karthik",
    name: "Karthik Rao",
    department: "ECE",
    year: 3,
    bio: "Electronics major who ended up loving networks more.",
    skills: ["Computer Networks", "Electronics", "Verilog"],
    subjects: ["Computer Networks", "Electronics"],
    canHelpWith: ["TCP/IP", "Subnetting", "Digital circuits"],
    learning: ["Wireless protocols"],
  },
  {
    key: "ananya",
    name: "Ananya Gupta",
    department: "CSE",
    year: 1,
    bio: "First-year figuring out recursion one stack frame at a time.",
    skills: ["Python", "DSA basics"],
    subjects: ["DSA", "Mathematics"],
    canHelpWith: ["Python basics"],
    learning: ["Recursion", "Linked lists", "OOP"],
  },
  {
    key: "vikram",
    name: "Vikram Nair",
    department: "CSE",
    year: 4,
    bio: "Security club lead. Thinks every system is one misconfig from a CVE.",
    skills: ["Cybersecurity", "Linux", "Python", "Networking"],
    subjects: ["Cybersecurity", "Computer Networks"],
    canHelpWith: ["Pentesting basics", "Linux hardening", "Networking"],
    learning: ["Binary exploitation"],
  },
  {
    key: "priya",
    name: "Priya Varma",
    department: "CSE",
    year: 2,
    bio: "Full-stack hobbyist, ships side projects most weekends.",
    skills: ["React", "Node.js", "Web Development", "MongoDB"],
    subjects: ["Web Development", "DBMS"],
    canHelpWith: ["React", "REST APIs", "Teammate for hackathons"],
    learning: ["Next.js", "System design"],
  },
  {
    key: "siddharth",
    name: "Siddharth Rao",
    department: "CSE",
    year: 3,
    bio: "Operating systems nerd, writes his own toy shells for fun.",
    skills: ["C", "Operating Systems", "Linux", "Shell scripting"],
    subjects: ["Operating Systems", "Computer Architecture"],
    canHelpWith: ["Process scheduling", "Memory management", "Shell scripting"],
    learning: ["Kernel modules"],
  },
  {
    key: "divya",
    name: "Divya Menon",
    department: "CSE",
    year: 2,
    bio: "Maths minor, makes DSA proofs make sense.",
    skills: ["Mathematics", "DSA", "Algorithms"],
    subjects: ["Mathematics", "DSA"],
    canHelpWith: ["Discrete math", "Graph algorithms", "Recursion"],
    learning: ["Number theory"],
  },
  {
    key: "rahul",
    name: "Rahul Verma",
    department: "CSE",
    year: 3,
    bio: "DBMS TA, has strong opinions about normal forms.",
    skills: ["DBMS", "SQL", "Java"],
    subjects: ["DBMS"],
    canHelpWith: ["Transactions", "Concurrency control", "Recovery"],
    learning: ["NoSQL design"],
  },
  {
    key: "sneha",
    name: "Sneha Pillai",
    department: "CSE",
    year: 1,
    bio: "New to campus, already running a study group for OOP.",
    skills: ["Java", "OOP basics"],
    subjects: ["OOP"],
    canHelpWith: ["OOP study group"],
    learning: ["Inheritance", "Polymorphism", "C++"],
  },
  {
    key: "aditya",
    name: "Aditya Joshi",
    department: "CSE",
    year: 4,
    bio: "Competitive programmer, 5x contest finalist.",
    skills: ["C++", "DSA", "Competitive Programming", "Algorithms"],
    subjects: ["DSA", "Mathematics"],
    canHelpWith: ["Linked lists", "Dynamic programming", "Graph algorithms"],
    learning: ["Advanced number theory"],
  },
  {
    key: "ishita",
    name: "Ishita Kapoor",
    department: "CSE",
    year: 2,
    bio: "Web dev club co-founder, designs as much as she codes.",
    skills: ["JavaScript", "React", "CSS", "Web Development"],
    subjects: ["Web Development"],
    canHelpWith: ["React", "CSS layouts", "Teammate who knows React"],
    learning: ["TypeScript", "Accessibility"],
  },
  {
    key: "manish",
    name: "Manish Kumar",
    department: "ECE",
    year: 3,
    bio: "Computer architecture TA, draws pipeline diagrams unprompted.",
    skills: ["Computer Architecture", "Verilog", "C"],
    subjects: ["Computer Architecture", "Operating Systems"],
    canHelpWith: ["Pipelining", "Cache design", "Assembly"],
    learning: ["RISC-V"],
  },
  {
    key: "tanvi",
    name: "Tanvi Shah",
    department: "CSE",
    year: 4,
    bio: "ML + security crossover project this semester.",
    skills: ["Machine Learning", "Python", "Cybersecurity"],
    subjects: ["Machine Learning", "Cybersecurity"],
    canHelpWith: ["Model evaluation", "Adversarial ML"],
    learning: ["Federated learning"],
  },
  {
    key: "rohan",
    name: "Rohan Malhotra",
    department: "CSE",
    year: 1,
    bio: "Networking curious first-year, still mixing up TCP and UDP.",
    skills: ["Python"],
    subjects: ["Computer Networks", "Mathematics"],
    canHelpWith: [],
    learning: ["TCP/IP", "Subnetting", "DSA basics"],
  },
  {
    key: "kavya",
    name: "Kavya Reddy",
    department: "CSE",
    year: 2,
    bio: "Keeps the best Unit-wise notes in the department, shares everything.",
    skills: ["DBMS", "OOP", "Note-taking"],
    subjects: ["DBMS", "OOP", "DSA"],
    canHelpWith: ["Exam prep", "Note organization"],
    learning: ["System design"],
  },
];

type ResourceType =
  | "notes"
  | "pyqs"
  | "lab files"
  | "assignments"
  | "cheat sheets"
  | "slides"
  | "study guides"
  | "reference material";

type SeedResource = {
  title: string;
  description: string;
  subject: string;
  unit: string | null;
  topics: string[];
  resourceType: ResourceType;
  tags: string[];
  uploaderKey: string;
  fileUrl: string;
  helpfulCount: number;
  viewCount: number;
};

const resources: SeedResource[] = [
  {
    title: "DBMS — Unit 3 Notes",
    description: "Transactions, concurrency control and recovery, with worked examples.",
    subject: "DBMS",
    unit: "3",
    topics: ["transactions", "concurrency", "recovery"],
    resourceType: "notes",
    tags: ["dbms", "unit3", "exam-prep"],
    uploaderKey: "riya",
    fileUrl: "https://drive.example.com/dbms-unit3-notes",
    helpfulCount: 34,
    viewCount: 210,
  },
  {
    title: "DBMS Unit 3 — PYQs (2019-2024)",
    description: "Five years of previous-year questions on transactions and recovery.",
    subject: "DBMS",
    unit: "3",
    topics: ["transactions", "recovery"],
    resourceType: "pyqs",
    tags: ["dbms", "pyq"],
    uploaderKey: "rahul",
    fileUrl: "https://drive.example.com/dbms-unit3-pyqs",
    helpfulCount: 41,
    viewCount: 288,
  },
  {
    title: "OOP Unit 2 Notes",
    description: "Inheritance, polymorphism, and abstract classes explained with C++ examples.",
    subject: "OOP",
    unit: "2",
    topics: ["inheritance", "polymorphism"],
    resourceType: "notes",
    tags: ["oop", "unit2"],
    uploaderKey: "arjun_das",
    fileUrl: "https://drive.example.com/oop-unit2-notes",
    helpfulCount: 52,
    viewCount: 301,
  },
  {
    title: "OOP Viva Question Bank",
    description: "Common viva questions on inheritance, polymorphism and encapsulation.",
    subject: "OOP",
    unit: null,
    topics: ["inheritance", "viva", "encapsulation"],
    resourceType: "study guides",
    tags: ["oop", "viva"],
    uploaderKey: "kavya",
    fileUrl: "https://drive.example.com/oop-viva-bank",
    helpfulCount: 29,
    viewCount: 176,
  },
  {
    title: "Inheritance Cheat Sheet",
    description: "One-page cheat sheet covering single, multiple, and hierarchical inheritance.",
    subject: "OOP",
    unit: "2",
    topics: ["inheritance"],
    resourceType: "cheat sheets",
    tags: ["oop", "cheat-sheet"],
    uploaderKey: "sneha",
    fileUrl: "https://drive.example.com/inheritance-cheatsheet",
    helpfulCount: 18,
    viewCount: 98,
  },
  {
    title: "DSA — Linked Lists Deep Dive",
    description: "Singly, doubly, and circular linked lists with implementation notes.",
    subject: "DSA",
    unit: "1",
    topics: ["linked lists"],
    resourceType: "notes",
    tags: ["dsa", "linked-lists"],
    uploaderKey: "aditya",
    fileUrl: "https://drive.example.com/dsa-linked-lists",
    helpfulCount: 47,
    viewCount: 265,
  },
  {
    title: "DSA Lab Files — Semester 3",
    description: "All lab programs for arrays, linked lists, and stacks with sample I/O.",
    subject: "DSA",
    unit: null,
    topics: ["linked lists", "arrays", "stacks"],
    resourceType: "lab files",
    tags: ["dsa", "lab"],
    uploaderKey: "arjun",
    fileUrl: "https://drive.example.com/dsa-lab-files",
    helpfulCount: 22,
    viewCount: 140,
  },
  {
    title: "Graph Algorithms Study Guide",
    description: "BFS, DFS, Dijkstra, and MST algorithms with complexity analysis.",
    subject: "DSA",
    unit: "4",
    topics: ["graphs", "shortest path", "mst"],
    resourceType: "study guides",
    tags: ["dsa", "graphs"],
    uploaderKey: "divya",
    fileUrl: "https://drive.example.com/graph-algorithms-guide",
    helpfulCount: 38,
    viewCount: 190,
  },
  {
    title: "Operating Systems — Process Scheduling Notes",
    description: "FCFS, SJF, Round Robin and priority scheduling, compared side by side.",
    subject: "Operating Systems",
    unit: "2",
    topics: ["process scheduling"],
    resourceType: "notes",
    tags: ["os", "scheduling"],
    uploaderKey: "siddharth",
    fileUrl: "https://drive.example.com/os-scheduling-notes",
    helpfulCount: 31,
    viewCount: 172,
  },
  {
    title: "Memory Management Slides",
    description: "Paging, segmentation, and virtual memory lecture slides.",
    subject: "Operating Systems",
    unit: "3",
    topics: ["memory management", "paging", "virtual memory"],
    resourceType: "slides",
    tags: ["os", "memory"],
    uploaderKey: "siddharth",
    fileUrl: "https://drive.example.com/os-memory-slides",
    helpfulCount: 20,
    viewCount: 121,
  },
  {
    title: "Computer Networks — Unit 1 Notes",
    description: "OSI model, TCP/IP stack, and subnetting worked examples.",
    subject: "Computer Networks",
    unit: "1",
    topics: ["tcp/ip", "subnetting", "osi model"],
    resourceType: "notes",
    tags: ["networks", "unit1"],
    uploaderKey: "karthik",
    fileUrl: "https://drive.example.com/networks-unit1-notes",
    helpfulCount: 26,
    viewCount: 158,
  },
  {
    title: "Subnetting Practice Assignment",
    description: "20 subnetting problems with step-by-step solutions.",
    subject: "Computer Networks",
    unit: "1",
    topics: ["subnetting"],
    resourceType: "assignments",
    tags: ["networks", "practice"],
    uploaderKey: "rohan",
    fileUrl: "https://drive.example.com/subnetting-assignment",
    helpfulCount: 14,
    viewCount: 88,
  },
  {
    title: "Computer Architecture — Pipelining Notes",
    description: "Instruction pipelining, hazards, and forwarding explained with diagrams.",
    subject: "Computer Architecture",
    unit: "3",
    topics: ["pipelining", "hazards"],
    resourceType: "notes",
    tags: ["architecture", "pipelining"],
    uploaderKey: "manish",
    fileUrl: "https://drive.example.com/architecture-pipelining",
    helpfulCount: 19,
    viewCount: 104,
  },
  {
    title: "Cache Design Reference Sheet",
    description: "Direct-mapped, set-associative, and fully-associative caches compared.",
    subject: "Computer Architecture",
    unit: "3",
    topics: ["cache design"],
    resourceType: "reference material",
    tags: ["architecture", "cache"],
    uploaderKey: "manish",
    fileUrl: "https://drive.example.com/cache-design-reference",
    helpfulCount: 12,
    viewCount: 73,
  },
  {
    title: "Discrete Mathematics — Graph Theory Notes",
    description: "Graph coloring, trees, and Euler/Hamiltonian paths.",
    subject: "Mathematics",
    unit: "2",
    topics: ["graph theory", "trees"],
    resourceType: "notes",
    tags: ["maths", "graph-theory"],
    uploaderKey: "divya",
    fileUrl: "https://drive.example.com/discrete-maths-graphs",
    helpfulCount: 24,
    viewCount: 133,
  },
  {
    title: "Probability & Statistics Cheat Sheet",
    description: "Distributions, Bayes' theorem, and hypothesis testing on one page.",
    subject: "Mathematics",
    unit: null,
    topics: ["probability", "statistics"],
    resourceType: "cheat sheets",
    tags: ["maths", "statistics"],
    uploaderKey: "meera",
    fileUrl: "https://drive.example.com/prob-stats-cheatsheet",
    helpfulCount: 33,
    viewCount: 201,
  },
  {
    title: "Digital Electronics — Logic Gates Notes",
    description: "Combinational and sequential circuits, Karnaugh maps included.",
    subject: "Electronics",
    unit: "1",
    topics: ["logic gates", "karnaugh maps"],
    resourceType: "notes",
    tags: ["electronics", "logic"],
    uploaderKey: "karthik",
    fileUrl: "https://drive.example.com/electronics-logic-notes",
    helpfulCount: 15,
    viewCount: 92,
  },
  {
    title: "React Fundamentals Slides",
    description: "Components, props, state, and hooks — intro deck for the web dev club.",
    subject: "Web Development",
    unit: null,
    topics: ["react", "hooks"],
    resourceType: "slides",
    tags: ["web-dev", "react"],
    uploaderKey: "ishita",
    fileUrl: "https://drive.example.com/react-fundamentals-slides",
    helpfulCount: 44,
    viewCount: 256,
  },
  {
    title: "REST API Design Cheat Sheet",
    description: "Status codes, naming conventions, and pagination patterns.",
    subject: "Web Development",
    unit: null,
    topics: ["rest apis"],
    resourceType: "cheat sheets",
    tags: ["web-dev", "apis"],
    uploaderKey: "priya",
    fileUrl: "https://drive.example.com/rest-api-cheatsheet",
    helpfulCount: 27,
    viewCount: 149,
  },
  {
    title: "Machine Learning — Linear Regression Notes",
    description: "Derivation, cost functions, and gradient descent from first principles.",
    subject: "Machine Learning",
    unit: "1",
    topics: ["linear regression", "gradient descent"],
    resourceType: "notes",
    tags: ["ml", "regression"],
    uploaderKey: "meera",
    fileUrl: "https://drive.example.com/ml-linear-regression",
    helpfulCount: 36,
    viewCount: 220,
  },
  {
    title: "Neural Networks Study Guide",
    description: "Forward/backprop, activation functions, and a worked numeric example.",
    subject: "Machine Learning",
    unit: "3",
    topics: ["neural networks", "backpropagation"],
    resourceType: "study guides",
    tags: ["ml", "neural-networks"],
    uploaderKey: "meera",
    fileUrl: "https://drive.example.com/ml-neural-networks-guide",
    helpfulCount: 40,
    viewCount: 231,
  },
  {
    title: "Cybersecurity — Linux Hardening Checklist",
    description: "Practical checklist for hardening a Linux box: users, firewall, services.",
    subject: "Cybersecurity",
    unit: null,
    topics: ["linux hardening"],
    resourceType: "reference material",
    tags: ["security", "linux"],
    uploaderKey: "vikram",
    fileUrl: "https://drive.example.com/linux-hardening-checklist",
    helpfulCount: 21,
    viewCount: 117,
  },
  {
    title: "Intro to Pentesting Slides",
    description: "Reconnaissance, scanning, and reporting basics for the security club.",
    subject: "Cybersecurity",
    unit: null,
    topics: ["pentesting basics"],
    resourceType: "slides",
    tags: ["security", "pentesting"],
    uploaderKey: "vikram",
    fileUrl: "https://drive.example.com/pentesting-intro-slides",
    helpfulCount: 17,
    viewCount: 95,
  },
  {
    title: "DSA PYQs — Dynamic Programming",
    description: "Ten years of DP questions, grouped by pattern (knapsack, LIS, etc).",
    subject: "DSA",
    unit: "5",
    topics: ["dynamic programming"],
    resourceType: "pyqs",
    tags: ["dsa", "pyq", "dp"],
    uploaderKey: "aditya",
    fileUrl: "https://drive.example.com/dsa-dp-pyqs",
    helpfulCount: 49,
    viewCount: 278,
  },
  {
    title: "OOP Unit 1 — Classes & Objects Assignment",
    description: "Practice problems on class design, constructors, and encapsulation.",
    subject: "OOP",
    unit: "1",
    topics: ["classes", "encapsulation"],
    resourceType: "assignments",
    tags: ["oop", "unit1"],
    uploaderKey: "sneha",
    fileUrl: "https://drive.example.com/oop-unit1-assignment",
    helpfulCount: 16,
    viewCount: 84,
  },
  {
    title: "DBMS — ER Modeling Reference",
    description: "Entity-relationship modeling conventions with annotated examples.",
    subject: "DBMS",
    unit: "1",
    topics: ["er modeling"],
    resourceType: "reference material",
    tags: ["dbms", "er-model"],
    uploaderKey: "kavya",
    fileUrl: "https://drive.example.com/dbms-er-modeling",
    helpfulCount: 23,
    viewCount: 131,
  },
];

type SeedRequest = {
  title: string;
  description: string;
  subject: string;
  topics: string[];
  skills: string[];
  urgency: "low" | "medium" | "high";
  creatorKey: string;
  status: "open" | "in-progress" | "resolved";
  offers: { responderKey: string; message: string }[];
};

const requests: SeedRequest[] = [
  {
    title: "Need help with OOP inheritance",
    description: "Struggling to tell apart single vs multiple inheritance before my viva.",
    subject: "OOP",
    topics: ["inheritance"],
    skills: ["OOP", "C++"],
    urgency: "high",
    creatorKey: "ananya",
    status: "open",
    offers: [
      { responderKey: "arjun_das", message: "Happy to walk through it tonight, free after 7." },
    ],
  },
  {
    title: "Looking for DBMS Unit 3 notes",
    description: "Lost my notes on transactions and recovery, exam is in two days.",
    subject: "DBMS",
    topics: ["transactions", "recovery"],
    skills: [],
    urgency: "high",
    creatorKey: "rohan",
    status: "open",
    offers: [
      { responderKey: "riya", message: "Sharing my Unit 3 notes, check the resources page too." },
    ],
  },
  {
    title: "Need a teammate who knows React",
    description: "Building a hackathon project, need someone comfortable with React + APIs.",
    subject: "Web Development",
    topics: ["react"],
    skills: ["React", "Web Development"],
    urgency: "medium",
    creatorKey: "rahul",
    status: "open",
    offers: [
      { responderKey: "ishita", message: "I'm in, done a few React hackathon projects before." },
      { responderKey: "priya", message: "Also interested, can help with the backend side too." },
    ],
  },
  {
    title: "Anyone free to explain linked lists?",
    description: "Keep mixing up singly vs doubly linked list operations.",
    subject: "DSA",
    topics: ["linked lists"],
    skills: ["C++", "DSA"],
    urgency: "medium",
    creatorKey: "sneha",
    status: "open",
    offers: [
      { responderKey: "arjun", message: "Linked lists are my favorite rabbit hole, let's do it." },
    ],
  },
  {
    title: "Looking for OS process scheduling practice problems",
    description: "Want extra practice beyond the lecture examples before the quiz.",
    subject: "Operating Systems",
    topics: ["process scheduling"],
    skills: [],
    urgency: "low",
    creatorKey: "manish",
    status: "open",
    offers: [],
  },
  {
    title: "Need someone to review my ML regression code",
    description: "Gradient descent isn't converging, could use a second pair of eyes.",
    subject: "Machine Learning",
    topics: ["linear regression", "gradient descent"],
    skills: ["Python", "Machine Learning"],
    urgency: "medium",
    creatorKey: "tanvi",
    status: "open",
    offers: [
      { responderKey: "meera", message: "Send it over, probably a learning-rate issue." },
    ],
  },
  {
    title: "Study partner for Computer Networks finals",
    description: "Want to do a joint review of subnetting and the OSI model this weekend.",
    subject: "Computer Networks",
    topics: ["subnetting", "osi model"],
    skills: [],
    urgency: "low",
    creatorKey: "rohan",
    status: "open",
    offers: [
      { responderKey: "karthik", message: "Count me in, Saturday afternoon works." },
    ],
  },
  {
    title: "Need help setting up a pentesting lab",
    description: "Want to practice on a local VM but not sure how to set up the network.",
    subject: "Cybersecurity",
    topics: ["pentesting basics"],
    skills: ["Cybersecurity", "Linux"],
    urgency: "low",
    creatorKey: "tanvi",
    status: "in-progress",
    offers: [
      { responderKey: "vikram", message: "I have a VM image for this, let's set it up together." },
    ],
  },
  {
    title: "Looking for OOP Unit 2 slides",
    description: "Missed the lecture on polymorphism, need the slides or equivalent notes.",
    subject: "OOP",
    topics: ["polymorphism"],
    skills: [],
    urgency: "medium",
    creatorKey: "sneha",
    status: "resolved",
    offers: [
      { responderKey: "arjun_das", message: "Uploaded my Unit 2 notes to resources, check there." },
    ],
  },
  {
    title: "Need a quick refresher on Bayes' theorem",
    description: "Stats quiz tomorrow and Bayes' theorem isn't clicking yet.",
    subject: "Mathematics",
    topics: ["probability"],
    skills: [],
    urgency: "high",
    creatorKey: "ananya",
    status: "open",
    offers: [],
  },
];

async function main() {
  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db(dbName);

  console.log(`Seeding database "${dbName}"...`);

  await Promise.all(
    ["users", "resources", "requests", "offers", "bookmarks", "notifications"].map((c) =>
      db.collection(c).deleteMany({})
    )
  );

  const now = Date.now();
  const userIdByKey = new Map<string, ObjectId>();
  const userDocs = users.map((u, i) => {
    const _id = new ObjectId();
    userIdByKey.set(u.key, _id);
    return {
      _id,
      name: u.name,
      department: u.department,
      year: u.year,
      bio: u.bio,
      skills: u.skills,
      subjects: u.subjects,
      canHelpWith: u.canHelpWith,
      learning: u.learning,
      createdAt: new Date(now - (users.length - i) * 86400000),
    };
  });
  await db.collection("users").insertMany(userDocs);

  const resourceIdByTitle = new Map<string, ObjectId>();
  const resourceDocs = resources.map((r, i) => {
    const _id = new ObjectId();
    resourceIdByTitle.set(r.title, _id);
    const uploaderId = userIdByKey.get(r.uploaderKey);
    if (!uploaderId) throw new Error(`Unknown uploader key: ${r.uploaderKey}`);
    return {
      _id,
      title: r.title,
      description: r.description,
      subject: r.subject,
      unit: r.unit,
      topics: r.topics,
      resourceType: r.resourceType,
      tags: r.tags,
      uploaderId: uploaderId.toHexString(),
      fileUrl: r.fileUrl,
      helpfulCount: r.helpfulCount,
      viewCount: r.viewCount,
      helpfulBy: [],
      createdAt: new Date(now - (resources.length - i) * 43200000),
    };
  });
  await db.collection("resources").insertMany(resourceDocs);

  const requestIdByTitle = new Map<string, ObjectId>();
  const requestDocs = requests.map((r, i) => {
    const _id = new ObjectId();
    requestIdByTitle.set(r.title, _id);
    const creatorId = userIdByKey.get(r.creatorKey);
    if (!creatorId) throw new Error(`Unknown creator key: ${r.creatorKey}`);
    return {
      _id,
      title: r.title,
      description: r.description,
      subject: r.subject,
      topics: r.topics,
      skills: r.skills,
      urgency: r.urgency,
      creatorId: creatorId.toHexString(),
      status: r.status,
      createdAt: new Date(now - (requests.length - i) * 36000000),
    };
  });
  await db.collection("requests").insertMany(requestDocs);

  const offerDocs: Record<string, unknown>[] = [];
  requests.forEach((r) => {
    const requestId = requestIdByTitle.get(r.title)!;
    r.offers.forEach((o, i) => {
      const responderId = userIdByKey.get(o.responderKey);
      if (!responderId) throw new Error(`Unknown responder key: ${o.responderKey}`);
      offerDocs.push({
        _id: new ObjectId(),
        requestId: requestId.toHexString(),
        responderId: responderId.toHexString(),
        message: o.message,
        createdAt: new Date(now - (r.offers.length - i) * 7200000),
      });
    });
  });
  if (offerDocs.length > 0) {
    await db.collection("offers").insertMany(offerDocs);
  }

  // A handful of demo bookmarks so /bookmarks has something to show out of the box.
  const bookmarkSeed = [
    { userKey: "ananya", title: "DSA — Linked Lists Deep Dive" },
    { userKey: "ananya", title: "OOP Viva Question Bank" },
    { userKey: "rohan", title: "Computer Networks — Unit 1 Notes" },
    { userKey: "sneha", title: "Inheritance Cheat Sheet" },
    { userKey: "tanvi", title: "Machine Learning — Linear Regression Notes" },
  ];
  const bookmarkDocs = bookmarkSeed.map((b, i) => {
    const userId = userIdByKey.get(b.userKey)!;
    const targetId = resourceIdByTitle.get(b.title)!;
    return {
      _id: new ObjectId(),
      userId: userId.toHexString(),
      targetType: "resource" as const,
      targetId: targetId.toHexString(),
      createdAt: new Date(now - (bookmarkSeed.length - i) * 5400000),
    };
  });
  await db.collection("bookmarks").insertMany(bookmarkDocs);

  // Notifications mirroring the offers above, sent to each request's creator.
  const notificationDocs = requests.flatMap((r) => {
    const requestId = requestIdByTitle.get(r.title)!;
    const creatorId = userIdByKey.get(r.creatorKey)!;
    return r.offers.map((o, i) => {
      const responder = users.find((u) => u.key === o.responderKey)!;
      return {
        _id: new ObjectId(),
        userId: creatorId.toHexString(),
        type: "offer",
        message: `${responder.name} responded to your request "${r.title}"`,
        link: `/requests/${requestId.toHexString()}`,
        read: i > 0,
        createdAt: new Date(now - i * 3600000),
      };
    });
  });
  if (notificationDocs.length > 0) {
    await db.collection("notifications").insertMany(notificationDocs);
  }

  await Promise.all([
    db.collection("users").createIndex({ skills: 1 }),
    db.collection("users").createIndex({ subjects: 1 }),
    db.collection("users").createIndex({ canHelpWith: 1 }),
    db.collection("users").createIndex({ learning: 1 }),
    db.collection("resources").createIndex({ subject: 1 }),
    db.collection("resources").createIndex({ topics: 1 }),
    db.collection("resources").createIndex({ resourceType: 1 }),
    db.collection("requests").createIndex({ status: 1 }),
    db.collection("requests").createIndex({ subject: 1 }),
    db.collection("offers").createIndex({ requestId: 1 }),
    db.collection("bookmarks").createIndex({ userId: 1 }),
    db.collection("notifications").createIndex({ userId: 1 }),
  ]);

  console.log(
    `Seeded ${userDocs.length} users, ${resourceDocs.length} resources, ${requestDocs.length} requests, ${offerDocs.length} offers, ${bookmarkDocs.length} bookmarks, ${notificationDocs.length} notifications.`
  );

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
