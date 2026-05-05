// ============================================================================
// Supabase Edge Function: reformat
// Deploy with:
//   supabase functions deploy reformat --no-verify-jwt
// Set the API key:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// The function takes JSON {text: string} and returns {rewritten: string}.
// It calls Claude Haiku to rewrite the user's feedback in the most petty,
// passive-aggressive, hyper-negative voice it can manage.
// ============================================================================

// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT = `You are a "feedback formatter" for a joke survey on a game-night invite. The user just submitted feedback about a recurring game night that, objectively, is fine. Your job: rewrite their text as the petty, passive-aggressive, hyper-negative version of itself — as if exposing what they "really" meant.

Rules:
- Output ONLY the rewritten text, no preamble, no quotes, no explanation.
- Keep it under 60 words.
- Match the user's topic and reuse any specific names, games, foods, or events they mentioned.
- Do NOT invent new factual claims, events, or accusations. Only dial up tone.
- If their text was positive, invert it. If neutral, make it sound resentful. If negative, lean further.
- Voice: passive-aggressive group-chat energy, mildly unhinged, comedic. Think "reluctant attendee venting in their notes app."
- Never insult anyone's appearance, identity, or anything outside the game-night context. No slurs, no protected attributes, no genuine cruelty.
- Keep it PG-13 at most.`;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "bad json" }, 400); }

  const text = String(body?.text ?? "").trim();
  if (text.length < 1) return json({ error: "empty text" }, 400);
  if (text.length > 4000) return json({ error: "too long" }, 400);

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: `User text:\n"""\n${text}\n"""\n\nRewritten:` },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return json({ error: "anthropic error", detail: err }, 502);
    }

    const data = await resp.json();
    const rewritten = (data?.content?.[0]?.text ?? "").trim();
    if (!rewritten) return json({ error: "empty rewrite" }, 502);

    return json({ rewritten });
  } catch (e) {
    return json({ error: "server error", detail: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}
