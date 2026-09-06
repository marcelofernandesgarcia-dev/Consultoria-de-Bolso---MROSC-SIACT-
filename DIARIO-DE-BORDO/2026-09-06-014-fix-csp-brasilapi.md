---
id: 2026-09-06-014
data: 2026-09-06
titulo: "Corrige CSP — brasilapi.com.br bloqueado, quebrava busca de CNPJ no Mapa OSC"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: [1270d30]
---

## Contexto

Testando mais um item da tabela de 10 OSCs de demonstração (APAE Nanuque/MG,
já validada como ATIVA no Simulador — ver [2026-09-06-011](2026-09-06-011-fix-mapeamento-ipea-situacao-sempre-inativa.md)),
o usuário testou o mesmo CNPJ na tela **Mapa OSC** (`MapaOSCHub.tsx`) e
recebeu "CNPJ não encontrado na Receita Federal" — resultado incoerente com
o que acabávamos de confirmar como correto minutos antes.

## O que foi feito

Investigação revelou que `MapaOSCHub.tsx` chama
`https://brasilapi.com.br/api/cnpj/v1/{cnpj}` **direto do navegador**
(consulta em tempo real à Receita Federal, via BrasilAPI — serviço público
de terceiros), em paralelo com a chamada `/api/osc/{cnpj}` pra base local do
IPEA. O CSP em produção (`server.ts`) só liberava `connect-src` pro Supabase
— exatamente a mesma classe de bug já corrigida antes
([2026-09-06-004](2026-09-06-004-fix-csp-connect-src-supabase.md)), só que
passou despercebida pra essa segunda chamada externa porque nunca tinha
sido exercitada de fato num teste anterior.

Confirmado via `javascript_tool` direto na URL publicada:
`fetch('https://brasilapi.com.br/...')` retornava `TypeError: Failed to
fetch`, com a violação de CSP visível no console
(`Connecting to 'https://brasilapi.com.br/...' violates ... "connect-src
'self' https://clsuturkoripoingjqpw.supabase.co"`). O código trata
qualquer falha nessa chamada (`Promise.allSettled`) como "CNPJ não
encontrado" — mensagem enganosa que mascarava o bloqueio de rede real.

Corrigido adicionando `https://brasilapi.com.br` ao `connectSrc`.
Verificado que só `MapaOSCHub.tsx` usa essa API de fato em produção —
`src/services/api/GovDataService.ts` também referencia a mesma URL, mas é
um arquivo órfão **não versionado no Git** (aparece como untracked,
provavelmente reaparecido por sincronização do OneDrive — pendência já
registrada em sessão anterior), então não afeta o build/deploy real.

## Decisões tomadas

Nenhuma alternativa considerada — mesma correção pontual e comprovada já
aplicada ao Supabase.

## Arquivos afetados

- `server.ts` — `connectSrc` no bloco `contentSecurityPolicy`

## Pendências / próximos passos

- Requer novo deploy pra chegar à URL pública (a correção só existe em
  `server.ts`, que só é exercitado em produção — `NODE_ENV=production`).
- Checagem feita nesta mesma entrada: buscado por todo `src/` qualquer
  outra chamada `fetch()` a domínio externo — só `GovDataService.ts`
  (arquivo órfão, não versionado) tem chamadas adicionais; nenhuma outra
  no código real do app. Não ficou pendência de outros casos iguais.
