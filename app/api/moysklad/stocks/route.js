export async function GET() {
  const res = await fetch(
    "https://api.moysklad.ru/api/remap/1.2/report/stock/all",
    {
      headers: {
        Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
      },
    }
  );

  const data = await res.json();

  return Response.json(data);
}