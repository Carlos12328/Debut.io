export interface UsuarioViewModel {
  id: number;
  nome: string;
  email: string;
  perfil: 'familiar' | 'cerimonialista';
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
}
