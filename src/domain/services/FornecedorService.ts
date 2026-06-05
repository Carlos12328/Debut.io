import { Fornecedor } from '../models/fornecedor';
import { FornecedorRepository } from '../../persistence/repositories';

export interface FornecedorService {
  cadastrar(
    id_evento: number, nome: string, tipo_servico: string, valor: number,
    cnpj?: string, telefone?: string, email?: string,
    endereco_logradouro?: string, endereco_numero?: string, endereco_bairro?: string,
    endereco_cidade?: string, endereco_estado?: string, endereco_cep?: string,
  ): Promise<Fornecedor>;
  listar(id_evento: number): Promise<Fornecedor[]>;
  remover(id_fornecedor: number): Promise<void>;
}

export class FornecedorServiceImpl implements FornecedorService {
  constructor(private readonly fornecedorRepository: FornecedorRepository) {}

  async cadastrar(
    id_evento: number, nome: string, tipo_servico: string, valor: number,
    cnpj?: string, telefone?: string, email?: string,
    endereco_logradouro?: string, endereco_numero?: string, endereco_bairro?: string,
    endereco_cidade?: string, endereco_estado?: string, endereco_cep?: string,
  ): Promise<Fornecedor> {
    if (!nome) throw new Error('O nome do fornecedor e obrigatorio.');
    if (!tipo_servico) throw new Error('O tipo de servico e obrigatorio.');
    if (valor <= 0) throw new Error('O valor deve ser maior que zero.');
    return await this.fornecedorRepository.create({
      id_fornecedor: 0, id_evento, nome, tipo_servico, valor,
      cnpj, telefone, email, endereco_logradouro, endereco_numero,
      endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
    });
  }

  async listar(id_evento: number): Promise<Fornecedor[]> {
    return await this.fornecedorRepository.getByEvento(id_evento);
  }

  async remover(id_fornecedor: number): Promise<void> {
    return await this.fornecedorRepository.remove(id_fornecedor);
  }
}
