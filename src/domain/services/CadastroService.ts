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
    data_nascimento: string,
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
    data_nascimento: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ): Promise<Usuario> {
    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();
    const cpfTratado = cpf.replace(/\D/g, '').trim();
    const dataNascimentoTratada = data_nascimento.trim();

    if (!nomeTratado) {
      throw new Error('Informe seu nome completo.');
    }

    if (!emailTratado) {
      throw new Error('Informe seu e-mail.');
    }

    if (!this.emailValido(emailTratado)) {
      throw new Error('Informe um e-mail valido.');
    }

    if (typeof senha !== 'string' || !senha) {
      throw new Error('Informe uma senha.');
    }

    if (senha.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres.');
    }

    if (!perfil) {
      throw new Error('Selecione o perfil do usuario.');
    }

    if (!cpfTratado) {
      throw new Error('Informe seu CPF.');
    }

    if (cpfTratado.length !== 11) {
      throw new Error('O CPF deve conter 11 numeros.');
    }

    if (!dataNascimentoTratada) {
      throw new Error('Informe a data de nascimento.');
    }

    this.validarMaioridade(dataNascimentoTratada);

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
      data_nascimento: dataNascimentoTratada,
      endereco_logradouro,
      endereco_numero,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
    };

    return await this.usuarioRepository.create(novoUsuario);
  }

  private emailValido(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validarMaioridade(dataNascimento: string): void {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataNascimento)) {
      throw new Error('Data de nascimento invalida.');
    }

    const [anoStr, mesStr, diaStr] = dataNascimento.split('-');

    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10);
    const dia = parseInt(diaStr, 10);

    const nascimento = new Date(ano, mes - 1, dia);

    const dataExiste =
      nascimento.getFullYear() === ano &&
      nascimento.getMonth() === mes - 1 &&
      nascimento.getDate() === dia;

    if (!dataExiste) {
      throw new Error('Data de nascimento invalida.');
    }

    const hoje = new Date();

    if (nascimento > hoje) {
      throw new Error('Data de nascimento nao pode ser no futuro.');
    }

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();

    if (mesAtual < nascimento.getMonth() || (mesAtual === nascimento.getMonth() && diaAtual < nascimento.getDate())) {
      idade--;
    }

    if (idade < 18) {
      throw new Error('Voce deve ter pelo menos 18 anos para se cadastrar.');
    }

    if (idade > 100) {
      throw new Error('Data de nascimento invalida.');
    }
  }
}
