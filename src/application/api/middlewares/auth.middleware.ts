/**
 * auth.middleware.ts — Debut.io
 * src/application/api/middlewares/auth.middleware.ts
 *
 * Verifica JWT em todas as rotas protegidas.
 * RNF03 — Segurança: autenticação JWT com controle de perfis.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'debut_secret_dev';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; perfil: string };
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}
