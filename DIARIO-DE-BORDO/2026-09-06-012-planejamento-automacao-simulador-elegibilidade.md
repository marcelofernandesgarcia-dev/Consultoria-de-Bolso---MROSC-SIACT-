---
id: 2026-09-06-012
data: 2026-09-06
titulo: "Registra no Roadmap — plano de automação das 6 perguntas manuais do Simulador"
tipo: planejamento
autor: Marcelo Fernandes Garcia
vinculo: Servidor público — DTPAR/MGI
commits: []
---

## Contexto

Após corrigir o bug de mapeamento IPEA ([2026-09-06-011](2026-09-06-011-fix-mapeamento-ipea-situacao-sempre-inativa.md)),
usuário testou o Simulador de Elegibilidade ao vivo e notou que só 2 das 8
perguntas são pré-preenchidas automaticamente pela busca de CNPJ (por
desenho — ver `handleOscLoad` em `SimuladorElegibilidade.tsx`). Pediu
inicialmente selos "Em breve" nas 6 perguntas manuais restantes; ao
analisar a viabilidade real de automação de cada uma, ficou claro que nem
todas têm o mesmo grau de certeza de entrega — prometer prazo pra todas
seria arriscado. Decisão do usuário: **não mexer na tela agora** (evita
prometer algo que pode não sair a tempo) e registrar só como Roadmap, com
as ressalvas de viabilidade já documentadas.

## O que foi feito

Analisada a viabilidade de automação de cada uma das 6 perguntas manuais
(p3 a p8, exceto p1/p2 que já são automáticas):

| # | Pergunta | Viabilidade | Motivo |
|---|---|---|---|
| p3 | Estatuto compatível com o edital | Média | Reaproveitaria o motor de IA que já existe em "Pré-Análise da Proposta" (compara documento vs. edital) — mas depende do usuário anexar o estatuto e escolher o edital certo, não é 100% automático |
| p4 | CNDT válida | Alta | tst.jus.br tem consulta pública ao CNPJ, mesmo padrão de integração já usado com a Receita Federal |
| p5 | Certidões fiscais federais | Alta, com ressalva | receita.fazenda.gov.br tem consulta pública, mas pode exigir captcha — limitação técnica real que pode impedir automação total |
| p6 | Parentesco com autoridade do órgão concedente | Baixa | Exigiria saber o órgão concedente específico de cada chamamento e cruzar com o quadro de servidores dele — nenhuma base pública centraliza isso; depende de acesso ao Conecta.gov.br (Fase 3, ainda não iniciada) |
| p7 | Poder de supervisão do dirigente | Baixa | Mesma dependência da p6 |
| p8 | Capacidade técnica/operacional | Média | É julgamento qualitativo por natureza — nunca vira um "sim/não" de banco de dados, mas a IA pode dar uma avaliação assistida |

Registrado no Roadmap (`src/pages/Roadmap.tsx`):
- Fase 1 (Governança da IA): apoio de IA nas perguntas 3 e 8
- Fase 2 (Integrações Oficiais): automação das perguntas 4 e 5 (consultas
  públicas TST/Receita-PGFN); item separado para 6 e 7, explicitamente
  marcado como **sem prazo definido**, condicionado à integração com
  Conecta.gov.br

## Decisões tomadas

Não adicionar nenhum selo "Em breve" na tela do Simulador nesta rodada —
decisão explícita do usuário, ponderando o risco de prometer uma entrega
que pode não se concretizar (especialmente p6/p7, de viabilidade baixa) na
frente de quem for avaliar o protótipo. Manter o registro só no Roadmap,
que já é o canal certo pra comunicar planejamento futuro sem comprometer a
tela de uso.

## Arquivos afetados

- `src/pages/Roadmap.tsx` — 4 novas tarefas (1 na Fase 1, 3 na Fase 2)

## Pendências / próximos passos

Nenhuma ação de código pendente — item de planejamento puro, sem
implementação prevista para esta sessão.
