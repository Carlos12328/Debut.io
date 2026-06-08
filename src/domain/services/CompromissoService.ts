import { Compromisso } from '../models/compromisso';
import { CompromissoRepository } from '../../persistence/repositories';

export interface CompromissoService {
  cadastrar(
    id_evento: number,
    descricao: string,
    data_compromisso: string,
  ): Promise<Compromisso>;

  listar(id_evento: number): Promise<Compromisso[]>;

  remover(id_compromisso: number): Promise<void>;
}

export class CompromissoServiceImpl implements CompromissoService {
  constructor(
    private readonly compromissoRepository: CompromissoRepository,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    data_compromisso: string,
  ): Promise<Compromisso> {
    if (!descricao) {
      throw new Error('A descricao e obrigatoria.');
    }

    if (!data_compromisso) {
      throw new Error('A data do compromisso e obrigatoria.');
    }

    return await this.compromissoRepository.create({
      id_compromisso: 0,
      id_evento,
      descricao,
      data_compromisso,
    });
  }

  async listar(id_evento: number): Promise<Compromisso[]> {
    return await this.compromissoRepository.getByEvento(id_evento);
  }

  async remover(id_compromisso: number): Promise<void> {
    return await this.compromissoRepository.remove(id_compromisso);
  }
}
