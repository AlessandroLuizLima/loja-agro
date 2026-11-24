import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/users";

/** Quem já está logado não precisa ver as telas de login/cadastro. */
export async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect("/conta");
  return null;
}
