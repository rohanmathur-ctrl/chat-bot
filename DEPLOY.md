# Deploying Nexus AI Chatbot to Vercel

This repository is **100% pre-configured and ready to deploy to Vercel**.

## Features for Vercel
- **Real Gemini & GPT-Level Multidisciplinary Backend**: Powered by Google's Gemini models with intelligent fallback and real-time physical temporal grounding. Answers questions across science, medicine, coding, math, history, and real-time world clocks.
- **Pre-configured `vercel.json` and Serverless Functions**:
  ```json
  {
    "buildCommand": "vite build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [
      {
        "source": "/((?!api/).*)",
        "destination": "/index.html"
      }
    ]
  }
  ```
- **Dual Runtime with Zero-Config Fallback**: If `GEMINI_API_KEY` is added to Vercel Environment Variables, Vercel Serverless Functions execute live Gemini API streaming. If omitted, the app smoothly falls back to the client-side universal engine without any downtime.

---

## Adding Your Gemini API Key on Vercel (Optional for Unlimited Scale)
1. In your Vercel Dashboard: Project > **Settings** > **Environment Variables**.
2. Add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key_here`
3. Redeploy or run `vercel --prod`. Your live Vercel app will stream responses directly from Gemini!

---

## Deployment Option 1: Vercel CLI (Fastest - 1 minute)

1. Open your terminal in this project directory:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Select your personal or team account
   - Link to existing project? **No**
   - Project name? Press Enter (or type `nexus-ai-chatbot`)
   - Directory? `./`
3. Vercel will build and output your live production URL (e.g. `https://nexus-ai-chatbot.vercel.app`).

---

## Deployment Option 2: Deploy via GitHub (Recommended for Continuous Deployment)

1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of nexus universal chatbot"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nexus-ai-chatbot.git
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Select your repository `nexus-ai-chatbot` and click **Import**.
4. Framework Preset will be automatically detected as **Vite**.
5. Click **Deploy**. Vercel will build the `dist` directory and launch your live application!
