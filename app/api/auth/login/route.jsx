export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body?.password ?? "";

    const APP_PASSWORD = process.env.APP_PASSWORD;

    if (!APP_PASSWORD) {
      return new Response("APP_PASSWORD missing on server", { status: 500 });
    }

    if (password !== APP_PASSWORD) {
      return new Response("Wrong password", { status: 401 });
    }

    return new Response("OK", {
      status: 200,
      headers: {
        "Set-Cookie": `session=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
    });
  } catch (e) {
    return new Response("Login error: " + (e?.message || "unknown"), {
      status: 500,
    });
  }
}