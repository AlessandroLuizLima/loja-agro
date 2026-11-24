import type { InputHTMLAttributes, ReactNode, Ref } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  ref?: Ref<HTMLInputElement>;
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
};

/** Campo de formulário acessível: label, mensagem de erro ligada por aria-describedby. */
export function FormField({ label, name, error, hint, className = "", id, ...input }: Props) {
  const fieldId = id ?? `f-${name}`;
  const msgId = `${fieldId}-msg`;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1 block text-sm font-medium text-ink">
        {label}
        {input.required && <span className="text-brand-dark"> *</span>}
      </label>
      <input
        id={fieldId}
        name={name}
        aria-invalid={!!error || undefined}
        aria-describedby={error || hint ? msgId : undefined}
        className="h-12 w-full rounded-xl border-2 border-line bg-white px-4 outline-none transition placeholder:text-muted/70 focus:border-brand aria-invalid:border-red-400 disabled:bg-cream"
        {...input}
      />
      {(error || hint) && (
        <p id={msgId} className={`mt-1 text-xs ${error ? "font-medium text-red-600" : "text-muted"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
