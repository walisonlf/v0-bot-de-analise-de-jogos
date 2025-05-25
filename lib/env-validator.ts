interface EnvironmentConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string

  // Telegram (server-side only)
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string

  // APIs (server-side only)
  ODDS_API_KEY?: string
  CRON_SECRET?: string

  // Vercel (auto-provided)
  VERCEL_URL?: string
  NODE_ENV?: string
}

export class EnvValidator {
  private static instance: EnvValidator
  private config: Partial<EnvironmentConfig> = {}
  private isClient = typeof window !== "undefined"

  private constructor() {
    this.loadEnvironment()
  }

  static getInstance(): EnvValidator {
    if (!EnvValidator.instance) {
      EnvValidator.instance = new EnvValidator()
    }
    return EnvValidator.instance
  }

  private loadEnvironment() {
    if (this.isClient) {
      // Client-side: apenas variáveis públicas
      this.config = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        NODE_ENV: process.env.NODE_ENV,
      }
    } else {
      // Server-side: todas as variáveis
      this.config = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
        ODDS_API_KEY: process.env.ODDS_API_KEY,
        CRON_SECRET: process.env.CRON_SECRET,
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV,
      }
    }
  }

  get(key: keyof EnvironmentConfig): string | undefined {
    return this.config[key]
  }

  getRequired(key: keyof EnvironmentConfig): string {
    const value = this.config[key]
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
    return value
  }

  isConfigured(key: keyof EnvironmentConfig): boolean {
    return !!this.config[key]
  }

  getBaseUrl(): string {
    if (this.isClient && typeof window !== "undefined") {
      return window.location.origin
    }

    const vercelUrl = this.get("VERCEL_URL")
    if (vercelUrl) {
      return `https://${vercelUrl}`
    }

    const nodeEnv = this.get("NODE_ENV")
    return nodeEnv === "production" ? "https://your-app.vercel.app" : "http://localhost:3000"
  }

  getWebhookUrl(): string {
    return `${this.getBaseUrl()}/api/telegram/webhook`
  }

  validateSupabase(): { valid: boolean; missing: string[] } {
    const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const
    const missing = required.filter((key) => !this.isConfigured(key))
    return { valid: missing.length === 0, missing }
  }

  validateTelegram(): { valid: boolean; missing: string[] } {
    if (this.isClient) {
      return { valid: true, missing: [] } // Não pode validar no client
    }

    const required = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"] as const
    const missing = required.filter((key) => !this.isConfigured(key))
    return { valid: missing.length === 0, missing }
  }

  validateOddsApi(): { valid: boolean; missing: string[] } {
    if (this.isClient) {
      return { valid: true, missing: [] } // Não pode validar no client
    }

    const required = ["ODDS_API_KEY"] as const
    const missing = required.filter((key) => !this.isConfigured(key))
    return { valid: missing.length === 0, missing }
  }

  validateAll(): {
    supabase: { valid: boolean; missing: string[] }
    telegram: { valid: boolean; missing: string[] }
    oddsApi: { valid: boolean; missing: string[] }
    overall: { valid: boolean; missing: string[] }
  } {
    const supabase = this.validateSupabase()
    const telegram = this.validateTelegram()
    const oddsApi = this.validateOddsApi()

    const allMissing = [...supabase.missing, ...telegram.missing, ...oddsApi.missing]

    return {
      supabase,
      telegram,
      oddsApi,
      overall: { valid: allMissing.length === 0, missing: allMissing },
    }
  }

  getEnvironmentInfo() {
    return {
      isClient: this.isClient,
      nodeEnv: this.get("NODE_ENV") || "development",
      hasVercelUrl: this.isConfigured("VERCEL_URL"),
      baseUrl: this.getBaseUrl(),
      webhookUrl: this.getWebhookUrl(),
      validation: this.validateAll(),
    }
  }
}

export const env = EnvValidator.getInstance()
