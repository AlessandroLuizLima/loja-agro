"use client";

import { AlertTriangle, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { importProductsAction, type ImportState } from "@/app/admin/actions/import";

/**
 * Importação em dois passos: "Conferir" mostra o que vai mudar e os erros por linha; "Importar" grava.
 * Envio manual (sem o reset automático do formulário) para o arquivo escolhido continuar selecionado entre os passos.
 */
export function ImportForm({ productsHref }: { productsHref: string }) {
  const [state, dispatch, pending] = useActionState<ImportState, FormData>(importProductsAction, {});
  const [fileName, setFileName] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  }

  if (state.done) {
    return (
      <div className="rounded-2xl bg-mint/60 p-5">
        <p className="flex items-center gap-2 font-display text-lg font-bold text-emerald-800">
          <CheckCircle2 className="size-6" /> Planilha importada
        </p>
        <p className="mt-1 text-sm">
          {state.done.created} produto(s) novo(s) e {state.done.updated} atualizado(s)
          {state.done.categories > 0 && `, ${state.done.categories} categoria(s) criada(s)`}. A loja já mostra os preços e o estoque novos.
        </p>
        <Link href={productsHref} className="btn btn-primary mt-4 h-11 px-5 text-sm">
          Ver produtos
        </Link>
      </div>
    );
  }

  const plan = state.plan;
  const ready = plan && plan.errors.length === 0 && plan.create + plan.update > 0;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-cream p-6 text-center transition hover:border-brand">
        <FileSpreadsheet className="size-10 text-brand" />
        <span className="font-semibold text-petrol">{fileName || "Escolher planilha (.csv)"}</span>
        <span className="text-xs text-muted">Até 5.000 produtos por vez</span>
        <input
          type="file"
          name="arquivo"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? "");
          }}
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {plan && (
        <div className="rounded-2xl border-2 border-line p-4 text-sm">
          <p className="font-display font-bold text-petrol">Conferência da planilha</p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-3">
            <li>
              <b className="text-lg text-emerald-700">{plan.create}</b> novos
            </li>
            <li>
              <b className="text-lg text-petrol">{plan.update}</b> atualizados
            </li>
            <li>
              <b className={`text-lg ${plan.errors.length ? "text-red-600" : "text-muted"}`}>{plan.errors.length}</b> com erro
            </li>
          </ul>
          {plan.newCategories.length > 0 && <p className="mt-2 text-muted">Categorias novas que serão criadas: {plan.newCategories.join(", ")}.</p>}
          {plan.errors.length > 0 && (
            <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-800">
              <p className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-4" /> Corrija estas linhas na planilha e confira de novo:
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {plan.errors.map((e) => (
                  <li key={e.line}>
                    Linha {e.line}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ready && plan.sample.length > 0 && (
            <ul className="mt-3 space-y-0.5 text-muted">
              {plan.sample.map((s) => (
                <li key={s.line}>
                  <span className={s.action === "criar" ? "text-emerald-700" : "text-petrol"}>{s.action === "criar" ? "Novo" : "Atualiza"}</span>: {s.name}
                </li>
              ))}
              {plan.create + plan.update > plan.sample.length && <li>… e mais {plan.create + plan.update - plan.sample.length}</li>}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" name="modo" value="conferir" disabled={pending || !fileName} className={`btn h-11 px-5 text-sm disabled:opacity-60 ${ready ? "border-2 border-line text-petrol" : "btn-primary"}`}>
          {pending && <Loader2 className="size-4 animate-spin" />} Conferir planilha
        </button>
        {ready && (
          <button type="submit" name="modo" value="importar" disabled={pending} className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60">
            {pending && <Loader2 className="size-4 animate-spin" />} Importar {plan.create + plan.update} produto(s)
          </button>
        )}
      </div>
    </form>
  );
}
