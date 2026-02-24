import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: process.env.TELEGRAM_BOT_TOKEN,
    chat: process.env.TELEGRAM_CHAT_ID,
  });
}