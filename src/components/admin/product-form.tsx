"use client";

import { useState } from "react";
import { saveProductAction } from "@/app/admin/actions/products";
import { imageUrl, TINT_NAMES, tintClass, type Category, type Product } from "@/lib/types";
import { ImageInput } from "./image-input";
import { Card, Field, FormMessage, Select, SubmitButton, TextArea, Toggle, type AdminState } from "./ui";
import { useFormAction } from "./use-form-action";

const money = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2).replace(".", ","));

const TINT_LABEL: Record<string, string> = { verde: "Verde", laranja: "Laranja", amarelo: "Amarelo", azul: "Azul", rosa: "Rosa", petroleo: "Cinza-azulado" };

export function ProductForm({ product, categories }: { product?: Product; categories: Pick<Category, "id" | "name">[] }) {
  const [state, onSubmit, pending] = useFormAction<AdminState>(saveProductAction, {});
  const [saleMode, setSaleMode] = useState(product?.saleMode ?? "online");
  const e = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-5">
        <Card title="Informações">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Nome do produto" name="name" required defaultValue={product?.name} error={e.name} placeholder="Ex.: Ração para cães adultos 15 kg" />
            <Select label="Categoria" name="categoryId" required defaultValue={product?.categoryId ?? ""} error={e.categoryId}>
              <option value="" disabled>
                Escolha…
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Field label="Unidade de venda" name="unit" required defaultValue={product?.unit ?? "Unidade"} error={e.unit} placeholder="Ex.: Saco 15 kg" />
            <TextArea className="sm:col-span-2" label="Descrição" name="description" rows={4} defaultValue={product?.description} error={e.description} />
            <TextArea className="sm:col-span-2" label="Destaques (um por linha)" name="highlights" rows={3} defaultValue={product?.highlights.join("\n")} hint="Aparecem com ✔ na página do produto." />
          </div>
        </Card>

        <Card title="Preço e estoque">
          <fieldset className="mb-4">
            <legend className="mb-1 text-sm font-medium">Como vende</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["online", "Venda pelo site", "Cliente compra e reserva direto."],
                  ["consulta", "Sob consulta", "Mostra no catálogo, pedido pelo WhatsApp (ex.: exige receita)."],
                ] as const
              ).map(([value, title, text]) => (
                <label key={value} className="flex cursor-pointer gap-3 rounded-xl border-2 border-line px-3.5 py-3 has-checked:border-brand has-checked:bg-brand-soft/30">
                  <input type="radio" name="saleMode" value={value} checked={saleMode === value} onChange={() => setSaleMode(value)} className="mt-1 size-4 accent-brand" />
                  <span className="text-sm">
                    <b className="block font-medium">{title}</b>
                    <span className="text-xs text-muted">{text}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {saleMode === "online" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Preço (R$)" name="price" inputMode="decimal" required defaultValue={money(product?.price || null)} error={e.price} placeholder="0,00" />
              <Field label="Preço antigo “de” (R$)" name="oldPrice" inputMode="decimal" defaultValue={money(product?.oldPrice)} error={e.oldPrice} hint="Opcional. Mostra o desconto." />
              <Field label="Estoque" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} error={e.stock} />
            </div>
          ) : (
            <>
              <input type="hidden" name="price" value="0" />
              <input type="hidden" name="oldPrice" value="" />
              <input type="hidden" name="stock" value={product?.stock ?? 0} />
            </>
          )}
        </Card>
      </div>

      <div className="space-y-5 lg:sticky lg:top-6">
        <Card title="Foto">
          <ImageInput name="image" label="" currentUrl={imageUrl(product?.imageId)} hint="Foto quadrada fica melhor. Reduzimos o tamanho automaticamente." />
          {e.image && <p className="mt-1 text-xs font-medium text-red-600">{e.image}</p>}
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium text-petrol">Sem foto? Escolha um ícone</summary>
            <div className="mt-3 grid grid-cols-[90px_1fr] gap-3">
              <Field label="Emoji" name="emoji" defaultValue={product?.emoji ?? "📦"} maxLength={8} className="text-center" />
              <Select label="Cor de fundo" name="tint" defaultValue={product?.tint ?? "verde"}>
                {TINT_NAMES.map((t) => (
                  <option key={t} value={t}>
                    {TINT_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
              {TINT_NAMES.map((t) => (
                <span key={t} className={`size-6 rounded-full border border-line ${tintClass(t)}`} />
              ))}
            </div>
          </details>
        </Card>

        <Card title="Visibilidade">
          <div className="space-y-2">
            <Toggle name="active" label="Mostrar na loja" hint="Desmarque para esconder sem apagar." defaultChecked={product?.active ?? true} />
            <Toggle name="featured" label="Destaque na página inicial" hint="Aparece em “Mais procurados”." defaultChecked={product?.featured ?? false} />
          </div>
        </Card>

        <FormMessage state={state} />
        <SubmitButton pending={pending} className="h-13 w-full text-base">
          {product ? "Salvar alterações" : "Cadastrar produto"}
        </SubmitButton>
      </div>
    </form>
  );
}
