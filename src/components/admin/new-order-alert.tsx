"use client";

import { BellRing, BellOff, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { brl } from "@/lib/format";

type Latest = { id: string; number: number; name: string; total: number } | null;

const POLL_MS = 20_000;
const PREF_KEY = "painel-alertas";

/** Dois toques curtos, gerados no navegador (sem arquivo de áudio). */
function ding(ctx: AudioContext) {
  const now = ctx.currentTime;
  [0, 0.22].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = i === 0 ? 880 : 1175;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.4);
  });
}

/**
 * Alerta de pedido novo: com o painel aberto (no computador do balcão ou no celular), confere a cada 20 s.
 * Quando entra um pedido: toca um som, mostra um aviso na tela, muda o título da aba e, se permitido,
 * mostra uma notificação do sistema — mesmo com o painel em outra aba.
 */
export function NewOrderAlert({ base, initialLatest }: { base: string; initialLatest: number }) {
  const router = useRouter();
  const lastSeen = useRef(initialLatest);
  const audio = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [toast, setToast] = useState<NonNullable<Latest> | null>(null);

  // Preferência salva neste aparelho
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê do navegador depois de montar (não existe no servidor)
      setEnabled(localStorage.getItem(PREF_KEY) === "1");
    } catch {
      /* navegador sem armazenamento: começa desligado */
    }
  }, []);

  // O navegador só libera som depois de um clique na página: prepara o áudio no primeiro clique
  useEffect(() => {
    if (!enabled) return;
    const unlock = () => {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [enabled]);

  const check = useCallback(async () => {
    try {
      const res = await fetch(`${base}/novidades`, { cache: "no-store" });
      if (!res.ok) return;
      const { latest } = (await res.json()) as { latest: Latest };
      if (!latest || latest.number <= lastSeen.current) return;
      lastSeen.current = latest.number;
      setToast(latest);
      router.refresh();
      if (!enabled) return;
      if (audio.current) ding(audio.current);
      if ("Notification" in window && Notification.permission === "granted") {
        const n = new Notification(`Novo pedido #${latest.number}`, { body: `${latest.name} · ${brl(latest.total)}`, tag: `pedido-${latest.number}` });
        n.onclick = () => {
          window.focus();
          router.push(`${base}/pedidos/${latest.id}`);
        };
      }
    } catch {
      /* sem internet por um momento: tenta de novo no próximo ciclo */
    }
  }, [base, enabled, router]);

  useEffect(() => {
    const timer = setInterval(check, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && void check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [check]);

  // Título da aba pisca enquanto houver aviso aberto
  useEffect(() => {
    if (!toast) return;
    const original = document.title;
    let on = false;
    const timer = setInterval(() => {
      on = !on;
      document.title = on ? `🔔 Novo pedido #${toast.number}` : original;
    }, 1200);
    return () => {
      clearInterval(timer);
      document.title = original;
    };
  }, [toast]);

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      try {
        localStorage.setItem(PREF_KEY, "0");
      } catch {}
      return;
    }
    audio.current ??= new AudioContext();
    await audio.current.resume();
    ding(audio.current);
    if ("Notification" in window && Notification.permission === "default") await Notification.requestPermission();
    setEnabled(true);
    try {
      localStorage.setItem(PREF_KEY, "1");
    } catch {}
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${enabled ? "text-white/70 hover:bg-white/10" : "bg-sun text-petrol-dark hover:brightness-95"}`}
      >
        {enabled ? <BellRing className="size-4" /> : <BellOff className="size-4" />}
        {enabled ? "Alerta de pedidos ligado" : "Ligar alerta de pedido novo"}
      </button>

      {toast && (
        <div role="alert" className="pop fixed right-4 bottom-4 z-50 w-[min(92vw,360px)] rounded-2xl bg-white p-4 text-ink shadow-[0_20px_50px_-10px_rgb(0_0_0/.4)] ring-2 ring-brand print:hidden">
          <button type="button" onClick={() => setToast(null)} aria-label="Fechar aviso" className="absolute top-2 right-2 grid size-8 place-items-center rounded-lg text-muted hover:bg-cream">
            <X className="size-4" />
          </button>
          <p className="flex items-center gap-2 font-display text-lg font-bold text-petrol">
            <span className="grid size-9 place-items-center rounded-xl bg-brand text-white">
              <ShoppingBag className="size-5" />
            </span>
            Novo pedido #{toast.number}
          </p>
          <p className="mt-1 text-sm text-muted">
            {toast.name} · <b className="text-petrol">{brl(toast.total)}</b>
          </p>
          <Link href={`${base}/pedidos/${toast.id}`} onClick={() => setToast(null)} className="btn btn-primary mt-3 h-10 w-full text-sm">
            Ver pedido
          </Link>
        </div>
      )}
    </>
  );
}
