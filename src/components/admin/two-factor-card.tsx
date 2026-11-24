import { ShieldCheck, Smartphone } from "lucide-react";
import QRCode from "qrcode";
import { cancelTwoFactorAction, startTwoFactorAction } from "@/app/admin/actions/two-factor";
import { otpauthUri } from "@/lib/server/totp";
import { pendingSecret, twoFactorStatus } from "@/lib/server/two-factor";
import { ConfirmTwoFactorForm, DisableTwoFactorForm } from "./two-factor-forms";
import { Card } from "./ui";

const DESCRIPTION =
  "Além da senha, o login do painel pede um código que muda a cada 30 segundos no seu celular. Mesmo que alguém descubra a sua senha, não entra sem o celular.";

/** Configurações > Verificação em duas etapas (do administrador logado). */
export async function TwoFactorCard({ userId, email, storeName }: { userId: string; email: string; storeName: string }) {
  const status = twoFactorStatus(userId);

  if (status.enabled) {
    return (
      <Card title="Verificação em duas etapas" description={DESCRIPTION} className="mt-8">
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-emerald-800">
          <ShieldCheck className="size-5 shrink-0" /> Ativada. Códigos de recuperação restantes: {status.recoveryLeft} de 8.
        </p>
        {status.recoveryLeft <= 2 && <p className="mt-2 text-sm text-amber-800">Restam poucos códigos de recuperação. Desative e ative de novo para gerar códigos novos.</p>}
        <DisableTwoFactorForm />
      </Card>
    );
  }

  const secret = status.pendingSetup ? pendingSecret(userId) : null;
  if (secret) {
    const qr = await QRCode.toString(otpauthUri(secret, email, storeName), {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#1f2a22", light: "#ffffff" },
    });
    return (
      <Card title="Ativar verificação em duas etapas" description={DESCRIPTION} className="mt-8">
        <div className="mt-4 grid gap-5 md:grid-cols-[200px_1fr]">
          <div
            className="size-48 justify-self-center rounded-2xl border-2 border-line p-2 [&>svg]:size-full"
            role="img"
            aria-label="QR Code para o aplicativo autenticador"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <ol className="space-y-3 text-sm">
            <li>
              <b>1.</b> Instale no celular um aplicativo autenticador gratuito: <b>Google Authenticator</b>, <b>Microsoft Authenticator</b> ou <b>Authy</b>.
            </li>
            <li>
              <b>2.</b> No aplicativo, toque em <b>+</b> e escaneie o QR Code. Sem câmera? Digite a chave:
              <code className="mt-1 block rounded-lg bg-cream px-3 py-2 font-mono text-xs break-all select-all">{secret.match(/.{1,4}/g)?.join(" ")}</code>
            </li>
            <li>
              <b>3.</b> Digite abaixo o código que aparecer no aplicativo.
            </li>
          </ol>
        </div>
        <div className="mt-4">
          <ConfirmTwoFactorForm cancelAction={cancelTwoFactorAction} />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Verificação em duas etapas" description={DESCRIPTION} className="mt-8">
      <form action={startTwoFactorAction} className="mt-4">
        <button type="submit" className="btn btn-petrol h-11 px-5 text-sm">
          <Smartphone className="size-4" /> Ativar verificação em duas etapas
        </button>
      </form>
    </Card>
  );
}
