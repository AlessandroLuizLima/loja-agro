import { User } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server/users";

export async function AccountLink() {
  const user = await getCurrentUser();
  return (
    <Link href={user ? "/conta" : "/conta/entrar"} className="icon-btn gap-2 lg:w-auto lg:px-2.5" aria-label={user ? `Minha conta (${user.firstName})` : "Entrar ou criar conta"}>
      <User className="size-6" />
      <span className="hidden text-left text-xs leading-tight text-petrol lg:block">
        {user ? `Olá, ${user.firstName}` : "Olá, visitante"}
        <b className="block">{user ? "Minha conta" : "Entrar / Cadastrar"}</b>
      </span>
    </Link>
  );
}

export async function DrawerAccountLink() {
  const user = await getCurrentUser();
  return (
    <Link href={user ? "/conta" : "/conta/entrar"} className="btn btn-petrol mb-3 h-12 w-full">
      <User className="size-5" /> {user ? `Olá, ${user.firstName} · Minha conta` : "Entrar / Cadastrar"}
    </Link>
  );
}
