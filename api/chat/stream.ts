import { streamGeminiChat } from "../../server/geminiBackend";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { messages = [], attachment } = req.body || {};

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
          sendEvent("error", { message: err?.message || "Stream error" });
          res.end();
        },
      }
    );
  } catch (error: any) {
    console.error("Vercel streaming error:", error);
    sendEvent("error", { message: error?.message || "Server error" });
    res.end();
  }
}
