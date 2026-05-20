import { Usuario, PerfilUsuario, Evento, Fornecedor } from '../models';
import { UsuarioRepository, EventoRepository, FornecedorRepository } from '../../persistence/repositories';

// ─── Auth ────────────────────────────────────────────────
export interface AuthService {
  login(email: string, senha: string): Promise<Usuario>;
}

export class AuthServiceImpl implements AuthService {
  constructor(private readonly usuarioRepository: UsuarioRepository) { }

  async login(email: string, senha: string): Promise<Usuario> {
    if (!email || !senha) throw new Error('E-mail e senha são obrigatórios.');
    const usuario = await this.usuarioRepository.getByEmail(email);
    if (!usuario) throw new Error('Usuário não encontrado.');
    if (usuario.senha_hash !== senha) throw new Error('Credenciais inválidas.');
    return usuario;
  }
}

// ─── Cadastro ────────────────────────────────────────────
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
  constructor(private readonly usuarioRepository: UsuarioRepository) { }

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
    if (!nome || !email || !senha) throw new Error('Todos os campos são obrigatórios.');
    if (!cpf) throw new Error('O CPF é obrigatório.');
    if (!email.includes('@')) throw new Error('E-mail inválido.');
    if (senha.length < 6) throw new Error('A senha deve ter pelo menos 6 caracteres.');
    const existente = await this.usuarioRepository.getByEmail(email);
    if (existente) throw new Error('Já existe uma conta com este e-mail.');

    const novoUsuario: Usuario = {
      id_usuario: 0,
      nome,
      email,
      senha_hash: senha,
      perfil,
      cpf,
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

// ─── Evento ──────────────────────────────────────────────
export interface EventoService {
  cadastrar(id_usuario: number, nome: string, data_evento: string, orcamento: number): Promise<Evento>;
  listar(id_usuario: number): Promise<Evento[]>;
  encerrar(id_evento: number): Promise<Evento>;
}

export class EventoServiceImpl implements EventoService {
  constructor(private readonly eventoRepository: EventoRepository) { }

  async cadastrar(id_usuario: number, nome: string, data_evento: string, orcamento: number): Promise<Evento> {
    if (!nome) throw new Error('O nome do evento é obrigatório.');
    if (!data_evento) throw new Error('A data do evento é obrigatória.');
    if (orcamento <= 0) throw new Error('O orçamento deve ser maior que zero.');

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataInformada = new Date(data_evento);
    if (dataInformada < hoje) {
      throw new Error('A data do evento não pode ser uma data passada.');
    }

    const novoEvento: Evento = { id_evento: 0, id_usuario, nome, data_evento, orcamento, status: 'ativo' };
    return await this.eventoRepository.create(novoEvento);
  }

  async listar(id_usuario: number): Promise<Evento[]> {
    return await this.eventoRepository.getByUsuario(id_usuario);
  }

  async encerrar(id_evento: number): Promise<Evento> {
    return await this.eventoRepository.update(id_evento, { status: 'encerrado' });
  }
}

// ─── Fornecedor ──────────────────────────────────────────
export interface FornecedorService {
  cadastrar(
    id_evento: number,
    nome: string,
    tipo_servico: string,
    valor: number,
    cnpj?: string,
    telefone?: string,
    email?: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ): Promise<Fornecedor>;
  listar(id_evento: number): Promise<Fornecedor[]>;
  remover(id_fornecedor: number): Promise<void>;
}

export class FornecedorServiceImpl implements FornecedorService {
  constructor(private readonly fornecedorRepository: FornecedorRepository) { }

  async cadastrar(
    id_evento: number,
    nome: string,
    tipo_servico: string,
    valor: number,
    cnpj?: string,
    telefone?: string,
    email?: string,
    endereco_logradouro?: string,
    endereco_numero?: string,
    endereco_bairro?: string,
    endereco_cidade?: string,
    endereco_estado?: string,
    endereco_cep?: string,
  ): Promise<Fornecedor> {
    if (!nome) throw new Error('O nome do fornecedor é obrigatório.');
    if (!tipo_servico) throw new Error('O tipo de serviço é obrigatório.');
    if (valor <= 0) throw new Error('O valor deve ser maior que zero.');

    const novo: Fornecedor = {
      id_fornecedor: 0,
      id_evento,
      nome,
      tipo_servico,
      valor,
      cnpj,
      telefone,
      email,
      endereco_logradouro,
      endereco_numero,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
    };
    return await this.fornecedorRepository.create(novo);
  }

  async listar(id_evento: number): Promise<Fornecedor[]> {
    return await this.fornecedorRepository.getByEvento(id_evento);
  }

  async remover(id_fornecedor: number): Promise<void> {
    return await this.fornecedorRepository.remove(id_fornecedor);
  }
}

