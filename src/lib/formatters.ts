/**
 * formatters.ts — Debut.io
 * Localização: src/lib/formatters.ts
 *
 * Funções puras de formatação e transformação.
 * REGRA: apenas Presenters importam deste arquivo. Nunca Views.
 */

// ── Moeda ─────────────────────────────────────────────────────
/** @example formatarMoeda(1500) → "R$ 1.500,00" */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ── Datas ─────────────────────────────────────────────────────
/** @example formatarData("2026-07-15") → "15/07/2026" */
export function formatarData(dataISO: string): string {
  if (!dataISO) return '—';
  const d = new Date(dataISO);
  const c = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return c.toLocaleDateString('pt-BR');
}

/** Dias até uma data. Positivo = futuro | 0 = hoje | Negativo = passou */
export function calcularDiasAte(dataISO: string): number {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataISO); data.setHours(0, 0, 0, 0);
  return Math.round((data.getTime() - hoje.getTime()) / 86400000);
}

/** Texto contextual baseado nos dias de diferença */
export function labelProximidade(
  dias: number,
  ctx: 'vencimento' | 'prazo' | 'festa' | 'compromisso',
): string {
  if (dias === 0) {
    if (ctx === 'festa') return 'A festa é hoje! 🎊';
    if (ctx === 'vencimento') return 'Vence hoje!';
    if (ctx === 'prazo') return 'Prazo hoje!';
    return 'Hoje!';
  }
  const abs = Math.abs(dias); const pl = abs > 1 ? 's' : '';
  if (dias > 0) {
    if (ctx === 'festa') return `Faltam ${dias} dia${pl}! 🎉`;
    if (ctx === 'vencimento') return `Vence em ${dias} dia${pl}`;
    if (ctx === 'prazo') return `Prazo em ${dias} dia${pl}`;
    return `Em ${dias} dia${pl}`;
  }
  if (ctx === 'vencimento') return `Atrasado há ${abs} dia${pl}`;
  if (ctx === 'prazo') return `Atrasada há ${abs} dia${pl}`;
  if (ctx === 'festa') return `Aconteceu há ${abs} dia${pl}`;
  return `Passou há ${abs} dia${pl}`;
}

// ── Percentual ────────────────────────────────────────────────
export function calcularPercentual(valor: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((valor / total) * 10000) / 100;
}

// ── Cores semânticas ──────────────────────────────────────────
export function corStatusPagamento(status: string): string {
  const m: Record<string, string> = {
    pago:     '#2ecc71',
    pendente: '#f39c12',
    atrasado: '#e74c3c',
  };
  return m[status] ?? '#95a5a6';
}

export function corStatusTarefa(status: string): string {
  const m: Record<string, string> = {
    pendente:     '#95a5a6',
    em_andamento: '#3498db',
    concluida:    '#2ecc71',
  };
  return m[status] ?? '#95a5a6';
}

export function corPrioridade(prioridade: string): string {
  const m: Record<string, string> = {
    baixa:   '#27ae60',
    media:   '#f39c12',
    alta:    '#e67e22',
    urgente: '#e74c3c',
  };
  return m[prioridade] ?? '#95a5a6';
}

// ── Labels legíveis ───────────────────────────────────────────
export function labelStatusPagamento(raw: string): string {
  const m: Record<string, string> = {
    pago: 'Pago', pendente: 'Pendente', atrasado: 'Atrasado',
  };
  return m[raw] ?? raw;
}

export function labelStatusTarefa(raw: string): string {
  const m: Record<string, string> = {
    pendente: 'Pendente', em_andamento: 'Em andamento', concluida: 'Concluída',
  };
  return m[raw] ?? raw;
}

export function labelPrioridade(raw: string): string {
  const m: Record<string, string> = {
    baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente',
  };
  return m[raw] ?? raw;
}

// ── Texto ─────────────────────────────────────────────────────
export function obterIniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return p.length === 1
    ? p[0].substring(0, 2).toUpperCase()
    : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
