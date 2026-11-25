import "server-only";

/**
 * Envio dos códigos de confirmação.
 * - E-mail: Resend (RESEND_API_KEY + EMAIL_FROM). Plano grátis: 3.000 e-mails/mês.
 * - SMS: Twilio (TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM). Cobrado por mensagem.
 * Sem o serviço configurado: em desenvolvimento o código aparece na tela (modo de teste);
 * em produção a opção de confirmar some, em vez de prometer um código que não chega.
 */

export type Channel = "email" | "phone";

const isProd = () => process.env.NODE_ENV === "production";
const emailConfigured = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
const smsConfigured = () => !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);

const configured = (channel: Channel) => (channel === "email" ? emailConfigured() : smsConfigured());

/** Dá para confirmar esse tipo de contato nesta instalação? */
export const canVerify = (channel: Channel) => configured(channel) || !isProd();

export type SendResult = { ok: true; testCode?: string } | { ok: false; error: string };

export async function sendCode(channel: Channel, to: string, code: string, storeName: string): Promise<SendResult> {
  if (!configured(channel)) {
    if (isProd()) return { ok: false, error: "Confirmação indisponível no momento." };
    console.info(`[loja] Código de confirmação (${channel}) para ${to}: ${code}`);
    return { ok: true, testCode: code };
  }
  try {
    if (channel === "email") await sendEmail(to, code, storeName);
    else await sendSms(to, code, storeName);
    return { ok: true };
  } catch (err) {
    console.error("[loja] Falha ao enviar código:", err);
    return { ok: false, error: "Não conseguimos enviar o código agora. Tente de novo em alguns minutos." };
  }
}

function sendEmail(to: string, code: string, storeName: string) {
  return resend(
    to,
    `${code} é o seu código de confirmação – ${storeName}`,
    `Olá!\n\nSeu código para confirmar este e-mail na ${storeName} é: ${code}\n\nEle vale por 10 minutos. Se não foi você, ignore esta mensagem.`,
  );
}

async function resend(to: string, subject: string, text: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Resend respondeu ${res.status}`);
}

/** E-mail para a própria loja (aviso de pedido novo). Sem Resend configurado, não faz nada. */
export async function emailStore(to: string, subject: string, text: string) {
  if (!emailConfigured() || !to) return false;
  try {
    await resend(to, subject, text);
    return true;
  } catch (err) {
    console.error("[loja] Falha ao enviar aviso de pedido:", err);
    return false;
  }
}

async function sendSms(to: string, code: string, storeName: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({ To: `+55${to.replace(/\D/g, "")}`, From: process.env.TWILIO_FROM!, Body: `${storeName}: seu código de confirmação é ${code}. Vale por 10 minutos.` });
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Twilio respondeu ${res.status}`);
}
