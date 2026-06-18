# AuditBot Arena - Full Stack Application

This is a full-stack React + Express application, initially built in Google AI Studio. 

## 🚀 How to Deploy from GitHub

Because this application contains a custom backend (`server.ts`) that securely handles API requests for things like Gemini, OpenAI, Claude, and database connections, **you cannot deploy this to static hosting** like standard Vercel or GitHub Pages (without advanced configuration). 

You must deploy it to a platform that supports Node.js web services. **Render**, **Railway**, **Heroku**, or **DigitalOcean** are perfect for this.

### Instructions for Render / Railway / Heroku
1. Connect your GitHub repository to your chosen platform and create a new **Web Service**.
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm run start`
4. **Environment Variables:** You MUST configure the environment variables in your deployment dashboard for the backend to function.

> **Important:** Ensure you do not hardcode your API keys in the code! Add them via the platform's Environment Variables settings.

### Required Environment Variables
Review the `.env.example` file for a full list of required API keys:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY` (if using OpenAI)
- `ANTHROPIC_API_KEY` (if using Claude)
- `GROQ_API_KEY` (if using Groq)
- `DEEPSEEK_API_KEY` (if using Deepseek)

## 💻 Local Development

If you want to run the project locally on your machine:
1. Clone the repository.
2. Run `npm install`
3. Create a `.env` file in the root directory and copy the contents from `.env.example`, placing your actual keys in it.
4. Run `npm run dev` to start the server. The application will be available at `http://localhost:3000`.

## 🛠️ Tech Stack
- Frontend: React 19, Vite, Tailwind CSS
- Backend: Express, Node.js, Esbuild
- Database: Firebase (Firestore)
