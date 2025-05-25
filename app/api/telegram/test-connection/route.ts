import { NextResponse } from "next/server"
import { env } from "@/lib/env-validator"

export async function GET() {
  try {
    const telegramToken = env.get("TELEGRAM_BOT_TOKEN")
    const chatId = env.get("TELEGRAM_CHAT_ID")

    if (!telegramToken) {
      return NextResponse.json({
        success: false,
        error: "TELEGRAM_BOT_TOKEN not configured",
      })
    }

    if (!chatId) {
      return NextResponse.json({
        success: false,
        error: "TELEGRAM_CHAT_ID not configured",
      })
    }

    // Test bot info
    console.log("Testing Telegram bot info...")
    const botResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/getMe`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!botResponse.ok) {
      const errorText = await botResponse.text()
      return NextResponse.json({
        success: false,
        error: `Bot info failed: ${botResponse.status} - ${errorText}`,
      })
    }

    const botData = await botResponse.json()

    if (!botData.ok) {
      return NextResponse.json({
        success: false,
        error: `Bot API error: ${botData.description}`,
      })
    }

    // Test sending message
    console.log("Testing Telegram message sending...")
    const messageResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🧪 Teste de Conexão\n\n✅ Bot funcionando corretamente!\n🤖 Bot: @${botData.result.username}\n⏰ ${new Date().toLocaleString("pt-BR")}`,
        parse_mode: "HTML",
      }),
    })

    if (!messageResponse.ok) {
      const errorText = await messageResponse.text()
      return NextResponse.json({
        success: false,
        error: `Message send failed: ${messageResponse.status} - ${errorText}`,
        botInfo: botData.result,
      })
    }

    const messageData = await messageResponse.json()

    if (!messageData.ok) {
      return NextResponse.json({
        success: false,
        error: `Message API error: ${messageData.description}`,
        botInfo: botData.result,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Telegram connection successful",
      botInfo: {
        id: botData.result.id,
        username: botData.result.username,
        firstName: botData.result.first_name,
        canJoinGroups: botData.result.can_join_groups,
        canReadAllGroupMessages: botData.result.can_read_all_group_messages,
      },
      messageInfo: {
        messageId: messageData.result.message_id,
        chatId: messageData.result.chat.id,
        date: new Date(messageData.result.date * 1000).toISOString(),
      },
    })
  } catch (error) {
    console.error("Telegram test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
