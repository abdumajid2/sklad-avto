import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChatId = process.env.TELEGRAM_CHAT_ID;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "No TELEGRAM_BOT_TOKEN in env" },
        { status: 500 }
      );
    }

    const chat_id = body.chatId ?? defaultChatId;
    if (!chat_id) {
      return NextResponse.json(
        { ok: false, error: "No chatId and no TELEGRAM_CHAT_ID in env" },
        { status: 400 }
      );
    }

    const text = body.text ?? "";
    if (!text.trim()) {
      return NextResponse.json(
        { ok: false, error: "No text" },
        { status: 400 }
      );
    }

    // Telegram API
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}