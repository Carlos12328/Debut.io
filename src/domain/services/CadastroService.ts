import { Usuario, PerfilUsuario } from '../models/usuario';
import { UsuarioRepository } from '../../persistence/repositories';
import * as bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';

bcrypt.setRandomFallback((length: number) => {
  const randomBytes = Crypto.getRandomBytes(length);
  return Array.from(randomBytes);
});

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
    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();
    const cpfTratado = cpf.trim();

    if (!nomeTratado || !emailTratado || !senha) {
      throw new Error('Nome, e-mail e senha sao obrigatorios.');
    }

    if (typeof senha !== 'string') {
      throw new Error('Senha invalida.');
    }

    if (!perfil) {
      throw new Error('O perfil e obrigatorio.');
    }

    if (!cpfTratado) {
      throw new Error('O CPF e obrigatorio.');
    }

    if (!emailTratado.includes('@')) {
      throw new Error('E-mail invalido.');
    }

    if (senha.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    const existente = await this.usuarioRepository.getByEmail(emailTratado);

    if (existente) {
      throw new Error('Ja existe uma conta com este e-mail.');
    }

    const salt = bcrypt.genSaltSync(10);
    const senha_hash = bcrypt.hashSync(senha, salt);

    const novoUsuario: Usuario = {
      id_usuario: 0,
      nome: nomeTratado,
      email: emailTratado,
      senha_hash,
      perfil,
      cpf: cpfTratado,
      data_nascimento,
      endereco_logradouro,
      endereco_numero,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
    };

    return await this.usuarioRepository.create(novoUsuario);
  }
}
