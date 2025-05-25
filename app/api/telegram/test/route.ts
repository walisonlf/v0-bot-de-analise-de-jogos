import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!

async function sendTelegramMessage(text: string) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  })

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`)
  }

  return await response.json()
}

export async function POST() {
  try {
    const testMessage = `
🧪 <b>TESTE DE CONEXÃO TELEGRAM</b>

✅ Webhook funcionando perfeitamente!
🕐 Horário: ${new Date().toLocaleString("pt-BR")}
🤖 Sistema de notificações ativo

Este é um teste automático do sistema de webhooks.
    `.trim()

    const result = await sendTelegramMessage(testMessage)

    return NextResponse.json({
      success: true,
      message: "Test message sent successfully",
      telegramResponse: result,
    })
  } catch (error) {
    console.error("Test message error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Telegram test endpoint",
    botToken: TELEGRAM_BOT_TOKEN ? "Configured" : "Missing",
    chatId: TELEGRAM_CHAT_ID ? "Configured" : "Missing",
  })
}
