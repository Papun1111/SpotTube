---

🎧 **Spottube**
*Stream. Vote. Vibe. Together.*

---

📖 **About the Project**
Spottube is a modern, collaborative music streaming platform where **creators** can stream songs directly from **YouTube**, and **fans** can vote for the next song to be played — creating a dynamic, community-powered playlist in real time.

Whether you're hosting a livestream, a study session, or just vibing with friends, Spottube ensures everyone gets a say in what plays next.

---

✨ **Key Features**

🔹 Real-time YouTube streaming
🔹 Fan-powered music queue with voting
🔹 Google OAuth login via NextAuth
🔹 Live interaction between streamers & fans
🔹 Beautiful UI built with TailwindCSS + Radix
🔹 Lightning-fast search via YouTube Search API

---

🧠 **Tech Stack**

Frontend:
🎯 \[Next.js 15.3] | ⚛️ \[React 19] | 🔷 \[TypeScript] | 💨 \[Tailwind CSS 4]

Backend:
🧬 \[Prisma ORM] | 🐘 \[PostgreSQL] | 🔐 \[NextAuth - Google OAuth]

Utilities:
🔍 \[YouTube Search API] | 🛡 \[Zod Validation] | 🎨 \[Lucide Icons] | 🎛 \[Radix UI]
📦 \[Axios] | 🧩 \[pnpm] | 🔄 \[tw-animate-css]

---

📦 **Top Dependencies**

🟪 Runtime
• next
• react, react-dom
• @prisma/client
• next-auth
• youtube-search-api
• clsx, tailwind-merge, class-variance-authority
• zod
• axios
• lucide-react
• @radix-ui/react-slot
• motion

🧰 Development
• prisma
• tailwindcss
• eslint, eslint-config-next, @eslint/eslintrc
• typescript, @types/node, @types/react, @types/react-dom
• tw-animate-css

---

🧪 **Installation Guide**

🚧 *Prerequisite:* Make sure [pnpm](https://pnpm.io/) is installed globally.
`npm install -g pnpm`

1️⃣ Clone the repository
`git clone https://github.com/yourusername/spottube.git`
`cd spottube`

2️⃣ Install dependencies
`pnpm install`

3️⃣ Create a `.env` file with the following:

```
DATABASE_URL=your_postgres_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

4️⃣ Apply database migrations
`pnpm prisma migrate dev`

5️⃣ Generate Prisma client
`pnpm prisma generate`

6️⃣ Start the development server
`pnpm run dev`

---

🔐 **Environment Variables**

📁 `.env` file includes:

• `DATABASE_URL` – your PostgreSQL DB
• `GOOGLE_CLIENT_ID` – Google OAuth client ID
• `GOOGLE_CLIENT_SECRET` – Google OAuth secret
• `NEXTAUTH_SECRET` – used by NextAuth for session security

---

🚀 **Core Functionalities**

🎵 Stream songs from YouTube
📊 Vote on what plays next in real time
🧑‍🎤 Let creators control the mood
🔐 Login securely via Google
💎 Fast, accessible, responsive UI

---

👨‍💻 **Author**

**Papun Mohapatra**
Crafted with ❤️ for music communities and digital creators.
*"Let the fans choose the vibe — one upvote at a time."*

---

📄 **License**

Licensed under the **MIT License**
Free to use, modify, and build upon for any purpose.

---

