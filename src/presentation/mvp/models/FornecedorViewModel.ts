/**
 * FornecedorViewModel — Debut.io
 * Localização correta: src/presentation/mvp/models/
 * UC05 — Cadastrar fornecedor
 * RN-001: bloquear exclusão se houver pagamentos vinculados
 */

export interface FornecedorViewModel {
  id: number;
  nome: string;
  tipoServico: string;
  contatoFormatado: string;   // telefone formatado
  valorContratadoFormatado: string; // "R$ 5.000,00"
  statusLabel: string;
  statusCor: string;
  podeExcluir: boolean;
  motivoBloqueioExclusao: string | null;
}
