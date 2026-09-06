---
id: 2026-09-06-007
data: 2026-09-06
titulo: "Marco — validação de ponta a ponta do ambiente de demonstração em produção"
tipo: marco
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Fecha o encadeamento de 6 correções desta sessão
([001](2026-09-06-001-fix-dockerfile-src-lib.md) a
[006](2026-09-06-006-chave-anthropic-revogada.md)), cada uma revelando o
problema seguinte: imagem Docker incompleta → variáveis de build ausentes →
login exigindo convite → CSP bloqueando Supabase → chaves do Supabase
desatualizadas → chave da Anthropic revogada. Nenhuma delas isolada
explicava o sintoma original ("Falha ao analisar este edital"); eram cinco
causas independentes empilhadas.

## O que foi feito

Teste manual de ponta a ponta na URL pública
(`https://siact-mrosc-927353480907.southamerica-east1.run.app`), sem
qualquer sessão ou cadastro pré-existente:

1. Acesso à landing page e à tela de login — sem erros de console
2. Clique em "Entrar como visitante (demonstração)" — sessão anônima do
   Supabase criada com sucesso
3. Seleção de perfil "Organização da Sociedade Civil (OSC)"
4. Navegação até "Chamamentos Abertos"
5. Clique em "Explicar Edital" num edital real da lista (129 editais
   carregados do Mapa das OSC/IPEA) — a IA retornou resumo, prazos e
   checklist de documentos corretamente

Confirmado visualmente que a faixa "AMBIENTE DE DEMONSTRAÇÃO — protótipo em
construção e aprovação" aparece durante toda a navegação como visitante.

## Decisões tomadas

Nenhuma decisão de produto nesta entrada — é um registro de validação.

## Arquivos afetados

Nenhum.

## Pendências / próximos passos

- App pronto para a apresentação a interessados da Presidência da República
  e ao diretor responsável pela decisão de adoção em produção/escala.
- Quando a fase de aprovação terminar e o acesso por convite voltar a ser
  obrigatório, desativar "Anonymous Sign-Ins" no painel do Supabase
  (Authentication → Sign In / Providers) — não exige mudança de código.
- Aviso inofensivo nos logs do Cloud Run sobre `trust proxy` do
  `express-rate-limit` (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) — não bloqueia
  nada hoje, mas vale um ajuste futuro de `app.set('trust proxy', ...)` para
  o rate limiting por IP funcionar com precisão atrás do proxy do Cloud Run.
