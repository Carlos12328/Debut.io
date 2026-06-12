export type EntityId = number;

export type PerfilUsuario = 'familiar' | 'cerimonialista';

export interface Usuario {
  id_usuario: EntityId;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: PerfilUsuario;
  cpf: string;
  data_nascimento: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}
