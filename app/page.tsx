"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Footer from "./componentes/footer"
import { dlPush } from "./componentes/dataLayer"
import { useOnScreen } from "./componentes/useOnScreen"
import { useRouter } from "next/navigation"

// --- Funções auxiliares ---
function formatPhoneBR(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 11)
  if (digits.length === 0) return ""
  if (digits.length < 3) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length < 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// --- Tipagem do formulário ---
type FormData = {
  nomeCompleto: string;
  email: string;
  whatsapp: string;
  perfil: string;
  nomeEmpresa: string;
  faturamento: string;
  concordaPrivacidade: boolean;
};

// Função para normalizar o WhatsApp no formato +55XXXXXXXXXXX
const formatarWhatsapp = (numero: string): string => {
  const somenteNumeros = numero.replace(/\D/g, "");
  if (somenteNumeros.startsWith("55")) {
    return `+${somenteNumeros}`;
  }
  return `+55${somenteNumeros}`;
};

export default function Home() {
  const router = useRouter()

  const [sourceData, setSourceData] = useState({
    page_url: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    setSourceData({
      page_url: window.location.href,
      utm_source: urlParams.get("utm_source") || "",
      utm_medium: urlParams.get("utm_medium") || "",
      utm_campaign: urlParams.get("utm_campaign") || "",
      utm_term: urlParams.get("utm_term") || "",
      utm_content: urlParams.get("utm_content") || "",
    });
  }, []);

  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: "",
    email: "",
    whatsapp: "",
    perfil: "",
    nomeEmpresa: "",
    faturamento: "",
    concordaPrivacidade: false,
  })
  const [nomeErro, setNomeErro] = useState("");

  const handleSubmit = async (e?: React.FormEvent, envioSimplificado = false) => {
    e?.preventDefault(); // só previne se existir evento

    if (!envioSimplificado) {
      const isValid =
        formData.nomeCompleto.trim() &&
        formData.email.trim() &&
        formData.whatsapp.trim() &&
        formData.perfil &&
        formData.nomeEmpresa.trim() &&
        formData.faturamento.trim() &&
        formData.concordaPrivacidade;

      if (!isValid) return;
    }

    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "form_enviado",
        form_name: "form-lp-oficial",
        formDados: {
          nome: formData.nomeCompleto,
          email: formData.email,
          telefone: formatarWhatsapp(formData.whatsapp),
          voce_e: formData.perfil,
          empresa: formData.nomeEmpresa,
          faturamento: formData.faturamento,
        },
      });
      console.info("Evento 'form_enviado' disparado no dataLayer");
    }

    dlPush({
      event: "form_ready_to_submit",
      form_name: "confirmacao_digital_club",
      nome: formData.nomeCompleto,
      email: formData.email,
      whatsapp: formData.whatsapp,
      perfil: formData.perfil,
      empresa: formData.nomeEmpresa,
      faturamento: formData.faturamento,
    });

    console.info("form_ready_to_submit disparado");

    const payload = {
      event_type: "CONVERSION",
      event_family: "CDP",
      payload: {
        conversion_identifier: "LP - Digital Club",
        name: formData.nomeCompleto,
        email: formData.email,
        personal_phone: formatarWhatsapp(formData.whatsapp),
        cf_voce_e: formData.perfil,
        company_name: formData.nomeEmpresa,
        cf_qual_o_faturamento_da_sua_empresa: formData.faturamento,
        traffic_source: sourceData.utm_source,
        traffic_campaign: sourceData.utm_campaign,
        traffic_medium: sourceData.utm_medium,
        traffic_value: sourceData.utm_term,
        cf_utm_campaign: sourceData.utm_campaign,
        cf_utm_medium: sourceData.utm_medium,
        cf_utm_term: sourceData.utm_term,
        cf_utm_content: sourceData.utm_content,
        cf_utm_source: sourceData.utm_source,
        cf_url_de_conversao: sourceData.page_url,
      },
    };

    console.log("Payload enviado para RD Station:", formData.faturamento, formData.perfil);

    try {
      // 🔹 1) Envia para RD Station
      const response = await fetch(
        "https://api.rd.services/platform/conversions?api_key=MHnWDjBYARQKdwUsfZRbjtVmPEyoHnSqtgFz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        dlPush({
          event: "form_submit_success",
          form_name: "confirmacao_digital_clube",
        });

        console.log("✅ Lead enviado com sucesso para o RD Station!");

        // 🔹 2) Envia também para o webhook da Agência Digital
        try {
          const webhookPayload = {
            nome: formData.nomeCompleto,
            email: formData.email,
            whatsapp: formatarWhatsapp(formData.whatsapp),
            perfil: formData.perfil,
            nomeEmpresa: formData.nomeEmpresa,
            faturamento: formData.faturamento,
            utm_source: sourceData.utm_source,
            utm_medium: sourceData.utm_medium,
            utm_campaign: sourceData.utm_campaign,
            utm_term: sourceData.utm_term,
            utm_content: sourceData.utm_content,
            page_url: sourceData.page_url,
          };

          const webhookResponse = await fetch(
            "https://webh.agenciadigital.com.vc/webhook/digital-club",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(webhookPayload),
            }
          );

          if (webhookResponse.ok) {
            console.log("✅ Dados enviados com sucesso para o webhook da Agência Digital!");
          } else {
            const webhookText = await webhookResponse.text();
            console.error(
              "❌ Erro ao enviar para o webhook da Agência Digital:",
              webhookResponse.status,
              webhookText
            );
          }
        } catch (webhookError) {
          console.error("⚠️ Erro na chamada do webhook da Agência Digital:", webhookError);
        }

        // 🔹 3) Redireciona para /obrigado na mesma aba
        const currentParams = new URLSearchParams(window.location.search);
        let obrigadoUrl = "/obrigado";
        if ([...currentParams].length > 0) {
          obrigadoUrl += "?" + currentParams.toString();
        }
        router.push(obrigadoUrl);

      } else {
        const text = await response.text();
        console.error("❌ Erro ao enviar lead para RD Station:", response.status, text);

        dlPush({
          event: "form_submit_error",
          form_name: "confirmacao_digital_club",
          status: response.status,
        });
      }
    } catch (error) {
      console.error("⚠️ Erro na integração com RD Station:", error);

      dlPush({
        event: "form_submit_exception",
        form_name: "confirmacao_digital_club",
        error_type: "exception",
      });
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: FormData[typeof field]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // ---------------------------
  // Step-by-step specific state
  // ---------------------------
  const steps = [
    "nomeCompleto",
    "email",
    "whatsapp",
    "perfil",
    "nomeEmpresa",
    "faturamento",
  ] as const;
  type StepKey = typeof steps[number];

  const [stepIndex, setStepIndex] = useState<number>(0);
  const currentStep = steps[stepIndex];

  const nomeRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const whatsappRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      if (currentStep === "nomeCompleto") nomeRef.current?.focus?.({ preventScroll: true });
      if (currentStep === "email") emailRef.current?.focus?.({ preventScroll: true });
      if (currentStep === "whatsapp") whatsappRef.current?.focus?.({ preventScroll: true });
    } catch (err) {
      // fallback para navegadores antigos
      if (currentStep === "nomeCompleto") nomeRef.current?.focus?.();
      if (currentStep === "email") emailRef.current?.focus?.();
      if (currentStep === "whatsapp") whatsappRef.current?.focus?.();
    }
  }, [currentStep]);

  const validateStep = (step: StepKey) => {
    switch (step) {
      case "nomeCompleto":
        return formData.nomeCompleto.trim().length >= 2;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      case "whatsapp":
        return formData.whatsapp.replace(/\D/g, "").length >= 10;
      case "perfil":
        return formData.perfil.trim().length > 0;
      case "nomeEmpresa":
        return formData.nomeEmpresa.trim().length > 0;
      case "faturamento":
        return formData.faturamento.trim().length > 0;
      default:
        return false;
    }
  };

  function nextStep() {
    // Validação padrão
    if (!validateStep(currentStep)) return;

    // ✅ Validação do nome completo
    if (currentStep === "nomeCompleto") {
      const nome = formData.nomeCompleto.trim();
      const partes = nome.split(/\s+/);

      if (partes.length < 2) {
        setNomeErro("Por favor, digite seu nome completo (nome e sobrenome).");
        return;
      } else {
        setNomeErro(""); // limpa erro se estiver tudo certo
      }
    }

    // Step perfil
    if (currentStep === "perfil") {
      const resposta = formData.perfil.toLowerCase();
      const permitido = ["empresário", "diretor ou gestor"];

      if (!permitido.includes(resposta)) {
        handleSubmit(undefined, true);
        return;
      }
    }

    setStepIndex((s) => Math.min(s + 1, steps.length - 1));
  }

  function prevStep() {
    setStepIndex((s) => Math.max(s - 1, 0));
  }

  function handleKeyDownEnter(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      nextStep();
    }
  }

  const progressPercent = Math.round((stepIndex / (steps.length - 1)) * 100);

  const [openItem, setOpenItem] = useState<number | null>(null)
  const toggleItem = (id: number) => {
    setOpenItem(openItem === id ? null : id)
  }

  //faq
  const [isVisible] = useOnScreen();
  const [hasAppeared, setHasAppeared] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isVisible && !hasAppeared) {
      timeoutId = setTimeout(() => {
        setHasAppeared(true);
      }, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, hasAppeared]);

  return (
    <div className="overflow-hidden bg-[var(--primary)]">

      {/* hero section */}
      <div className="mx-auto py-20 z-10 bg-[var(--bgclaro)] bg-[url(/bghero.jpg)] bg-left bg-cover bg-no-repeat">
        <div className="max-w-[var(--largura)] px-5 mx-auto relative grid grid-cols-12 gap-5 relative z-10">

          <div className="col-span-12 md:col-span-7">
            <div className="max-w-[150px] md:max-w-[200px] mb-8">
              <Image src="/logo.svg" alt="Digital Club" width={500} height={500} priority />
            </div>

            <h1 className="text-2xl md:text-4xl leading-[1.1] font-bold text-white mb-4">
              O ambiente onde os principais empresários e profissionais do Norte se conectam
            </h1>
            <p className="text-white text-lg leading-[1.2]">Diretamente com todas as tendências e grandes nomes do mercado</p>
            <a href="#formulario" className="bg-[var(--secondary)] rounded-full text-center inline-block mt-10 uppercase font-bold px-8 py-3 text-lg text-white">Comprar Agora</a>
          </div>

        </div>

        <div className="bg-linear-to-r from-[var(--primary)] to-[var(--primary)]/50 absolute w-full h-full top-0 left-0"></div>
      </div>

      {/*section formulario 8*/}
      <div className="relative bg-[var(--primary)]">
        <div id="formulario" className="max-w-[var(--largura)] px-5 mx-auto py-20 relative">

          <div className="absolute w-[1000px] h-[1000px] -left-[800px] md:-left-[600px] -top-[100px] opacity-5">
            <Image src={"/icone.svg"} width={1000} height={1000} alt=""/>
          </div>

          <h3 className="text-white uppercase fontspace font-bold text-2xl mb-10 text-center z-1 relative">Preencha seus dados e faça parte do Digital Club.</h3>

          <div id="form" className="relative z-1">
            <div className="max-w-[800px] mx-auto relative">

              <div className="mx-auto z-1 relative">
                <div className="form border-1 border-white/20 rounded-xl py-5 md:py-15 px-5 md:px-20 bg-[var(--primary)]">

                  {/* Step-by-step form */}
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Step: nomeCompleto */}
                    {currentStep === "nomeCompleto" && (
                      <div className="space-y-2">
                        <input
                          ref={nomeRef}
                          type="text"
                          placeholder="Nome completo:"
                          value={formData.nomeCompleto}
                          onChange={(e) => {
                            handleInputChange("nomeCompleto", e.target.value);
                            setNomeErro(""); // remove erro ao digitar
                          }}
                          onKeyDown={handleKeyDownEnter}
                          className={`bg-[#FFFFFF1C] w-full border-1 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none 
            ${nomeErro ? "border-red-500 focus:ring-red-500" : "border-[var(--verde)] focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)]"}`}
                          required
                        />
                        {nomeErro && (
                          <p className="text-red-400 text-sm">{nomeErro}</p>
                        )}
                      </div>
                    )}

                    {/* Step: email */}
                    {currentStep === "email" && (
                      <div className="space-y-2">
                        <input
                          ref={emailRef}
                          type="email"
                          placeholder="E-mail:"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onKeyDown={handleKeyDownEnter}
                          className="w-full bg-[#FFFFFF1C] border-[var(--verde)] border-1 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)] focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    {/* Step: whatsapp */}
                    {currentStep === "whatsapp" && (
                      <div className="space-y-2">
                        <input
                          ref={whatsappRef}
                          type="tel"
                          placeholder="Contato (WhatsApp):"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange("whatsapp", formatPhoneBR(e.target.value))}
                          onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                            const pasted = e.clipboardData.getData("text");
                            e.preventDefault();
                            handleInputChange("whatsapp", formatPhoneBR(pasted));
                          }}
                          onKeyDown={handleKeyDownEnter}
                          inputMode="numeric"
                          className="w-full bg-[#FFFFFF1C] border-[var(--verde)] border-1 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)] focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    {/* Step: perfil */}
                    {currentStep === "perfil" && (
                      <div className="mb-2 mt-3 p-5 rounded-lg bg-[#FFFFFF1C]">
                        <label className="text-white font-medium text-base block mb-2">Você é:</label>
                        <div className="flex flex-col flex-wrap gap-3">
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="empresario"
                              name="perfil"
                              value="Empresário"
                              checked={formData.perfil === "Empresário"}
                              onChange={(e) => handleInputChange("perfil", e.target.value)}
                              className="w-4 h-4 text-[var(--secondary)] bg-transparent border-2 border-[var(--secondary)] focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="empresario" className="text-white text-sm leading-[1] cursor-pointer">
                              Empresário
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="diretor"
                              name="perfil"
                              value="Diretor ou Gestor"
                              checked={formData.perfil === "Diretor ou Gestor"}
                              onChange={(e) => handleInputChange("perfil", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-[var(--secondary)] focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="diretor" className="text-white text-sm leading-[1] cursor-pointer">
                              Diretor ou Gestor
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="profissional"
                              name="perfil"
                              value="Profissional de marketing, vendas e operações"
                              checked={formData.perfil === "Profissional de marketing, vendas e operações"}
                              onChange={(e) => handleInputChange("perfil", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-[var(--secondary)] focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="profissional" className="text-white text-sm leading-[1] cursor-pointer">
                              Profissional de marketing, vendas e operações
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="estudante"
                              name="perfil"
                              value="Estudante"
                              checked={formData.perfil === "Estudante"}
                              onChange={(e) => handleInputChange("perfil", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-[var(--secondary)] focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="estudante" className="text-white text-sm leading-[1] cursor-pointer">
                              Estudante
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="outros"
                              name="perfil"
                              value="Outros"
                              checked={formData.perfil === "Outros"}
                              onChange={(e) => handleInputChange("perfil", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-[var(--secondary)] focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="outros" className="text-white text-sm leading-[1] cursor-pointer">
                              Outros
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step: empresa */}
                    {currentStep === "nomeEmpresa" && (
                      <div className="space-y-2">
                        <input
                          ref={nomeRef}
                          type="text"
                          placeholder="Qual o nome da sua empresa ou da empresa que você atua?"
                          value={formData.nomeEmpresa}
                          onChange={(e) => handleInputChange("nomeEmpresa", e.target.value)}
                          onKeyDown={handleKeyDownEnter}
                          className="bg-[#FFFFFF1C] w-full border-[var(--verde)] border-1 rounded-lg px-4 py-3 text-white placeholder:text-gray-400 focus:border-[var(--secondary)] focus:ring-2 focus:ring-[var(--secondary)] focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    {/* Step: faturamento */}
                    {currentStep === "faturamento" && (
                      <div className="mb-2 mt-3 p-5 rounded-lg bg-[#FFFFFF1C]">
                        <label className="text-white font-medium text-base block mb-2">
                          Qual o faturamento da sua empresa?
                        </label>

                        <div className="flex flex-col flex-wrap gap-3">
                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="Abaixo de 700 mil por ano"
                              name="faturamento"
                              value="Abaixo de 700 mil por ano"
                              checked={formData.faturamento === "Abaixo de 700 mil por ano"}
                              onChange={(e) => handleInputChange("faturamento", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-cyan-400 focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="Abaixo de 700 mil por ano" className="text-white text-sm leading-[1] cursor-pointer">
                              Abaixo de 700 mil por ano
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="Fatura até 1 milhão por ano"
                              name="faturamento"
                              value="Fatura até 1 milhão por ano"
                              checked={formData.faturamento === "Fatura até 1 milhão por ano"}
                              onChange={(e) => handleInputChange("faturamento", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-cyan-400 focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="Fatura até 1 milhão por ano" className="text-white text-sm leading-[1] cursor-pointer">
                              Fatura até 1 milhão por ano
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="De R$ 1 milhão a R$ 5 milhões"
                              name="faturamento"
                              value="De R$ 1 milhão a R$ 5 milhões"
                              checked={formData.faturamento === "De R$ 1 milhão a R$ 5 milhões"}
                              onChange={(e) => handleInputChange("faturamento", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-cyan-400 focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="De R$ 1 milhão a R$ 5 milhões" className="text-white text-sm leading-[1] cursor-pointer">
                              De R$ 1 milhão a R$ 5 milhões
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="De R$ 5 milhões a R$ 20 milhões"
                              name="faturamento"
                              value="De R$ 5 milhões a R$ 20 milhões"
                              checked={formData.faturamento === "De R$ 5 milhões a R$ 20 milhões"}
                              onChange={(e) => handleInputChange("faturamento", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-cyan-400 focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="De R$ 5 milhões a R$ 20 milhões" className="text-white text-sm leading-[1] cursor-pointer">
                              De R$ 5 milhões a R$ 20 milhões
                            </label>
                          </div>

                          <div className="flex items-center space-x-1">
                            <input
                              type="radio"
                              id="Acima de R$ 20 milhões"
                              name="faturamento"
                              value="Acima de R$ 20 milhões"
                              checked={formData.faturamento === "Acima de R$ 20 milhões"}
                              onChange={(e) => handleInputChange("faturamento", e.target.value)}
                              className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-cyan-400 focus:ring-[var(--secondary)] focus:ring-2"
                            />
                            <label htmlFor="Acima de R$ 20 milhões" className="text-white text-sm leading-[1] cursor-pointer">
                              Acima de R$ 20 milhões
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-4">
                          <input
                            type="checkbox"
                            id="privacidade"
                            checked={formData.concordaPrivacidade}
                            onChange={(e) => handleInputChange("concordaPrivacidade", e.target.checked)}
                            className="w-4 h-4 text-cyan-400 bg-transparent border-2 border-gray-400 rounded focus:ring-[var(--secondary)] focus:ring-2"
                            required
                          />
                          <label htmlFor="privacidade" className="text-gray-300 text-sm leading-[1.2] cursor-pointer">
                            Concordo com a Política de Privacidade e com o uso dos meus dados para fins de atendimento.
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {stepIndex > 0 && (
                          <button
                            type="button"
                            onClick={prevStep}
                            className="text-sm text-white/80 hover:text-white px-3 py-2 cursor-pointer"
                          >
                            ← Voltar
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* ✅ Só mostra o botão se o campo do step atual estiver preenchido */}
                        {currentStep !== "faturamento" ? (
                          formData[currentStep] && formData[currentStep].trim() !== "" && (
                            <button
                              type="button"
                              onClick={nextStep}
                              className="bg-[var(--secondary)] flex items-center text-white rounded-full uppercase font-bold px-8 py-3 leading-[1] cursor-pointer"
                            >
                              {stepIndex === 3 &&
                                formData.perfil !== "Empresário" &&
                                formData.perfil !== "Diretor ou Gestor"
                                ? "ir para compra"
                                : "próximo"}
                            </button>
                          )
                        ) : (
                          <button
                            type="submit"
                            disabled={false}
                            className="bg-[var(--secondary)] flex items-center text-white rounded-full uppercase font-bold px-8 py-3 leading-[1] disabled:opacity-60 cursor-pointer"
                          >
                            Ir para a compra <ArrowRight />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* progress */}
                    <div className="relative">
                      <div className="text-sm text-gray-300 mb-2">
                        Etapa {stepIndex + 1} de {steps.length}
                      </div>
                      <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--secondary)] transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>

                  </form>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <Footer/>

    </div>
  )
}