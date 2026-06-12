/**
 * Barrel export — ViewModels (models MVP) do Debut.io
 * Localização correta: src/presentation/mvp/models/index.ts
 *
 * ✅  import { FinanceiroViewModel } from '../../models'
 *     (a partir de src/presentation/mvp/presenters/)
 *
 * ✅  import { FinanceiroViewModel } from '../../../presentation/mvp/models'
 *     (a partir de qualquer outro lugar)
 */

export * from './LoginViewModel';
export * from './CadastroViewModel';
export * from './EventoViewModel';
export * from './FornecedorViewModel';
export * from './PagamentoViewModel';
export * from './FinanceiroViewModel';
export * from './TarefaViewModel';
export * from './AgendaViewModel';
export * from './DashboardViewModel';
