# Diário de Bordo — MROSC - Guia de Bolso (SIACT)

Registro de toda etapa relevante de planejamento e execução deste projeto —
análise de necessidades, design, codificação, testes e documentação.

**Por quê:** (1) rastreabilidade das decisões do sistema ao longo do tempo,
e (2) reunir, à medida que o projeto avança, as informações exigidas para
um futuro Registro de Programa de Computador no INPI (Lei nº 9.609/1998),
em especial autoria, vínculo de quem desenvolveu, e datas de criação —
informação cara de reconstruir depois do fato. Ver `FICHA-REGISTRO-INPI.md`.

**Regras:**
- Toda entrada nova segue `_TEMPLATE-ENTRADA.md`.
- Nunca reescrever uma entrada antiga — `FICHA-REGISTRO-INPI.md` é a única
  exceção editável.
- Nem todo commit pequeno precisa de entrada — todo **marco** combinado com
  o usuário, sim.

**Nota sobre o backfill (03/09/2026):** as entradas de 2026-03-17 a
2026-05-20 foram registradas retroativamente nesta data, uma por commit já
existente no histórico do Git, com base na mensagem de commit — não foram
escritas no momento original de cada entrega. As de 2026-09-03 (002 a 008)
também são backfill, mas escritas com mais detalhe por terem ocorrido na
mesma sessão em que o Diário de Bordo foi criado.

## Índice

| ID | Data | Título | Tipo |
|---|---|---|---|
| [2026-03-17-001](2026-03-17-001-initial-commit.md) | 2026-03-17 | Initial commit | codificação |
| [2026-03-17-002](2026-03-17-002-inicializacao-v2.md) | 2026-03-17 | Initialize SIACT-MROSC V2 project | codificação |
| [2026-03-17-003](2026-03-17-003-metadata-v3.md) | 2026-03-17 | Update application metadata to V3 | codificação |
| [2026-05-16-001](2026-05-16-001-redesign-v4.md) | 2026-05-16 | Redesign visual completo v4 + novas funcionalidades | codificação |
| [2026-05-16-002](2026-05-16-002-visual-backend-ai-pdf.md) | 2026-05-16 | Itens 1-7 — visual, backend AI e upload de PDF | codificação |
| [2026-05-16-003](2026-05-16-003-radar-editais-dashboard.md) | 2026-05-16 | Item 8 — Radar de Editais Abertos no Dashboard | codificação |
| [2026-05-16-004](2026-05-16-004-saas-arquitetura.md) | 2026-05-16 | SaaS architecture — auth, landing page e redesign do login | codificação |
| [2026-05-16-005](2026-05-16-005-notificacoes-capacitacao-calendario.md) | 2026-05-16 | Notificações no topbar, progresso de capacitação na sidebar e header do calendário | codificação |
| [2026-05-16-006](2026-05-16-006-sidebar-redesign-rail.md) | 2026-05-16 | Sidebar redesign — rail de ícones + flyout lateral por grupo | codificação |
| [2026-05-16-007](2026-05-16-007-sidebar-retratil-flyout.md) | 2026-05-16 | Sidebar retrátil — flyout fixável/recolhível com transição suave | codificação |
| [2026-05-16-008](2026-05-16-008-botao-retrair-rail.md) | 2026-05-16 | Botão retrair/expandir movido para o rail — sempre visível | codificação |
| [2026-05-16-009](2026-05-16-009-accordion-substitui-flyout.md) | 2026-05-16 | Accordion retrátil substitui flyout separado | codificação |
| [2026-05-16-010](2026-05-16-010-fix-cotacao-previa.md) | 2026-05-16 | Corrige 10 falhas no módulo de Cotação Prévia | codificação |
| [2026-05-16-011](2026-05-16-011-v4-gemini-supabase-darkmode.md) | 2026-05-16 | v4 — motor Gemini expandido, Supabase, dark mode e dossiê 360° OSC | codificação |
| [2026-05-16-012](2026-05-16-012-auth-supabase.md) | 2026-05-16 | Autenticação Supabase (Auth gate, Login, sidebar com logout) | codificação |
| [2026-05-16-013](2026-05-16-013-dashboard-dados-reais.md) | 2026-05-16 | Dashboard com dados reais via /api/dashboard | codificação |
| [2026-05-16-014](2026-05-16-014-landing-page-rotas.md) | 2026-05-16 | Landing page de conversão + reestruturação de rotas (SaaS) | codificação |
| [2026-05-16-015](2026-05-16-015-merge-v4-completo.md) | 2026-05-16 | Merge: integra branch remoto (v4 completo) com melhorias locais | codificação |
| [2026-05-16-016](2026-05-16-016-export-pdf-multitenant.md) | 2026-05-16 | Export PDF no GeradorParecer + multi-tenant Supabase por user_id | codificação |
| [2026-05-16-017](2026-05-16-017-deploy-railway.md) | 2026-05-16 | Deploy config Railway — health endpoint, static serving, multi-tenant auth | codificação |
| [2026-05-16-018](2026-05-16-018-migra-cloud-run.md) | 2026-05-16 | Migra deploy de Railway para Google Cloud Run | codificação |
| [2026-05-16-019](2026-05-16-019-paginas-planos-conta-admin.md) | 2026-05-16 | Páginas Planos, Conta e Admin com rotas /planos /conta /admin | codificação |
| [2026-05-16-020](2026-05-16-020-sidebar-links-admin-stats.md) | 2026-05-16 | Sidebar links para Planos/Conta/Admin + endpoint /api/admin/stats | codificação |
| [2026-05-17-001](2026-05-17-001-cloudbuild-fix.md) | 2026-05-17 | cloudbuild.yaml — project ID, secrets e env vars | codificação |
| [2026-05-17-002](2026-05-17-002-login-magic-link.md) | 2026-05-17 | Login magic link, Supabase agent skills, correções de ambiente | codificação |
| [2026-05-17-003](2026-05-17-003-integracao-mapa-osc-ipea.md) | 2026-05-17 | Integração Mapa OSC / IPEA — sync semanal automatizado | codificação |
| [2026-05-19-001](2026-05-19-001-csv-streaming-oom.md) | 2026-05-19 | CSV streaming para evitar OOM, correções de permissão e datas IPEA | codificação |
| [2026-05-20-001](2026-05-20-001-compatibilidade-node20-wsl.md) | 2026-05-20 | Corrige compatibilidade com Node.js 20 no WSL | codificação |
| [2026-09-03-001](2026-09-03-001-auditoria-5-pilares-siact-v6.md) | 2026-09-03 | Auditoria — 5 Pilares do anexo técnico Sinergia SIACT v6 vs. estado real do código | planejamento |
| [2026-09-03-002](2026-09-03-002-pivo-institucional-claude-perfis.md) | 2026-09-03 | Reposicionamento institucional, migração para Claude e controle de acesso por perfil | codificação |
| [2026-09-03-003](2026-09-03-003-assistente-flutuante-neon-mobile.md) | 2026-09-03 | Assistente flutuante com destaque neon e responsividade mobile completa | codificação |
| [2026-09-03-004](2026-09-03-004-menu-perfil-fonte-editais.md) | 2026-09-03 | Menu lateral por perfil (OSC/Setorial) e nova fonte oficial de editais | codificação |
| [2026-09-03-005](2026-09-03-005-remove-barra-superior.md) | 2026-09-03 | Remove barra superior e simplifica identidade visual | codificação |
| [2026-09-03-006](2026-09-03-006-sidebar-2-icones-identidade-setorial.md) | 2026-09-03 | Sidebar mostra só 2 ícones por padrão e oculta identidade antes do login Setorial | codificação |
| [2026-09-03-007](2026-09-03-007-efeito-neon-barra-progresso.md) | 2026-09-03 | Efeito neon sutil nos traços da barra de progresso | codificação |
| [2026-09-03-008](2026-09-03-008-cria-diario-de-bordo.md) | 2026-09-03 | Cria Diário de Bordo do projeto e registra auditoria dos 5 pilares | documentação |
| [2026-09-06-001](2026-09-06-001-fix-dockerfile-src-lib.md) | 2026-09-06 | Corrige Dockerfile — imagem de produção não incluía src/lib | codificação |
| [2026-09-06-002](2026-09-06-002-fix-vite-build-args.md) | 2026-09-06 | Corrige variáveis VITE_* ausentes em build-time (Dockerfile + cloudbuild.yaml) | codificação |
| [2026-09-06-003](2026-09-06-003-acesso-demonstracao-login-anonimo.md) | 2026-09-06 | Acesso de demonstração via login anônimo do Supabase | codificação |
| [2026-09-06-004](2026-09-06-004-fix-csp-connect-src-supabase.md) | 2026-09-06 | Corrige CSP em produção — connect-src bloqueava chamadas ao Supabase | codificação |
| [2026-09-06-005](2026-09-06-005-fix-cloudbuild-bash-entrypoint.md) | 2026-09-06 | Corrige cloudbuild.yaml — entrypoint bash necessário para expandir secretEnv | codificação |
| [2026-09-06-006](2026-09-06-006-chave-anthropic-revogada.md) | 2026-09-06 | Renova secret ANTHROPIC_API_KEY — chave revogada bloqueava toda análise de IA | testes |
| [2026-09-06-007](2026-09-06-007-marco-validacao-e2e-demonstracao.md) | 2026-09-06 | Marco — validação de ponta a ponta do ambiente de demonstração em produção | marco |
| [2026-09-06-008](2026-09-06-008-usabilidade-assistente-flutuante.md) | 2026-09-06 | Amplia painel do Assistente flutuante — legibilidade e acessibilidade | codificação |
| [2026-09-06-009](2026-09-06-009-fix-cotacao-previa-totais-prematuros.md) | 2026-09-06 | Corrige cartões de totais da Cotação Prévia aparecendo antes do valor cotado | codificação |
| [2026-09-06-010](2026-09-06-010-planejamento-preco-referencia-comprasgov.md) | 2026-09-06 | Registra no Roadmap — sugestão automática de preço de referência via Compras.gov.br | planejamento |
| [2026-09-06-011](2026-09-06-011-fix-mapeamento-ipea-situacao-sempre-inativa.md) | 2026-09-06 | Corrige mapeamento IPEA — situação de OSC sempre "INATIVA", município/UF sempre vazios | codificação |
