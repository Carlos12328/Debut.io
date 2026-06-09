/**
 * EventoViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 * UC01–UC04
 */

export type StatusEventoLabel = 'Ativo' | 'Planejamento' | 'Encerrado';

export interface EventoViewModel {
  id: number;
  nome: string;
  dataFormatada: string;      // "25/10/2026"
  orcamentoFormatado: string; // "R$ 30.000,00"
  statusLabel: StatusEventoLabel;
  statusCor: string;
  diasParaFesta: number;
  diasParaFestaLabel: string; // "Faltam 142 dias! 🎉"
  percentualConclusaoTarefas: number;
  totalGastoFormatado: string;
  saldoRestanteFormatado: string;
  orcamentoExcedido: boolean;
}
