import "dotenv/config";
import cors from "cors";
import express from "express";
import { sendTwilioSms } from "./sms.js";

const app = express();
const PORT = Number(process.env.SMS_PORT ?? 3000);
const HOST = "127.0.0.1";

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.json({
    service: "Foundation Haunted House SMS API",
    message: "This port is API-only. Open the app at http://localhost:5173",
    endpoints: ["/api/health", "POST /api/sms"]
  });
});

// Chrome DevTools probes this path; return 204 to avoid console noise.
app.get("/.well-known/appspecific/com.chrome.devtools.json", (_req, res) => {
  res.status(204).end();
});

app.post("/api/sms", async (req, res) => {
  const { to, body } = req.body as { to?: string; body?: string };

  if (!to || !body) {
    return res.status(400).json({ error: 'Missing "to" or "body" in request' });
  }

  try {
    await sendTwilioSms(to, body);
    return res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send SMS";
    return res.status(500).json({ error: message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`SMS API listening on http://${HOST}:${PORT} (API only)`);
  console.log("Open the app at http://localhost:5173");
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `\nSMS server could not start: port ${PORT} is already in use.` +
        `\nStop the other process using that port, or set SMS_PORT in .env to a free port` +
        ` (and match vite.config.ts proxy target).\n`
    );
    process.exit(1);
  }

  throw error;
});
