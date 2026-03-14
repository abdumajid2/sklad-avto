export async function GET() {
  try {
    const res = await fetch(
      "https://api.moysklad.ru/api/remap/1.2/entity/demand?limit=100",
      {
        headers: {
          Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data?.errors || "Ошибка MoySklad API" },
        { status: res.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("MoySklad demand error:", error);

    return Response.json(
      { error: "Server error while fetching demands" },
      { status: 500 }
    );
  }
}