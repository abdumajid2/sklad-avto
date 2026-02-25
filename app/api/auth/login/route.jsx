import crypto from "crypto";

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export async function POST(req) {
  const { password } = await req.json();

  const APP_PASSWORD = process.env.APP_PASSWORD || "";
  const SECRET = process.env.SESSION_SECRET || "";

  if (!APP_PASSWORD || !SECRET) {
    return new Response("Server env missing", { status: 500 });
  }

  if (password !== APP_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = `ok.${Date.now()}`; // простая сессия
  const sig = sign(payload, SECRET);
  const token = `${payload}.${sig}`;

  return new Response("OK", {
    status: 200,
    headers: {
      "Set-Cookie": `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    },
  });
}