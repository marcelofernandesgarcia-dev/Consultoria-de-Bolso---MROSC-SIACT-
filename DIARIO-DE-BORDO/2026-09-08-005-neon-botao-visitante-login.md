---
id: 2026-09-08-005
data: 2026-09-08
titulo: "Efeito neon no botão 'Entrar como visitante' da tela de login"
tipo: codificacao
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Após confirmar que a correção do redirecionamento (entrada
[2026-09-08-004](2026-09-08-004-fix-redirect-landing-em-vez-de-login.md))
funcionou e o diretor conseguiu acessar a tela de login corretamente, o
usuário pediu um destaque visual no botão "Entrar como visitante
(demonstração)" pra chamar mais atenção — é o caminho de acesso mais
rápido pra quem recebe o link sem cadastro prévio.

## O que foi feito

`Login.tsx`: reaproveitado o mesmo efeito neon já usado no botão do
Assistente flutuante (`AssistenteFlutuante.tsx`, `@keyframes neon-glow`)
— um `box-shadow` pulsante em tons de indigo/roxo/ciano, aplicado via
`@keyframes demo-neon-glow` (nome próprio, evita colisão com o keyframe
homônimo de outro componente) e `animation` inline no botão. Borda do
botão também ficou mais visível (de `rgba(99,102,241,0.25)` pra
`rgba(129,140,248,0.45)`) pra combinar com o brilho. Efeito desativado
enquanto `demoLoading` está true, pra não pulsar durante o carregamento.

## Decisões tomadas

- Reaproveitado o padrão visual já estabelecido no app (mesmo keyframe de
  cores do Assistente flutuante) em vez de criar um efeito novo — mantém
  consistência visual entre os dois únicos elementos "neon" do sistema.

## Arquivos afetados

- `src/pages/Login.tsx` — `@keyframes demo-neon-glow` e `animation` no
  botão "Entrar como visitante (demonstração)"

## Pendências / próximos passos

- Verificação pré-commit rodada (skill `verificacao-pre-commit`):
  type-check OK, console limpo (só ruído conhecido de HMR do Vite),
  confirmado visualmente o brilho ao redor do botão.
- Requer novo deploy pra chegar à URL pública.
