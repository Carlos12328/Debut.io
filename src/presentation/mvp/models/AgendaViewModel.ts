/**
 * AgendaViewModel (Compromissos) — Debut.io
 * Localização correta: src/presentation/mvp/models/
 * UC11–UC12
 */

export interface CompromissoViewModel {
  id: number;
  descricao: string;
  dataFormatada: string;       // "30/06/2026"
  dataCompromissoISO: string;
  diasParaCompromisso: number;
  proximidadeLabel: string;    // "Em 5 dias" | "Hoje!" | "Passou há 2 dias"
  proximidadeCor: string;
  alertaConfigurado: boolean;
  isHoje: boolean;
  isProximo: boolean;          // próximos 7 dias
  isPassado: boolean;
}
