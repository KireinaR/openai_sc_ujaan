# Campus Connect

Find the people, knowledge, and resources you need — one search across your campus.

**Live:** [oai-sc-campusconnect.vercel.app](https://oai-sc-campusconnect.vercel.app/)

Campus Connect brings three things students usually hunt for across WhatsApp groups and Drive links into one place:

- **People** — student profiles with skills, subjects, and what they can help with
- **Resources** — notes, PYQs, slides, and other shared materials
- **Requests** — "I need help with X" posts other students can respond to

A single natural-language search box ties all three together: type what you need in plain English, and the app returns matching people, resources, and requests — not a chatbot reply.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [MongoDB](https://www.mongodb.com) for persistence
- [OpenRouter](https://openrouter.ai) for natural-language query understanding (strict JSON-only output, validated before it ever touches the database)
- Tailwind CSS, Source Serif 4, dark/light theme

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in MONGODB_URI and OPENROUTER_API_KEY
npm run seed                 # populates demo data (students, resources, requests)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | What it does                          |
| --------------- | -------------------------------------- |
| `npm run dev`   | Start the dev server                   |
| `npm run build` | Production build                       |
| `npm run start` | Run the production build               |
| `npm run lint`  | Lint the project                       |
| `npm run seed`  | Reset and seed the database with demo data |

## Deployment

The app deploys to [Vercel](https://vercel.com) with no extra configuration — just set `MONGODB_URI`, `MONGODB_DB`, `OPENROUTER_API_KEY`, and `OPENROUTER_MODEL` as environment variables in the project settings, and allow network access from anywhere (`0.0.0.0/0`) in MongoDB Atlas, since Vercel's serverless functions don't have a fixed IP.

See [CAMPUS_CONNECT_SPEC.md](./CAMPUS_CONNECT_SPEC.md) for the full product/build spec.
