import {
  Tarefa,
  StatusTarefa,
  PrioridadeTarefa,
  CategoriaTarefa,
} from '../models/tarefa';
import { TarefaRepository } from '../../persistence/repositories';

export interface AtualizarTarefaInput {
  descricao?: string;
  categoria?: CategoriaTarefa;
  prioridade?: PrioridadeTarefa;
  prazo?: string;
  responsavel?: string;
  status?: StatusTarefa;
}

export interface TarefaService {
  cadastrar(
    id_evento: number,
    descricao: string,
    categoria: CategoriaTarefa,
    prioridade: PrioridadeTarefa,
    prazo: string,
    responsavel: string,
  ): Promise<Tarefa>;

  listar(id_evento: number): Promise<Tarefa[]>;

  editar(
    id_tarefa: number,
    dados: AtualizarTarefaInput,
  ): Promise<Tarefa>;

  atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ): Promise<Tarefa>;

  remover(id_tarefa: number): Promise<void>;
}

const STATUS_VALIDOS: StatusTarefa[] = [
  'pendente',
  'em_andamento',
  'concluida',
];

const PRIORIDADES_VALIDAS: PrioridadeTarefa[] = [
  'alta',
  'media',
  'baixa',
];

const CATEGORIAS_VALIDAS: CategoriaTarefa[] = [
  'buffet',
  'decoracao',
  'vestuario',
  'fotografia',
  'musica',
  'local',
  'convites',
  'outros',
];

export class TarefaServiceImpl implements TarefaService {
  constructor(
    private readonly tarefaRepository: TarefaRepository,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    categoria: CategoriaTarefa,
    prioridade: PrioridadeTarefa,
    prazo: string,
    responsavel: string,
  ): Promise<Tarefa> {
    this.validarIdEvento(id_evento);
    this.validarDescricao(descricao);
    this.validarCategoria(categoria);
    this.validarPrioridade(prioridade);
    this.validarPrazo(prazo);
    this.validarResponsavel(responsavel);

    return await this.tarefaRepository.create({
      id_tarefa: 0,
      id_evento,
      descricao: descricao.trim(),
      categoria,
      status: 'pendente',
      prioridade,
      prazo,
      responsavel: responsavel.trim(),
    });
  }

  async listar(id_evento: number): Promise<Tarefa[]> {
    this.validarIdEvento(id_evento);

    return await this.tarefaRepository.getByEvento(id_evento);
  }

  async editar(
    id_tarefa: number,
    dados: AtualizarTarefaInput,
  ): Promise<Tarefa> {
    this.validarIdTarefa(id_tarefa);

    const dadosAtualizados: AtualizarTarefaInput = {};

    if (dados.descricao !== undefined) {
      this.validarDescricao(dados.descricao);
      dadosAtualizados.descricao = dados.descricao.trim();
    }

    if (dados.categoria !== undefined) {
      this.validarCategoria(dados.categoria);
      dadosAtualizados.categoria = dados.categoria;
    }

    if (dados.prioridade !== undefined) {
      this.validarPrioridade(dados.prioridade);
      dadosAtualizados.prioridade = dados.prioridade;
    }

    if (dados.prazo !== undefined) {
      this.validarPrazo(dados.prazo);
      dadosAtualizados.prazo = dados.prazo;
    }

    if (dados.responsavel !== undefined) {
      this.validarResponsavel(dados.responsavel);
      dadosAtualizados.responsavel = dados.responsavel.trim();
    }

    if (dados.status !== undefined) {
      this.validarStatus(dados.status);
      dadosAtualizados.status = dados.status;
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      throw new Error('Nenhum dado foi informado para atualizar a tarefa.');
    }

    return await this.tarefaRepository.update(
      id_tarefa,
      dadosAtualizados,
    );
  }

  async atualizarStatus(
    id_tarefa: number,
    status: StatusTarefa,
  ): Promise<Tarefa> {
    this.validarIdTarefa(id_tarefa);
    this.validarStatus(status);

    return await this.tarefaRepository.update(
      id_tarefa,
      { status },
    );
  }

  async remover(id_tarefa: number): Promise<void> {
    this.validarIdTarefa(id_tarefa);

    await this.tarefaRepository.remove(id_tarefa);
  }

  private validarIdEvento(id_evento: number) {
    if (!Number.isFinite(id_evento) || id_evento <= 0) {
      throw new Error('Evento inválido para vincular a tarefa.');
    }
  }

  private validarIdTarefa(id_tarefa: number) {
    if (!Number.isFinite(id_tarefa) || id_tarefa <= 0) {
      throw new Error('Tarefa inválida.');
    }
  }

  private validarDescricao(descricao: string) {
    if (!descricao || descricao.trim().length < 3) {
      throw new Error('A descrição da tarefa deve ter pelo menos 3 caracteres.');
    }
  }

  private validarCategoria(categoria: CategoriaTarefa) {
    if (!categoria || !CATEGORIAS_VALIDAS.includes(categoria)) {
      throw new Error('Selecione uma categoria válida para a tarefa.');
    }
  }

  private validarPrioridade(prioridade: PrioridadeTarefa) {
    if (!prioridade || !PRIORIDADES_VALIDAS.includes(prioridade)) {
      throw new Error('Selecione uma prioridade válida para a tarefa.');
    }
  }

  private validarPrazo(prazo: string) {
    if (!prazo) {
      throw new Error('O prazo da tarefa é obrigatório.');
    }

    const formatoValido = /^\d{4}-\d{2}-\d{2}$/.test(prazo);

    if (!formatoValido) {
      throw new Error('O prazo da tarefa deve estar no formato AAAA-MM-DD.');
    }

    const [ano, mes, dia] = prazo.split('-').map(Number);
    const data = new Date(ano, mes - 1, dia);

    const dataValida =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;

    if (!dataValida) {
      throw new Error('Informe um prazo válido para a tarefa.');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);

    if (data < hoje) {
      throw new Error('O prazo da tarefa não pode ser anterior à data atual.');
    }
  }

  private validarResponsavel(responsavel: string) {
    if (!responsavel || responsavel.trim().length < 2) {
      throw new Error('Informe o responsável pela tarefa.');
    }
  }

  private validarStatus(status: StatusTarefa) {
    if (!status || !STATUS_VALIDOS.includes(status)) {
      throw new Error('Selecione um status válido para a tarefa.');
    }
  }
}



