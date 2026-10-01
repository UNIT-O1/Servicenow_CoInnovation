// Zero-dependency server: serves the form and proxies triage requests to Claude.
const http = require("http");
const fs = require("fs");
const path = require("path");

// Minimal .env loader
try {
  for (const line of fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {}

const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || "claude-sonnet-5-5";
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, "prompt.txt"), "utf8");
const PEER_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, "demo_data.json"), "utf8"));
const DEPARTMENTS = ["COUNSELLING", "ACADEMIC_AFFAIRS", "FINANCIAL_AID", "STUDENT_LIFE", "HEALTH_SERVICES", "CRISIS_RESPONSE"];

const send = (res, code, body, type = "application/json") => {
  res.writeHead(code, { "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};

async function assess(form) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing in .env");
  // Student details are fixed; peer answers come from the form (demo_data.json is the fallback).
  const payload = { ...form, student: PEER_DATA.student, friends: form.friends?.length ? form.friends : PEER_DATA.friends };
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: "Assess this student check-in and return the JSON result.\n\n" + JSON.stringify(payload, null, 2) }],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message || "Claude API error " + r.status);
  const text = data.content.map((c) => c.text || "").join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  json.routing = (json.routing || []).filter((x) => DEPARTMENTS.includes(x.department));
  return json;
}

http
  .createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/api/assess") {
        let body = "";
        for await (const chunk of req) body += chunk;
        return send(res, 200, await assess(JSON.parse(body)));
      }
      if (req.method === "GET") return send(res, 200, fs.readFileSync(path.join(__dirname, "public", "index.html")), "text/html");
      send(res, 404, { error: "Not found" });
    } catch (e) {
      send(res, 500, { error: e.message });
    }
  })
  .listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
