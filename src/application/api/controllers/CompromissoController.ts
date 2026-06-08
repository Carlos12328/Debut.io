import { CompromissoServiceImpl } from '../../../domain/services/CompromissoService';

export class CompromissoController {
  constructor(
    private readonly compromissoService: CompromissoServiceImpl,
  ) {}

  async cadastrar(
    id_evento: number,
    descricao: string,
    data_compromisso: string,
  ) {
    try {
      const compromisso =
        await this.compromissoService.cadastrar(
          id_evento,
          descricao,
          data_compromisso,
        );

      return {
        sucesso: true,
        dados: compromisso,
      };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  }

  async listar(id_evento: number) {
    try {
      const compromissos =
        await this.compromissoService.listar(id_evento);

      return {
        sucesso: true,
        dados: compromissos,
      };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  }

  async remover(id_compromisso: number) {
    try {
      await this.compromissoService.remover(
        id_compromisso,
      );

      return { sucesso: true };
    } catch (error: any) {
      return {
        sucesso: false,
        erro: error.message,
      };
    }
  }
}
