export async function GET() {
  const res = await fetch(
    "https://api.moysklad.ru/api/remap/1.2/entity/product",
    {
      headers: {
        Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  return Response.json(data);
}