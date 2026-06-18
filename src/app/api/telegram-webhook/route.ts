import { NextRequest, NextResponse } from "next/server";
import { parseTelegramMessage, isLocationMessage } from "@/lib/telegram/parser";
import { upsertEmployeeLocation } from "@/lib/actions/employees";

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  chat: { id: number; type: string };
  from?: { id: number; first_name: string; username?: string };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

function validateSecret(req: NextRequest): boolean {
  return req.headers.get("x-telegram-bot-api-secret-token") === process.env.TELEGRAM_WEBHOOK_SECRET;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!validateSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TelegramUpdate;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const msg = body.channel_post ?? body.message;
  if (!msg) return NextResponse.json({ ok: true, skipped: "no message" });

  const text = msg.text ?? msg.caption ?? "";
  if (!isLocationMessage(text)) return NextResponse.json({ ok: true, skipped: "not a location message" });

  const parsed = parseTelegramMessage(text, msg.message_id, msg.date);
  if (!parsed) return NextResponse.json({ ok: true, skipped: "parse failed" });

  const result = await upsertEmployeeLocation(parsed);
  if (!result.success) {
    return NextResponse.json({ ok: true, warning: result.error });
  }

  return NextResponse.json({ ok: true, locationId: result.locationId });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "ok", service: "telegram-webhook", timestamp: new Date().toISOString() });
}
