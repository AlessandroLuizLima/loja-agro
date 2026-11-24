"use client";

import { useState } from "react";
import { changePasswordAction, saveSettingsAction } from "@/app/admin/actions/settings";
import { formatPhone } from "@/lib/format";
import { imageUrl, type Settings } from "@/lib/types";
import { ImageInput } from "./image-input";
import { Card, Field, FormMessage, SubmitButton, TextArea, type AdminState } from "./ui";
import { useFormAction } from "./use-form-action";

export function SettingsForm({ settings: s }: { settings: Settings }) {
  const [state, onSubmit, pending] = useFormAction<AdminState>(saveSettingsAction, {});
  const [brand, setBrand] = useState(s.colorBrand);
  const [petrol, setPetrol] = useState(s.colorPetrol);
  const e = state.fieldErrors ?? {};

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Card title="Identidade da loja" description="Nome, logo e cores aparecem em todo o site.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome da loja" name="storeName" required defaultValue={s.storeName} error={e.storeName} />
          <Field label="Frase curta" name="tagline" defaultValue={s.tagline} error={e.tagline} placeholder="Ex.: Agropecuária e pet shop" />
          <div className="sm:col-span-2">
            <ImageInput name="logo" label="Logo" currentUrl={imageUrl(s.logoImageId)} maxSide={600} shape="wide" hint="PNG com fundo transparente fica melhor. Sem logo, mostramos o nome." />
            {e.logo && <p className="mt-1 text-xs font-medium text-red-600">{e.logo}</p>}
          </div>
          <ColorField label="Cor de destaque (botões)" name="colorBrand" value={brand} onChange={setBrand} />
          <ColorField label="Cor principal (títulos e topo)" name="colorPetrol" value={petrol} onChange={setPetrol} />
          <div className="sm:col-span-2">
            <p className="mb-1 text-sm font-medium">Prévia</p>
            <div className="flex flex-wrap items-center gap-3 rounded-2xl p-4" style={{ background: petrol }}>
              <span className="font-display text-lg font-bold text-white">{s.storeName}</span>
              <span className="rounded-full px-5 py-2 font-display text-sm font-semibold text-white" style={{ background: brand }}>
                Adicionar ao carrinho
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Página inicial">
        <div className="grid gap-4">
          <Field label="Aviso no topo do site" name="announcement" defaultValue={s.announcement} error={e.announcement} hint="Deixe em branco para esconder a faixa." />
          <Field label="Título principal" name="heroTitle" required defaultValue={s.heroTitle} error={e.heroTitle} />
          <TextArea label="Texto abaixo do título" name="heroSubtitle" rows={2} defaultValue={s.heroSubtitle} error={e.heroSubtitle} />
          <TextArea label="Quem somos" name="about" rows={4} defaultValue={s.about} error={e.about} hint="Aparece na página “Quem somos”." />
        </div>
      </Card>

      <Card title="Contato e endereço">
        <div className="grid gap-4 sm:grid-cols-6">
          <Field className="sm:col-span-3" label="WhatsApp da loja" name="whatsapp" type="tel" inputMode="numeric" required defaultValue={formatPhone(s.whatsapp)} error={e.whatsapp} hint="Recebe os avisos de pedido dos clientes." />
          <Field className="sm:col-span-3" label="E-mail" name="email" type="email" defaultValue={s.email} error={e.email} />
          <Field className="sm:col-span-6" label="Endereço da loja" name="address" required defaultValue={s.address} error={e.address} placeholder="Rua, número – bairro" />
          <Field className="sm:col-span-4" label="Cidade" name="city" required defaultValue={s.city} error={e.city} />
          <Field className="sm:col-span-2" label="UF" name="state" required maxLength={2} defaultValue={s.state} error={e.state} />
          <Field className="sm:col-span-6" label="Horário de funcionamento" name="hours" defaultValue={s.hours} error={e.hours} />
          <Field className="sm:col-span-3" label="Instagram (link)" name="instagram" defaultValue={s.instagram} error={e.instagram} placeholder="https://instagram.com/sualoja" />
          <Field className="sm:col-span-3" label="Facebook (link)" name="facebook" defaultValue={s.facebook} error={e.facebook} placeholder="https://facebook.com/sualoja" />
          <Field className="sm:col-span-4" label="Razão social" name="legalName" defaultValue={s.legalName} error={e.legalName} />
          <Field className="sm:col-span-2" label="CNPJ" name="cnpj" defaultValue={s.cnpj} error={e.cnpj} />
        </div>
      </Card>

      <Card title="Pix" description="Com a chave preenchida, o cliente pode pagar pelo site com QR Code. O dinheiro cai direto na sua conta, sem taxa de intermediário.">
        <div className="grid gap-4 sm:grid-cols-6">
          <Field className="sm:col-span-6" label="Chave Pix" name="pixKey" defaultValue={s.pixKey} error={e.pixKey} hint="CNPJ, e-mail, chave aleatória ou celular no formato +5511999999999. Em branco: Pix só na retirada/entrega." />
          <Field className="sm:col-span-4" label="Nome do recebedor" name="pixName" maxLength={25} defaultValue={s.pixName} error={e.pixName} hint="Como aparece no app do banco (até 25 letras)." />
          <Field className="sm:col-span-2" label="Desconto no Pix (%)" name="pixDiscountPercent" type="number" min={0} max={30} step="0.5" defaultValue={s.pixDiscountPercent} error={e.pixDiscountPercent} />
        </div>
      </Card>

      <Card title="Endereço do site" description="O domínio da loja (usado no Google e nos links compartilhados).">
        <Field label="Domínio" name="siteUrl" defaultValue={s.siteUrl} error={e.siteUrl} placeholder="https://www.sualoja.com.br" />
      </Card>

      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lift backdrop-blur">
        <SubmitButton pending={pending}>Salvar configurações</SubmitButton>
        <div className="min-w-0 flex-1">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}

function ColorField({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <span className="flex items-center gap-3 rounded-xl border-2 border-line bg-white p-1.5 pr-3">
        <input type="color" name={name} value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-14 cursor-pointer rounded-lg border-0 bg-transparent" />
        <code className="text-sm text-muted">{value}</code>
      </span>
    </label>
  );
}

export function PasswordForm() {
  const [state, onSubmit, pending] = useFormAction<AdminState>(changePasswordAction, {});
  const e = state.fieldErrors ?? {};
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-3">
      <Field label="Senha atual" name="current" type="password" autoComplete="current-password" required error={e.current} />
      <Field label="Nova senha" name="password" type="password" autoComplete="new-password" required error={e.password} hint="Mínimo 8, com letras e números." />
      <Field label="Repita a nova senha" name="confirm" type="password" autoComplete="new-password" required error={e.confirm} />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-3">
        <SubmitButton pending={pending}>Trocar senha</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
