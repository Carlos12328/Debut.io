import { AuthServiceImpl } from '../../../domain/services/AuthService';
import { CadastroServiceImpl } from '../../../domain/services/CadastroService';
import { Usuario } from '../../../domain/models';
import { ResultadoOperacao } from './ResultadoOperacao';

export class UsuarioController {
  constructor(
    private readonly authService: AuthServiceImpl,
    private readonly cadastroService: CadastroServiceImpl,
  ) {}

  async login(email: string, senha: string): Promise<ResultadoOperacao<Usuario>> {
    try {
      const usuario = await this.authService.login(email, senha);
      return { sucesso: true, dados: usuario };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async cadastrar(
    nome: string, email: string, senha: string,
    perfil: 'familiar' | 'cerimonialista', cpf: string,
    data_nascimento?: string, endereco_logradouro?: string,
    endereco_numero?: string, endereco_bairro?: string,
    endereco_cidade?: string, endereco_estado?: string, endereco_cep?: string,
  ): Promise<ResultadoOperacao<Usuario>> {
    try {
      const usuario = await this.cadastroService.cadastrar(
        nome, email, senha, perfil, cpf,
        data_nascimento, endereco_logradouro, endereco_numero,
        endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
      );
      return { sucesso: true, dados: usuario };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }

  async logout(): Promise<ResultadoOperacao> {
    try {
      await this.authService.logout();
      return { sucesso: true };
    } catch (error: any) {
      return { sucesso: false, erro: error.message };
    }
  }
}