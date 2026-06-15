import {
  CategoriaTarefa,
  PrioridadeTarefa,
  StatusTarefa,
} from '../../../domain/models';

export interface TarefaViewModel {
  id: number;
  idEvento: number;
  descricao: string;

  categoria: CategoriaTarefa;
  categoriaLabel: string;

  status: StatusTarefa;
  statusLabel: string;

  prioridade: PrioridadeTarefa;
  prioridadeLabel: string;

  prazo: string;
  prazoFormatado: string;

  responsavel: string;

  atrasada: boolean;
  proximaDoPrazo: boolean;
}
