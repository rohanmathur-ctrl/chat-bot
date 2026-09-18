import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { streamGeminiChat } from "./server/geminiBackend";
import { generateUniversalResponse } from "./src/lib/universalAiModel";
import { sendOtpToEmail, verifyOtp, getSession, logoutSession } from "./server/authService";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mode: "nexus-neural-core",
    provider: "Nexus-1 Autonomous Neural Model",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Authentication: Send OTP
app.post("/api/auth/send-otp", (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }

    const result = sendOtpToEmail(email);
    res.json(result);
  } catch (error: any) {
    console.error("send-otp error:", error);
    res.status(500).json({ success: false, message: error?.message || "Failed to send verification code." });
  }
});

// Authentication: Verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and 6-digit OTP are required." });
    }

    const result = verifyOtp(email, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error: any) {
    console.error("verify-otp error:", error);
    res.status(500).json({ success: false, message: error?.message || "Failed to verify code." });
  }
});

// Authentication: Get Current Session
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || (req.query.token as string);
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: session });
});

// Authentication: Logout
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || req.body?.token;
  if (token) {
    logoutSession(token);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// Real-time streaming chat endpoint using SSE powered by Nexus-1 Neural Engine
app.post("/api/chat/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { messages = [], attachment } = req.body;

    await streamGeminiChat(
      messages,
      attachment,
      {
        onThoughts: (thoughts, thoughtTime) => {
          sendEvent("thoughts", { thoughts, thoughtTime });
        },
        onChunk: (text) => {
          sendEvent("chunk", { text });
        },
        onArtifact: (codeArtifact) => {
          sendEvent("artifact", { codeArtifact });
        },
        onDone: () => {
          sendEvent("done", { complete: true });
          res.end();
        },
        onError: (err) => {
          sendEvent("error", { message: err?.message || "Stream generation error" });
          res.end();
        }
      }
    );
  } catch (error: any) {
    console.error("Streaming backend error:", error);
    sendEvent("error", {
      message: error?.message || "Error generating AI response.",
    });
    res.end();
  }
});

// Single-turn analysis endpoint for architecture scanning
app.post("/api/architecture/analyze", async (req, res) => {
  try {
    const { prompt = "" } = req.body;
    const response = await generateUniversalResponse(
      prompt || "Analyze this system topology",
      { name: "topology-scan.png", mimeType: "image/png" }
    );
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Architecture analysis error:", error);
    res.status(500).json({ error: error?.message || "Failed to analyze architecture" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
