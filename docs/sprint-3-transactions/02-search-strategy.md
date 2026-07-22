# Task 02 — Estratégia de Busca Firestore

## Contexto

O PDF pede busca integrada ao Cloud Firestore. Firestore não oferece full-text search nativo, então a busca precisa ser simples, previsível e documentada.

## Implementação

1. Adicionar `descriptionNormalized` ao payload salvo da transação.
2. Normalizar acentos, caixa e espaços usando helper em `src/domain` ou `src/services`.
3. Implementar uma das estratégias:
   - busca por prefixo com range query em `descriptionNormalized`;
   - busca local sobre resultados carregados quando filtros fortes já limitaram o conjunto;
   - combinação das duas, com comportamento documentado.
4. Definir quais filtros podem ser combinados sem exigir índices excessivos.
5. Registrar índices necessários do Firestore.
6. Documentar limitações no README final.

## Validação

- [ ] Busca por descrição encontra transações esperadas
- [ ] Busca reseta paginação/cursor
- [ ] Busca vazia volta ao estado filtrado anterior
- [ ] Estratégia não promete full-text search
- [ ] Limitações ficam documentadas

## Gotchas

- Evitar trazer Algolia/Elastic ou qualquer serviço pago/extra.
- Combinações de `where` + `orderBy` podem exigir índice composto.
- Prefix search não cobre substring no meio da frase.
