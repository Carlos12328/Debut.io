import { Usuario, PerfilUsuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';

export interface CadastroService {
  cadastrar(
    nome: string,
    email: string,
    senha: string,
    perfil: PerfilUsuario,
    cpf: string,
    data_nascimento?: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ): Promise<Usuario>;
}

export class CadastroServiceImpl implements CadastroService {
  constructor(private readonly usuarioRepository: UsuarioRepository) {}

  async cadastrar(
    nome: string,
    email: string,
    senha: string,
    perfil: PerfilUsuario,
    cpf: string,
    data_nascimento?: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ): Promise<Usuario> {
    if (!nome || !email || !senha) throw new Error('Todos os campos sao obrigatorios.');
    if (!cpf) throw new Error('O CPF e obrigatorio.');
    if (!email.includes('@')) throw new Error('E-mail invalido.');
    if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    const existente = await this.usuarioRepository.getByEmail(email);
    if (existente) throw new Error('Ja existe uma conta com este e-mail.');
    const novoUsuario: Usuario = {
      id_usuario: 0, nome, email, senha_hash: senha, perfil, cpf,
      data_nascimento, endereco_logradouro, endereco_numero,
      endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
    };
    return await this.usuarioRepository.create(novoUsuario);
  }
}
