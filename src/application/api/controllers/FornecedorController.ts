import { FornecedorServiceImpl } from '../../../domain/services/FornecedorService';
import { Fornecedor } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorServiceImpl) {}

  async cadastrar(
    id_evento: number, nome: string, tipo_servico: string, valor: number,
    cnpj?: string, telefone?: string, email?: string,
    endereco_logradouro?: string, endereco_numero?: string, endereco_bairro?: string,
    endereco_cidade?: string, endereco_estado?: string, endereco_cep?: string,
  ): Promise<ResultadoOperacao<Fornecedor>> {
    try {
      const fornecedor = await this.fornecedorService.cadastrar(
        id_evento, nome, tipo_servico, valor,
        cnpj, telefone, email,
        endereco_logradouro, endereco_numero, endereco_bairro,
        endereco_cidade, endereco_estado, endereco_cep,
      );
      return { sucesso: true, dados: fornecedor };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }

  async listar(id_evento: number): Promise<ResultadoOperacao<Fornecedor[]>> {
    try {
      const fornecedores = await this.fornecedorService.listar(id_evento);
      return { sucesso: true, dados: fornecedores };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }

  async remover(id_fornecedor: number): Promise<ResultadoOperacao> {
    try {
      await this.fornecedorService.remover(id_fornecedor);
      return { sucesso: true };
    } catch (error: any) { return { sucesso: false, erro: error.message }; }
  }
}