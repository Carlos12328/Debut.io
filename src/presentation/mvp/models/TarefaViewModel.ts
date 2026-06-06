export interface TarefaViewModel {
  id: number;
  idEvento: number;
  descricao: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  statusLabel: string;
  prioridade: 'alta' | 'media' | 'baixa';
  prioridadeLabel: string;
  prazo?: string;
  prazoFormatado?: string;
  responsavel?: string;
  atrasada: boolean;
}
