const axios = require("axios")

// Configurações
const CONFIG = {
  ODDS_API_KEY: "b20a60c467789212e83880d469695b0a",
  TELEGRAM_BOT_TOKEN: "8149354380:AAGLNGoQI1hqM2M1mJq6uF05uw397i9kFmY",
  TELEGRAM_CHAT_ID: "-4980709993",
}

async function testTelegram() {
  console.log("🧪 Testando conexão com Telegram...")

  try {
    const response = await axios.post(`https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: `🧪 <b>TESTE DE CONEXÃO</b>

✅ Bot funcionando perfeitamente!
🕐 Horário: ${new Date().toLocaleString("pt-BR")}
🤖 Sistema pronto para análises

Este é um teste automático do sistema.`,
      parse_mode: "HTML",
    })

    if (response.status === 200) {
      console.log("✅ Telegram: CONECTADO")
      console.log(`📱 Mensagem enviada para o chat ${CONFIG.TELEGRAM_CHAT_ID}`)
      return true
    }
  } catch (error) {
    console.log("❌ Telegram: ERRO")
    console.log(`   Erro: ${error.message}`)
    return false
  }
}

async function testOddsAPI() {
  console.log("🧪 Testando conexão com The Odds API...")

  try {
    const response = await axios.get("https://api.the-odds-api.com/v4/sports", {
      params: {
        apiKey: CONFIG.ODDS_API_KEY,
      },
    })

    if (response.status === 200) {
      console.log("✅ The Odds API: CONECTADO")
      console.log(`📊 ${response.data.length} esportes disponíveis`)

      // Mostrar alguns esportes de futebol
      const footballSports = response.data.filter((sport) => sport.key.includes("soccer")).slice(0, 5)

      console.log("⚽ Principais ligas disponíveis:")
      footballSports.forEach((sport) => {
        console.log(`   - ${sport.title} (${sport.key})`)
      })

      return true
    }
  } catch (error) {
    console.log("❌ The Odds API: ERRO")
    console.log(`   Erro: ${error.message}`)

    if (error.response?.status === 401) {
      console.log("   🔑 Verifique se a API Key está correta")
    } else if (error.response?.status === 429) {
      console.log("   ⏰ Limite de requisições atingido")
    }

    return false
  }
}

async function testSupabase() {
  console.log("🧪 Testando conexão com Supabase...")

  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project") || supabaseKey.includes("your-anon-key")) {
      console.log("⚠️  Supabase: NÃO CONFIGURADO")
      console.log("   Configure as variáveis no .env.local")
      return false
    }

    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Testar uma query simples
    const { data, error } = await supabase.from("bot_status").select("*").limit(1)

    if (error) {
      console.log("❌ Supabase: ERRO")
      console.log(`   Erro: ${error.message}`)
      console.log("   💡 Execute o SQL de configuração no Supabase")
      return false
    }

    console.log("✅ Supabase: CONECTADO")
    console.log("📊 Banco de dados acessível")
    return true
  } catch (error) {
    console.log("❌ Supabase: ERRO")
    console.log(`   Erro: ${error.message}`)
    return false
  }
}

async function runAllTests() {
  console.log("🔍 TESTE DE CONECTIVIDADE DO SISTEMA")
  console.log("=====================================")
  console.log("")

  const results = {
    telegram: await testTelegram(),
    oddsAPI: await testOddsAPI(),
    supabase: await testSupabase(),
  }

  console.log("")
  console.log("📋 RESUMO DOS TESTES:")
  console.log("=====================")
  console.log(`🤖 Telegram: ${results.telegram ? "✅ OK" : "❌ FALHOU"}`)
  console.log(`📊 The Odds API: ${results.oddsAPI ? "✅ OK" : "❌ FALHOU"}`)
  console.log(`🗄️  Supabase: ${results.supabase ? "✅ OK" : "❌ FALHOU"}`)

  const allPassed = Object.values(results).every((result) => result)

  console.log("")
  if (allPassed) {
    console.log("🎉 TODOS OS TESTES PASSARAM!")
    console.log("✅ Sistema pronto para uso completo")
    console.log("")
    console.log("🚀 Para iniciar:")
    console.log("   Dashboard: npm run dashboard")
    console.log("   Bot: npm run bot")
  } else {
    console.log("⚠️  ALGUNS TESTES FALHARAM")
    console.log("🔧 Verifique as configurações acima")
    console.log("")
    console.log("💡 O sistema ainda funcionará com dados simulados")
    console.log("   Dashboard: npm run dashboard")
  }

  console.log("")
}

// Executar testes
runAllTests().catch(console.error)
