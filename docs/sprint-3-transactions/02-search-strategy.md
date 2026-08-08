# Task 02 — Estratégia de Busca Firestore

## Contexto

O PDF pede busca integrada ao Cloud Firestore. Firestore não oferece full-text search nativo, então a busca precisa ser simples, previsível e documentada.

## Implementação

`descriptionNormalized` e salvo em create/update. A normalizacao deixa a busca
insensivel a caixa e acentos, alem de reduzir espacos repetidos.

A estrategia selecionada e busca por prefixo no Firestore. Ela consulta o
inicio da descricao completa normalizada e nao faz full-text search nem busca
local sobre itens ja carregados.

As paginas com busca sao ordenadas por `descriptionNormalized ASC`, depois
`date DESC`. Sem busca, a ordem permanece `date DESC`. Os quatro formatos
suportados pelos indices compostos sao: somente busca, busca + tipo, busca +
categoria e busca + tipo + categoria.

## Limites Operacionais

- A busca encontra somente o inicio da descricao completa.
- A busca nao encontra substrings, erros de digitacao, stemming nem palavras
  separadas que aparecam mais adiante na descricao.
- Busca composta apenas por espacos e equivalente a ausencia de busca.
- Transacoes de demonstracao existentes devem ser editadas/recriadas ou receber
  `descriptionNormalized` manualmente antes de aparecerem nos resultados.
- A UI/hook deve passar `cursor: null` e limpar os itens acumulados sempre que
  `filter.search` mudar. As Tasks 07/09 sao donas e testam esse reset de estado.
- Se uma combinacao demonstrada de filtros solicitar outro indice, o link de
  erro do Firestore Console e a fonte de verdade para criar o indice adicional
  e espelhar sua definicao em `firestore.indexes.json`.

## Validação

- [x] Busca por descrição encontra transações esperadas
- [ ] Busca reseta paginação/cursor — integração pertencente às Tasks 07/09
- [x] Busca vazia volta ao estado filtrado anterior
- [x] Estratégia não promete full-text search
- [x] Limitações ficam documentadas

## Gotchas

- Evitar trazer Algolia/Elastic ou qualquer serviço pago/extra.
- Combinações de `where` + `orderBy` podem exigir índice composto.
- Prefix search não cobre substring no meio da frase, erros de digitacao,
  stemming ou palavras posteriores na descricao.
