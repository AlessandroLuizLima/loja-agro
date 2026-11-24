import { Loader2 } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

/** Peças de interface do painel. Sem estado: podem ser usadas em Server e Client Components. */

export type AdminState = { ok?: string; error?: string; fieldErrors?: Record<string, string> };

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-petrol">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, description, children, className = "" }: { title?: string; description?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-card ${className}`}>
      {title && <h2 className="font-display text-lg font-bold text-petrol">{title}</h2>}
      {description && <p className="mb-4 text-sm text-muted">{description}</p>}
      {title && !description && <div className="mb-4" />}
      {children}
    </section>
  );
}

const inputCls = "w-full rounded-xl border-2 border-line bg-white px-3.5 outline-none transition focus:border-brand aria-invalid:border-red-400 disabled:bg-cream";

function Label({ label, htmlFor, required }: { label: string; htmlFor: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-ink">
      {label}
      {required && <span className="text-brand-dark"> *</span>}
    </label>
  );
}

function Message({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  if (!error && !hint) return null;
  return (
    <p id={id} className={`mt-1 text-xs ${error ? "font-medium text-red-600" : "text-muted"}`}>
      {error ?? hint}
    </p>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; error?: string; hint?: ReactNode; className?: string };

export function Field({ label, name, error, hint, className = "", id, ...input }: FieldProps) {
  const fid = id ?? `a-${name}`;
  return (
    <div className={className}>
      <Label label={label} htmlFor={fid} required={input.required} />
      <input id={fid} name={name} aria-invalid={!!error || undefined} aria-describedby={`${fid}-msg`} className={`h-11 ${inputCls}`} {...input} />
      <Message id={`${fid}-msg`} error={error} hint={hint} />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; error?: string; hint?: ReactNode; className?: string };

export function TextArea({ label, name, error, hint, className = "", id, ...input }: TextareaProps) {
  const fid = id ?? `a-${name}`;
  return (
    <div className={className}>
      <Label label={label} htmlFor={fid} required={input.required} />
      <textarea id={fid} name={name} rows={3} aria-invalid={!!error || undefined} aria-describedby={`${fid}-msg`} className={`py-2.5 ${inputCls}`} {...input} />
      <Message id={`${fid}-msg`} error={error} hint={hint} />
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; error?: string; hint?: ReactNode; className?: string; children: ReactNode };

export function Select({ label, name, error, hint, className = "", id, children, ...input }: SelectProps) {
  const fid = id ?? `a-${name}`;
  return (
    <div className={className}>
      <Label label={label} htmlFor={fid} required={input.required} />
      <select id={fid} name={name} aria-invalid={!!error || undefined} className={`h-11 ${inputCls}`} {...input}>
        {children}
      </select>
      <Message id={`${fid}-msg`} error={error} hint={hint} />
    </div>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-line px-3.5 py-3 has-checked:border-brand has-checked:bg-brand-soft/30">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 shrink-0 accent-brand" />
      <span className="text-sm">
        <b className="block font-medium text-ink">{label}</b>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Escolha de dias da semana (envia vários valores com o mesmo nome) */
export function WeekdayPicker({ name, label, defaultValue }: { name: string; label: string; defaultValue: number[] }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-ink">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {DAY_NAMES.map((d, i) => (
          <label key={d} className="cursor-pointer">
            <input type="checkbox" name={name} value={i} defaultChecked={defaultValue.includes(i)} className="peer sr-only" />
            <span className="grid h-10 w-12 place-items-center rounded-xl border-2 border-line text-sm font-semibold text-muted transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand/50">
              {d}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SubmitButton({ pending, children, className = "" }: { pending?: boolean; children: ReactNode; className?: string }) {
  return (
    <button type="submit" disabled={pending} className={`btn btn-primary h-11 px-6 text-sm disabled:opacity-70 ${className}`}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: AdminState }) {
  if (state.error)
    return (
      <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        {state.ok}
      </p>
    );
  return null;
}

export function EmptyState({ emoji, text, action }: { emoji: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center shadow-card">
      <p className="mb-2 text-5xl" aria-hidden="true">
        {emoji}
      </p>
      <p className="mb-4 text-muted">{text}</p>
      {action}
    </div>
  );
}
