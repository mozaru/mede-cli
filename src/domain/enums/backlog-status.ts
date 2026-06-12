export enum BacklogStatus {
  CONCLUIDO = "Concluído",
  PENDENTE = "Pendente",
  EM_ANDAMENTO = "Em andamento",
  AGUARDANDO = "Aguardando",
  AGUARDANDO_FORMALIZACAO = "Aguardando formalização",
  CANCELADO = "Cancelado",
}

export function normalizeStatus(status: string): string {
  return (status ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase()
    .trim();
}

export function isKnownStatus(status: string): boolean {
  const norm = normalizeStatus(status);
  return [
    "CONCLUIDO",
    "PENDENTE",
    "EM ANDAMENTO",
    "AGUARDANDO",
    "AGUARDANDO FORMALIZACAO",
    "CANCELADO",
  ].includes(norm);
}
