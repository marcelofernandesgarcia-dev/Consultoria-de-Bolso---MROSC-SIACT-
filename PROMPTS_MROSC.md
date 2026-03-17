# Documentação dos Prompts MROSC Aprimorados

Esta documentação detalha as melhorias implementadas nos prompts do módulo SIACT-MROSC, incorporando técnicas avançadas de Engenharia de Prompt para garantir maior precisão, transparência e conformidade legal.

## Técnicas Aplicadas

1.  **Chain of Thought (Cadeia de Pensamento):**
    -   Instruímos a IA a "pensar passo a passo" antes de gerar a resposta final.
    -   Isso reduz alucinações e força a verificação lógica de cada critério.
    -   Adicionamos um campo `reasoning` no JSON de saída para expor essa lógica ao usuário.

2.  **Citações Legais Específicas:**
    -   Os prompts agora exigem a citação explícita dos artigos da Lei 13.019/2014 e do Decreto 11.948/2024.
    -   Isso garante que cada apontamento de "NÃO CONFORME" ou "RESSALVA" esteja fundamentado na legislação.

3.  **Estrutura de Saída Padronizada:**
    -   Todos os prompts retornam um JSON com `status_final`, `summary`, `reasoning` e campos específicos da análise.

## Exemplos de Prompts Aprimorados

### 1. Análise de Elegibilidade (Prompt 1.1)

**Objetivo:** Verificar se a OSC cumpre os requisitos básicos de existência e regularidade.

**Melhoria:**
-   **Antes:** Apenas listava critérios.
-   **Agora:** Instrui a calcular o tempo de existência a partir da data de fundação e comparar com o Art. 33. Exige verificação cruzada de documentos fiscais.

**Trecho do Prompt:**
```javascript
PENSAMENTO (CHAIN OF THOUGHT):
1. Identifique a data de fundação da OSC e calcule o tempo de existência.
2. Verifique documentos de regularidade fiscal (CND, FGTS, Trabalhista).
3. Busque evidências de experiência prévia em projetos similares.
4. Compare cada item com o Art. 33 e 34 da Lei 13.019/2014.
```

### 2. Checklist de Documentação (Prompt 1.2)

**Objetivo:** Validar a presença e validade dos documentos obrigatórios.

**Melhoria:**
-   Foca na identificação de ausências críticas baseadas no Art. 26 do Decreto 11.948/2024.
-   Solicita a lógica da conferência no campo `reasoning`.

### 3. Validação Orçamentária (Prompt 1.3)

**Objetivo:** Analisar a legalidade dos itens de despesa.

**Melhoria:**
-   Instrui a classificar a natureza da despesa antes de validar.
-   Verifica vedações específicas do Art. 45 (ex: pagamento de servidor).

### 4. Roteador MROSC (Prompt 2.1)

**Objetivo:** Classificar o instrumento jurídico correto.

**Melhoria:**
-   Implementa uma árvore de decisão explícita no prompt.
-   Distingue claramente entre Termo de Fomento e Colaboração baseando-se na origem da iniciativa (Inovação vs. Parametrizada).

**Trecho do Prompt:**
```javascript
LÓGICA DE DECISÃO:
1. Há repasse de recurso financeiro? 
   - NÃO -> Acordo de Cooperação (Art. 2º, VIII-A).
   - SIM -> Vá para 2.
2. A iniciativa é da Administração ou da OSC?
   - Administração -> Termo de Colaboração.
   - OSC -> Termo de Fomento.
```

## Possibilidades de Uso Futuro

-   **Auditoria Automatizada:** O campo `reasoning` pode ser usado para auditoria automática das decisões da IA.
-   **Feedback Educativo:** As explicações geradas podem ser apresentadas diretamente à OSC para orientar correções.
-   **Base de Conhecimento:** As análises podem alimentar uma base de dados de "erros comuns" para melhorar os editais futuros.
