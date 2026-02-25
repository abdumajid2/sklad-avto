export async function POST() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Set-Cookie": `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}