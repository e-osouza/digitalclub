"use client"

import Link from "next/link"
import { Check, Heart } from "lucide-react"

export default function ThankYouPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="w-full max-w-3xl px-6 py-12 text-center" style={{ maxWidth: "var(--largura)" }}>
        {/* Header com ícone */}
        <div className="mb-8 flex justify-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Check size={32} color="#fff" />
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-4xl font-bold mb-4 text-balance" style={{ color: "var(--primary)" }}>
          Muito Obrigado!
        </h1>

        {/* Subtítulo */}
        <p className="text-xl mb-8 leading-relaxed" style={{ color: "var(--foreground)" }}>
          Sua mensagem foi recebida com sucesso. Agradecemos por entrar em contato conosco.
        </p>

        {/* Card de confirmação */}
        <div
          className="rounded-lg p-8 mb-8 border-2"
          style={{
            backgroundColor: "var(--bgclaro)",
            borderColor: "var(--secondary)",
            color: "var(--foreground)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart size={24} style={{ color: "var(--secondary)" }} />
            <p className="text-lg font-semibold">Sua solicitação é importante para nós</p>
          </div>
          <p className="text-sm opacity-90">
            Você receberá uma resposta em breve. Verifique seu email para atualizações.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "#fff",
            }}
          >
            Voltar para Home
          </Link>
        </div>

        {/* Footer decorativo */}
        <div className="mt-16 pt-8 border-t" style={{ borderColor: "var(--secondary)", opacity: 0.5 }}>
          <p className="text-sm">
            Precisa de ajuda?{" "}
            <a
              href="https://wa.me/5592991112802"
              className="font-semibold hover:underline"
              style={{ color: "var(--secondary)" }}
              target="_blank"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}