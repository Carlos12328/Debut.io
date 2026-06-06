import { EntityId } from './usuario';

export interface Fornecedor {
  id_fornecedor: EntityId;
  id_evento: EntityId;
  nome: string;
  tipo_servico: string;
  valor: number;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}
