"use server";

import { refresh } from "next/cache";
import { audit } from "@/lib/server/audit";
import { verifyPassword } from "@/lib/server/password";
import { cancelSetup, confirmSetup, disable, startSetup, verifyLoginCode } from "@/lib/server/two-factor";
import { findUserById, requireAdmin } from "@/lib/server/users";

export type TwoFactorState = { error?: string; codes?: string[] };

export async function startTwoFactorAction() {
  const admin = await requireAdmin();
  startSetup(admin.id);
  refresh();
}

export async function cancelTwoFactorAction() {
  const admin = await requireAdmin();
  cancelSetup(admin.id);
  refresh();
}

/** Confirma a ativação com o primeiro código do aplicativo. Devolve os códigos de recuperação. */
export async function confirmTwoFactorAction(_prev: TwoFactorState, fd: FormData): Promise<TwoFactorState> {
  const admin = await requireAdmin();
  const codes = confirmSetup(admin.id, String(fd.get("code") ?? ""));
  if (!codes) return { error: "Código incorreto. Confira se o relógio do celular está certo e digite o código que aparece agora." };
  await audit(admin.email, "2fa_ativada");
  return { codes };
}

/** Desligar exige a senha e um código (do aplicativo ou de recuperação): quem pegar o computador aberto não consegue. */
export async function disableTwoFactorAction(_prev: TwoFactorState, fd: FormData): Promise<TwoFactorState> {
  const admin = await requireAdmin();
  const row = findUserById(admin.id);
  if (!row || !(await verifyPassword(String(fd.get("password") ?? ""), row.password_hash))) return { error: "Senha incorreta." };
  if (!verifyLoginCode(admin.id, String(fd.get("code") ?? "").slice(0, 20))) return { error: "Código incorreto." };
  disable(admin.id);
  await audit(admin.email, "2fa_desativada");
  refresh();
  return {};
}
