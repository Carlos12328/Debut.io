import { Compromisso } from '../models/compromisso';
import { CompromissoRepository } from '../../persistence/repositories';

export interface CompromissoService {
  cadastrar(
    id_evento: number,
    descricao: string,
    data_compromisso: string,
    horario?: string,
    observacoes?: string,
    alerta_configurado?: boolean,
  ): Promise<Compromisso>;

  atualizar(
    id_compromisso: number,
    descricao: string,
    data_compromisso: string,
    horario?: string,
    observacoes?: string,
    alerta_configurado?: boolean,
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
    horario?: string,
    observacoes?: string,
    alerta_configurado?: boolean,
  ): Promise<Compromisso> {
    const dados = this.validarDadosCompromisso(
      id_evento,
      descricao,
      data_compromisso,
      horario,
      observacoes,
      alerta_configurado,
    );

    return await this.compromissoRepository.create({
      id_compromisso: 0,
      ...dados,
    });
  }

  async atualizar(
    id_compromisso: number,
    descricao: string,
    data_compromisso: string,
    horario?: string,
    observacoes?: string,
    alerta_configurado?: boolean,
  ): Promise<Compromisso> {
    this.validarId(id_compromisso, 'Compromisso inválido.');

    const compromissoAtual =
      await this.compromissoRepository.getById(id_compromisso);

    if (!compromissoAtual) {
      throw new Error('Compromisso não encontrado.');
    }

    const dados = this.validarDadosCompromisso(
      compromissoAtual.id_evento,
      descricao,
      data_compromisso,
      horario,
      observacoes,
      alerta_configurado,
    );

    return await this.compromissoRepository.update(
      id_compromisso,
      dados,
    );
  }

  async listar(id_evento: number): Promise<Compromisso[]> {
    this.validarId(id_evento, 'Evento inválido.');

    return await this.compromissoRepository.getByEvento(id_evento);
  }

  async remover(id_compromisso: number): Promise<void> {
    this.validarId(id_compromisso, 'Compromisso inválido.');

    const compromisso =
      await this.compromissoRepository.getById(id_compromisso);

    if (!compromisso) {
      throw new Error('Compromisso não encontrado.');
    }

    return await this.compromissoRepository.remove(id_compromisso);
  }

  private validarDadosCompromisso(
    id_evento: number,
    descricao: string,
    data_compromisso: string,
    horario?: string,
    observacoes?: string,
    alerta_configurado?: boolean,
  ): Omit<Compromisso, 'id_compromisso'> {
    this.validarId(id_evento, 'Evento inválido.');

    const descricaoNormalizada = descricao?.trim();

    if (!descricaoNormalizada) {
      throw new Error('A descrição é obrigatória.');
    }

    if (descricaoNormalizada.length < 3) {
      throw new Error('A descrição deve ter pelo menos 3 caracteres.');
    }

    const dataNormalizada =
      this.validarDataCompromisso(data_compromisso);

    const horarioNormalizado =
      this.validarHorario(horario);

    const observacoesNormalizadas =
      observacoes?.trim() || null;

    return {
      id_evento,
      descricao: descricaoNormalizada,
      data_compromisso: dataNormalizada,
      horario: horarioNormalizado,
      observacoes: observacoesNormalizadas,
      alerta_configurado:
        typeof alerta_configurado === 'boolean'
          ? alerta_configurado
          : true,
    };
  }

  private validarId(id: number, mensagem: string) {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(mensagem);
    }
  }

  private validarDataCompromisso(data: string): string {
    const dataNormalizada = data?.trim();

    if (!dataNormalizada) {
      throw new Error('A data do compromisso é obrigatória.');
    }

    let ano: number;
    let mes: number;
    let dia: number;
    let dataParaBanco: string;

    const formatoBrasileiro = dataNormalizada.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const formatoBanco = dataNormalizada.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (formatoBrasileiro) {
      dia = Number(formatoBrasileiro[1]);
      mes = Number(formatoBrasileiro[2]);
      ano = Number(formatoBrasileiro[3]);
      dataParaBanco = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    } else if (formatoBanco) {
      ano = Number(formatoBanco[1]);
      mes = Number(formatoBanco[2]);
      dia = Number(formatoBanco[3]);
      dataParaBanco = dataNormalizada;
    } else {
      throw new Error('A data deve estar no formato DD/MM/AAAA.');
    }

    const dataCompromisso = new Date(ano, mes - 1, dia);

    const dataValida =
      dataCompromisso.getFullYear() === ano &&
      dataCompromisso.getMonth() === mes - 1 &&
      dataCompromisso.getDate() === dia;

    if (!dataValida) {
      throw new Error('A data do compromisso é inválida.');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataCompromisso.setHours(0, 0, 0, 0);

    if (dataCompromisso < hoje) {
      throw new Error('A data do compromisso não pode ser anterior à data atual.');
    }

    return dataParaBanco;
  }

  private validarHorario(horario?: string): string | null {
    const horarioNormalizado = horario?.trim();

    if (!horarioNormalizado) {
      return null;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horarioNormalizado)) {
      throw new Error('O horário deve estar no formato HH:MM.');
    }

    return horarioNormalizado;
  }
}
