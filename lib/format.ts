// Utilitarios de formatacao (Reais, datas) e parsing de preco.

type Numeric = number | string | { toString(): string };

function toNumber(value: Numeric): number {
  return typeof value === "number" ? value : Number(value.toString());
}

// Formata um valor como moeda brasileira: 1234.5 -> "R$ 1.234,50"
export function formatBRL(value: Numeric): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toNumber(value));
}

// Converte texto de preco digitado ("12,50" ou "12.50") para numero.
// Retorna null se nao for um numero valido.
export function parsePrice(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100) / 100;
}

// Unidades de medida aceitas para ingredientes.
export const UNITS = ["kg", "g", "l", "ml", "un"] as const;
export type Unit = (typeof UNITS)[number];

// Converte texto de quantidade ("1,5" ou "1.5") para numero (ate 3 casas).
export function parseQuantity(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 1000) / 1000;
}

// Formata uma quantidade no padrao pt-BR: 1.5 -> "1,5", 2 -> "2".
export function formatQty(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(n);
}

// Data/hora no fuso de Sao Paulo: "24/06/2026 14:30"
export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Apenas a data: "24/06/2026"
export function formatDateBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// --- Limites de periodo no fuso de Sao Paulo (UTC-3, sem horario de verao) ---
const SP_OFFSET_MS = 3 * 60 * 60 * 1000;

function nowInSP(): Date {
  return new Date(Date.now() - SP_OFFSET_MS);
}

// Inicio do dia de hoje (00:00 em SP), como instante UTC.
export function startOfTodaySP(): Date {
  const sp = nowInSP();
  return new Date(
    Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), sp.getUTCDate()) +
      SP_OFFSET_MS,
  );
}

// Inicio do mes atual (dia 1, 00:00 em SP), como instante UTC.
export function startOfMonthSP(): Date {
  const sp = nowInSP();
  return new Date(
    Date.UTC(sp.getUTCFullYear(), sp.getUTCMonth(), 1) + SP_OFFSET_MS,
  );
}
