import { Resend } from "resend";
import { getSupabase } from "../lib/supabase.js";
import { QUESTIONARIO, PERGUNTA_CONFIDENCIAL } from "../lib/questionario.js";

// Destinatário fixo: nunca vem do navegador.
const DESTINATARIO = "celebrante.priborges@gmail.com";

const LIMITE_NOME = 150;
const LIMITE_RESPOSTA = 20000;
const TEMPO_MINIMO_MS = 4000; // envios mais rápidos que isso são tratados como automatizados

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const IDS_PERGUNTAS = QUESTIONARIO.flatMap((secao) => secao.perguntas.map(([id]) => id));

// ------------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------------

export function escapeHtml(valor) {
    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Remove caracteres de controle (exceto quebra de linha e tabulação).
function limparTexto(valor) {
    return String(valor)
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .trim();
}

// Para cabeçalhos (assunto): uma linha só.
function umaLinha(valor) {
    return limparTexto(valor).replace(/\s+/g, " ");
}

function dataValida(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const [a, m, d] = valor.split("-").map(Number);
    const data = new Date(Date.UTC(a, m - 1, d));
    return (
        data.getUTCFullYear() === a &&
        data.getUTCMonth() === m - 1 &&
        data.getUTCDate() === d &&
        a >= 2000 &&
        a <= 2100
    );
}

export function formatarData(iso) {
    const [a, m, d] = iso.split("-");
    return `${d}/${m}/${a}`;
}

// ------------------------------------------------------------------
// Validação
// ------------------------------------------------------------------

export function validar(corpo) {
    if (!corpo || typeof corpo !== "object" || Array.isArray(corpo)) {
        return { erro: "Dados inválidos." };
    }

    const nome = typeof corpo.nome === "string" ? umaLinha(corpo.nome) : "";
    const parceiro = typeof corpo.parceiro === "string" ? umaLinha(corpo.parceiro) : "";
    const dataCasamento = corpo.data_casamento;

    if (!nome || nome.length > LIMITE_NOME) {
        return { erro: "Informe seu nome completo (até 150 caracteres)." };
    }
    if (!parceiro || parceiro.length > LIMITE_NOME) {
        return { erro: "Informe o nome do(a) parceiro(a) (até 150 caracteres)." };
    }
    if (!dataValida(dataCasamento)) {
        return { erro: "Informe uma data de casamento válida." };
    }

    const id = typeof corpo.id === "string" && UUID_RE.test(corpo.id) ? corpo.id.toLowerCase() : null;

    const recebidas = corpo.respostas;
    if (!recebidas || typeof recebidas !== "object" || Array.isArray(recebidas)) {
        return { erro: "Dados inválidos." };
    }

    // Apenas perguntas conhecidas são aceitas; chaves desconhecidas são descartadas.
    const respostas = {};
    for (const idPergunta of IDS_PERGUNTAS) {
        const valor = recebidas[idPergunta];
        if (valor === undefined || valor === null) {
            respostas[idPergunta] = "";
            continue;
        }
        if (typeof valor !== "string") {
            return { erro: "Dados inválidos." };
        }
        const texto = limparTexto(valor);
        if (texto.length > LIMITE_RESPOSTA) {
            return { erro: `Uma das respostas passou do limite de ${LIMITE_RESPOSTA.toLocaleString("pt-BR")} caracteres.` };
        }
        respostas[idPergunta] = texto;
    }

    return { dados: { id, nome, parceiro, dataCasamento, respostas } };
}

// Honeypot: campo invisível que só robôs preenchem.
export function caiuNaArmadilha(corpo) {
    return typeof corpo.site === "string" && corpo.site.trim() !== "";
}

// Envio rápido demais após abrir a página (ou sem o dado de tempo): provável automação.
export function rapidoDemais(corpo) {
    const tempo = Number(corpo.tempo_preenchimento);
    return !Number.isFinite(tempo) || tempo < TEMPO_MINIMO_MS;
}

// Estrutura salva no JSONB: seções na ordem original, com id, enunciado e resposta.
export function montarRespostasEstruturadas(respostas) {
    return QUESTIONARIO.map((secao) => ({
        secao: secao.titulo,
        perguntas: secao.perguntas.map(([id, pergunta]) => ({
            id,
            pergunta,
            resposta: respostas[id] || ""
        }))
    }));
}

// ------------------------------------------------------------------
// E-mail
// ------------------------------------------------------------------

function respostaHtml(texto) {
    if (!texto) {
        return '<p style="margin:0;color:#9b978a;font-style:italic;">Não respondido</p>';
    }
    return `<p style="margin:0;white-space:pre-wrap;color:#49483f;">${escapeHtml(texto)}</p>`;
}

export function montarEmail({ nome, parceiro, dataCasamento, respostas }, recebidoEm = new Date()) {
    const assunto = `Questionário dos Noivos — ${nome} e ${parceiro}`;
    const dataFormatada = formatarData(dataCasamento);
    const recebido = recebidoEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const confidencial = respostas[PERGUNTA_CONFIDENCIAL];
    const enunciadoConfidencial = QUESTIONARIO
        .flatMap((s) => s.perguntas)
        .find(([id]) => id === PERGUNTA_CONFIDENCIAL)[1];

    const blocoConfidencial = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border-collapse:collapse;">
  <tr><td style="padding:18px 20px;background:#f7f0de;border:1px solid #e0cf9f;border-left:4px solid #a07b2c;border-radius:6px;">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a6a2f;font-weight:bold;">⚠ Confidencial — somente para a celebrante</p>
    <p style="margin:0 0 10px;font-size:13px;color:#8a6a2f;">Não é conteúdo autorizado para leitura pública na cerimônia.</p>
    <p style="margin:0 0 8px;font-weight:bold;color:#49483f;">${escapeHtml(enunciadoConfidencial)}</p>
    ${respostaHtml(confidencial)}
  </td></tr>
</table>`;

    const secoesHtml = QUESTIONARIO.map((secao) => {
        const perguntasHtml = secao.perguntas.map(([id, pergunta], i) => {
            const ehConfidencial = id === PERGUNTA_CONFIDENCIAL;
            const estilo = ehConfidencial
                ? "padding:14px 16px;background:#f7f0de;border-left:4px solid #a07b2c;border-radius:4px;"
                : "padding:0 0 4px;";
            const selo = ehConfidencial
                ? '<p style="margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a6a2f;font-weight:bold;">Confidencial — somente para a celebrante</p>'
                : "";
            return `
<tr><td style="padding:0 0 18px;">
  <div style="${estilo}">
    ${selo}
    <p style="margin:0 0 6px;font-weight:bold;color:#65775f;">${i + 1}. ${escapeHtml(pergunta)}</p>
    ${respostaHtml(respostas[id])}
  </div>
</td></tr>`;
        }).join("");

        return `
<tr><td style="padding:26px 0 10px;border-top:1px solid #e6e1d3;">
  <h2 style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:21px;color:#725b48;">${escapeHtml(secao.titulo)}</h2>
  <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;color:#6f6d62;">${escapeHtml(secao.introducao)}</p>
</td></tr>
${perguntasHtml}`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(assunto)}</title></head>
<body style="margin:0;padding:0;background:#f8f7f1;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f1;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#fffefa;border:1px solid #ddd6c6;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#49483f;">
  <tr><td style="padding:32px 32px 24px;background:#e9eee5;text-align:center;border-radius:6px 6px 0 0;">
    <p style="margin:0 0 10px;font-size:12px;letter-spacing:3px;color:#725b48;">PRISCILA BORGES | CELEBRANTE</p>
    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;color:#49483f;">Novo questionário recebido</h1>
  </td></tr>
  <tr><td style="padding:28px 32px 8px;">
    <h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:20px;color:#725b48;">Identificação</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">
      <tr><td style="padding:3px 16px 3px 0;color:#6f6d62;">Respondido por:</td><td style="padding:3px 0;font-weight:bold;">${escapeHtml(nome)}</td></tr>
      <tr><td style="padding:3px 16px 3px 0;color:#6f6d62;">Parceiro(a):</td><td style="padding:3px 0;font-weight:bold;">${escapeHtml(parceiro)}</td></tr>
      <tr><td style="padding:3px 16px 3px 0;color:#6f6d62;">Data do casamento:</td><td style="padding:3px 0;font-weight:bold;">${escapeHtml(dataFormatada)}</td></tr>
      <tr><td style="padding:3px 16px 3px 0;color:#6f6d62;">Recebido em:</td><td style="padding:3px 0;">${escapeHtml(recebido)}</td></tr>
    </table>
    ${blocoConfidencial}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${secoesHtml}
    </table>
  </td></tr>
  <tr><td style="padding:18px 32px 26px;background:#e9eee5;text-align:center;font-size:12px;letter-spacing:2px;color:#65775f;border-radius:0 0 6px 6px;">
    PRISCILA BORGES · CELEBRANTE
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    // Versão em texto puro (melhora a entrega e a leitura em clientes simples).
    const linhas = [
        "PRISCILA BORGES | CELEBRANTE",
        "Novo questionário recebido",
        "",
        "IDENTIFICAÇÃO",
        `Respondido por: ${nome}`,
        `Parceiro(a): ${parceiro}`,
        `Data do casamento: ${dataFormatada}`,
        `Recebido em: ${recebido}`,
        "",
        "*** CONFIDENCIAL — SOMENTE PARA A CELEBRANTE ***",
        enunciadoConfidencial,
        confidencial || "Não respondido",
        ""
    ];
    for (const secao of QUESTIONARIO) {
        linhas.push("", secao.titulo.toUpperCase(), secao.introducao, "");
        secao.perguntas.forEach(([id, pergunta], i) => {
            linhas.push(`${i + 1}. ${pergunta}`, respostas[id] || "Não respondido", "");
        });
    }

    return { assunto, html, texto: linhas.join("\n") };
}

// ------------------------------------------------------------------
// Handler
// ------------------------------------------------------------------

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ success: false, error: "Método não permitido." });
    }

    let corpo = req.body;
    if (typeof corpo === "string") {
        try { corpo = JSON.parse(corpo); } catch { corpo = null; }
    }

    if (!corpo || typeof corpo !== "object") {
        return res.status(400).json({ success: false, error: "Dados inválidos." });
    }

    // Anti-spam: honeypot responde como sucesso para não dar pistas a robôs, mas não salva nada.
    if (caiuNaArmadilha(corpo)) {
        console.warn("Envio descartado pela proteção anti-spam (honeypot).");
        return res.status(200).json({ success: true, emailSent: true });
    }
    if (rapidoDemais(corpo)) {
        return res.status(429).json({
            success: false,
            error: "Envio muito rápido. Aguarde alguns segundos e clique em enviar novamente."
        });
    }

    const { erro, dados } = validar(corpo);
    if (erro) {
        return res.status(400).json({ success: false, error: erro });
    }

    // 1. Salvar no Supabase
    let registroId;
    try {
        const supabase = getSupabase();
        const linha = {
            nome: dados.nome,
            parceiro: dados.parceiro,
            data_casamento: dados.dataCasamento,
            respostas: montarRespostasEstruturadas(dados.respostas)
        };
        if (dados.id) linha.id = dados.id;

        const { data, error } = await supabase
            .from("questionarios")
            .insert(linha)
            .select("id")
            .single();

        if (error) {
            // 23505 = chave duplicada: este mesmo envio já foi registrado (clique repetido / reenvio).
            if (error.code === "23505") {
                return res.status(200).json({
                    success: true,
                    duplicate: true,
                    message: "Este questionário já havia sido recebido."
                });
            }
            console.error("Erro ao salvar no Supabase:", error);
            return res.status(500).json({
                success: false,
                error: "Não foi possível salvar suas respostas agora. Elas continuam na página; tente novamente em alguns instantes."
            });
        }

        registroId = data.id;
    } catch (e) {
        console.error("Falha na conexão com o Supabase:", e);
        return res.status(500).json({
            success: false,
            error: "Não foi possível salvar suas respostas agora. Elas continuam na página; tente novamente em alguns instantes."
        });
    }

    // 2. Enviar o e-mail pelo Resend
    try {
        if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
            throw new Error("Configuração do Resend incompleta.");
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const email = montarEmail(dados);

        const { error: emailError } = await resend.emails.send(
            {
                from: process.env.RESEND_FROM,
                to: [DESTINATARIO],
                subject: email.assunto,
                html: email.html,
                text: email.texto
            },
            { idempotencyKey: `questionario-${registroId}` }
        );

        if (emailError) throw emailError;
    } catch (e) {
        console.error(`E-mail não enviado (registro ${registroId} salvo no Supabase):`, e);
        return res.status(200).json({
            success: true,
            saved: true,
            emailSent: false,
            message: "Respostas salvas, mas a notificação por e-mail precisa ser verificada."
        });
    }

    return res.status(200).json({
        success: true,
        saved: true,
        emailSent: true,
        message: "Questionário enviado com sucesso."
    });
}
