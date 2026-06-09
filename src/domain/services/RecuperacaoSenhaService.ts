import { supabase } from '../../lib/supabase';

export class RecuperacaoSenhaServiceImpl {

  async verificarEmail(email: string): Promise<void> {
    if (!email) throw new Error('Email é obrigatório');

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw new Error(error.message);
  }

  async redefinirSenha(novaSenha: string): Promise<void> {
    if (!novaSenha) throw new Error('Senha inválida');

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) throw new Error(error.message);
  }
}