export interface ResultadoOperacao<T = void> {
  sucesso: boolean;
  dados?: T;
  erro?: string;
}