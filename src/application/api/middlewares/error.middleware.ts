/**
 * error.middleware.ts — Debut.io
 * src/application/api/middlewares/error.middleware.ts
 *
 * Captura erros não tratados e retorna resposta padronizada.
 * RNF09 — Manutenibilidade: tratamento centralizado de erros.
 */
import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('[DEBUT.IO ERROR]', err.message, err.stack);
  res.status(500).json({
    erro: 'Erro interno do servidor.',
    detalhe: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
