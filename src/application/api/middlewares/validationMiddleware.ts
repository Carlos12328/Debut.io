export interface ResultadoValidacao {
  valido: boolean;
  erros: string[];
}

export function validarCamposObrigatorios(
  dados: Record<string, any>,
  camposObrigatorios: string[]
): ResultadoValidacao {
  const erros: string[] = [];
  for (const campo of camposObrigatorios) {
    if (dados[campo] === undefined || dados[campo] === null || dados[campo] === '') {
      erros.push(`Campo obrigatorio ausente: ${campo}`);
    }
  }
  return { valido: erros.length === 0, erros };
}

export function validarEmail(email: string): boolean {
  return typeof email === 'string' && email.includes('@') && email.includes('.');
}

export function validarData(data: string): boolean {
  if (!data) return false;
  const d = new Date(data);
  return !isNaN(d.getTime());
}

export function validarValorPositivo(valor: any): boolean {
  const num = parseFloat(valor);
  return !isNaN(num) && num > 0;
}
