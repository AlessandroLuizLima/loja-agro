/**
 * Pix "copia e cola" estático (BR Code, padrão do Banco Central).
 * Gerado a partir da chave Pix da loja, sem intermediador: o dinheiro cai direto
 * na conta do lojista, que confirma o recebimento no painel.
 */

const field = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;

/** Remove acentos e caracteres não aceitos pelos bancos. */
function clean(value: string, max: number) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 .-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido no campo 63. */
export function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function pixPayload(input: { key: string; name: string; city: string; amount?: number; txid?: string }) {
  const account = field("00", "br.gov.bcb.pix") + field("01", input.key.trim());
  const txid = (input.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const body =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    (input.amount && input.amount > 0 ? field("54", input.amount.toFixed(2)) : "") +
    field("58", "BR") +
    field("59", clean(input.name, 25) || "LOJA") +
    field("60", clean(input.city, 15) || "BRASIL") +
    field("62", field("05", txid)) +
    "6304";
  return body + crc16(body);
}
