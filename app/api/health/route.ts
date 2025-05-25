import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://your-app.vercel.app"
      : "http://localhost:3000"

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: process.env.VERCEL_URL ? "vercel" : "local",
    baseUrl,
    webhookUrl: `${baseUrl}/api/telegram/webhook`,
    services: {
      database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      oddsApi: !!process.env.ODDS_API_KEY,
      cronSecret: !!process.env.CRON_SECRET,
    },
  })
}
