import { z } from "zod";

/** Senha de cliente: 8+ caracteres com letras e números. */
export const customerPassword = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72)
  .regex(/[A-Za-z]/, "Use letras e números.")
  .regex(/\d/, "Use letras e números.");

/** Senha do painel: mais forte, porque dá acesso aos dados de todos os clientes. */
export const adminPassword = z
  .string()
  .min(10, "Use pelo menos 10 caracteres.")
  .max(72)
  .regex(/[a-z]/, "Use letras minúsculas, maiúsculas e números.")
  .regex(/[A-Z]/, "Use letras minúsculas, maiúsculas e números.")
  .regex(/\d/, "Use letras minúsculas, maiúsculas e números.");
