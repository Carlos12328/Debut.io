export interface EventoViewModel {
  id: number;
  nome: string;
  dataEvento: string;
  dataEventoFormatada: string;
  orcamento: number;
  orcamentoFormatado: string;
  status: 'ativo' | 'encerrado';
  statusLabel: string;
}
