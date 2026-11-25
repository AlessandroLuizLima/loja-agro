"use client";

import { BadgeCheck, CircleAlert, Loader2, Mail, Phone } from "lucide-react";
import { useActionState, useState } from "react";
import { confirmContactCode, sendContactCode, updateContactAction, type ContactState } from "@/app/(loja)/conta/actions";
import { maskPhone } from "@/lib/masks";

const input = "h-11 w-full rounded-xl border-2 border-line bg-white px-3.5 outline-none focus:border-brand";

/**
 * Um contato da conta (e-mail ou celular): mostra se está confirmado, envia o código de confirmação
 * e permite trocar. O componente é remontado (key) quando o valor ou o status mudam no servidor.
 */
export function ContactRow({ channel, value, verified, canVerify }: { channel: "email" | "phone"; value: string | null; verified: boolean; canVerify: boolean }) {
  const [sendState, send, sending] = useActionState<ContactState, FormData>(sendContactCode, {});
  const [confirmState, confirm, confirming] = useActionState<ContactState, FormData>(confirmContactCode, {});
  const [editState, save, saving] = useActionState<ContactState, FormData>(updateContactAction, {});
  const [editing, setEditing] = useState(false);
  // Campos controlados: o React limpa formulários depois de cada envio, e o cliente não precisa redigitar após um erro
  const [phone, setPhone] = useState(value ?? "");
  const [email, setEmail] = useState("");

  const isEmail = channel === "email";
  const Icon = isEmail ? Mail : Phone;
  const label = isEmail ? "E-mail" : "Celular";
  const codeSent = sendState.sent || confirmState.sent;

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-petrol-soft text-petrol">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{label}</p>
          <p className="font-medium break-all">{value ?? <span className="text-muted">Não cadastrado</span>}</p>
          {value && <StatusBadge verified={verified} className="mt-1.5 flex sm:hidden" />}
        </div>
        {value && <StatusBadge verified={verified} className="hidden sm:flex" />}
      </div>

      {!editing && (
        <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
          {value && !verified && canVerify && !codeSent && (
            <form action={send}>
              <input type="hidden" name="channel" value={channel} />
              <button type="submit" disabled={sending} className="btn btn-primary h-9 px-4 text-sm disabled:opacity-70">
                {sending && <Loader2 className="size-4 animate-spin" />} Confirmar {isEmail ? "e-mail" : "celular"}
              </button>
            </form>
          )}
          <button type="button" onClick={() => setEditing(true)} className="btn h-9 border-2 border-line px-4 text-sm text-petrol hover:border-brand">
            {value ? "Alterar" : "Adicionar celular"}
          </button>
        </div>
      )}
      {sendState.error && !editing && <p className="mt-2 pl-[52px] text-sm font-medium text-red-700">{sendState.error}</p>}

      {/* Código enviado: campo para digitar */}
      {codeSent && !editing && !verified && (
        <div className="mt-3 ml-[52px] rounded-xl bg-cream p-3">
          <p className="text-sm">
            Enviamos um código de 6 números para <b>{value}</b>. Ele vale por 10 minutos.
          </p>
          {sendState.testCode && (
            <p className="mt-2 rounded-lg bg-sun-soft px-3 py-2 text-xs text-amber-800">
              Modo de teste (sem serviço de {isEmail ? "e-mail" : "SMS"} configurado): o código é <b className="font-mono">{sendState.testCode}</b>
            </p>
          )}
          <form action={confirm} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="channel" value={channel} />
            <input name="code" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" className={`${input} w-36 text-center font-mono tracking-widest`} />
            <button type="submit" disabled={confirming} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-70">
              {confirming && <Loader2 className="size-4 animate-spin" />} Confirmar
            </button>
          </form>
          {confirmState.error && <p className="mt-2 text-sm font-medium text-red-700">{confirmState.error}</p>}
          <form action={send} className="mt-2">
            <input type="hidden" name="channel" value={channel} />
            <button type="submit" disabled={sending} className="text-xs font-semibold text-brand-dark hover:underline">
              Reenviar código
            </button>
          </form>
        </div>
      )}
      {confirmState.ok && <p className="mt-2 pl-[52px] text-sm font-medium text-emerald-700">{confirmState.ok}</p>}

      {/* Trocar o contato */}
      {editing && (
        <form action={save} className="mt-3 ml-[52px] grid gap-2 rounded-xl bg-cream p-3 sm:grid-cols-2">
          <input type="hidden" name="channel" value={channel} />
          {isEmail ? (
            <>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Novo e-mail</span>
                <input name="value" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium">Sua senha</span>
                <input name="password" type="password" required autoComplete="current-password" className={input} />
              </label>
            </>
          ) : (
            <label className="text-sm sm:col-span-2">
              <span className="mb-1 block font-medium">Celular com DDD</span>
              <input name="value" type="tel" inputMode="numeric" required autoComplete="tel-national" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="(11) 90000-0000" className={input} />
            </label>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <button type="submit" disabled={saving} className="btn btn-primary h-10 px-5 text-sm disabled:opacity-70">
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar
            </button>
            <button type="button" onClick={() => setEditing(false)} className="h-10 px-3 text-sm font-semibold text-muted hover:underline">
              Cancelar
            </button>
            {editState.error && <p className="text-sm font-medium text-red-700">{editState.error}</p>}
          </div>
        </form>
      )}
    </li>
  );
}

function StatusBadge({ verified, className }: { verified: boolean; className: string }) {
  return verified ? (
    <span className={`w-fit items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-emerald-700 ${className}`}>
      <BadgeCheck className="size-4" /> Confirmado
    </span>
  ) : (
    <span className={`w-fit items-center gap-1 rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-amber-700 ${className}`}>
      <CircleAlert className="size-4" /> Não confirmado
    </span>
  );
}
