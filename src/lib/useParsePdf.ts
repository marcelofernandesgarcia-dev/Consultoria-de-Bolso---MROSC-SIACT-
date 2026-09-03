import { useState } from 'react';

interface UseParsePdfOptions {
  /** Limite de caracteres do texto extraído — cada tela usa seu próprio teto. */
  maxChars?: number;
  /** Chamado com uma mensagem amigável quando a extração falha. */
  onError?: (message: string) => void;
}

/**
 * Encapsula o padrão repetido de enviar um PDF pro backend (/api/parse-pdf) e extrair
 * o texto — usado em várias telas que antes reimplementavam o mesmo FormData+fetch.
 */
export function useParsePdf({ maxChars = 80000, onError }: UseParsePdfOptions = {}) {
  const [loading, setLoading] = useState(false);

  const parsePdf = async (file: File): Promise<string | null> => {
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Erro ao processar o PDF.');
      }
      const data = await res.json();
      return (data.text || '').slice(0, maxChars);
    } catch (err: any) {
      onError?.(err.message || 'Erro ao extrair texto do PDF.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { parsePdf, loading };
}
