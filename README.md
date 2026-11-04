# O Tesouro das Palavras — versão 1.0.3 · Itens reais PAEBES 2024

Esta versão substitui **todas as questões autorais dos baús por itens originais da Coletânea de Itens PAEBES 2024 – Língua Portuguesa, 3ª série do Ensino Médio**, usando o gabarito entregue pelo professor.

## Conteúdo pedagógico

| Categoria | Quantidade |
|---|---:|
| Questões originais do PDF, preservadas | 57 |
| Questões com gabarito utilizável do PDF enviado | 50 |
| Questões sem gabarito utilizável | 7 |
| Questões autorais na versão atual | 0 |
| Baús | 30 |
| Posições de questões (3 por baú) | 90 |

**Atenção:** 90 posições ≠ 90 questões originais diferentes. Existem apenas 50 questões com chave de correção utilizável no documento enviado. Todas as 50 aparecem no jogo, algumas em baús diferentes; **dentro do mesmo baú, as três questões são distintas**. A dificuldade é a classificação pedagógica estimada usada desde a Etapa 4, não uma dificuldade oficial da avaliação.

O gabarito entregue contém 51 linhas: 48 itens numerados entre 2024.01 e 2024.49 (sem a linha 2024.25), dois itens extras — “Q. Extra 1” corresponde a 2024.25 e “Q. Extra 2” é uma questão não numerada —, mais o item 2024.50* marcado como incompleto. Assim, **50 respostas foram utilizadas**. O **2024.50** e os **2024.51 a 2024.56** permanecem somente no acervo consultável, sem correção automática.

A tabela de respostas possui **quatro divergências de código de descritor** em relação ao PDF original. A identificação de descritor da coletânea foi preservada, e o cruzamento por conteúdo e número está registrado em `docs/AUDITORIA_GABARITO_PAEBES_2024.md`. Embora o PDF de respostas se intitule “oficial”, essa procedência não foi verificada independentemente.

## Funcionamento dos baús

1. Encontre um baú pelas pistas e use a pá com `E`, `Espaço` ou **AÇÃO**.
2. O baú apresenta uma questão **original do PDF** (texto, alternativas e recortes visuais preservados).
3. Uma resposta incorreta mantém o baú fechado e alterna automaticamente para a próxima questão daquele baú: **Q1 → Q2 → Q3 → Q1**. O total de tentativas é conservado no salvamento.
4. Uma resposta correta abre o baú e concede **50 moedas na primeira tentativa, 30 na segunda, 10 na terceira ou posterior**.
5. Abrir os três baús de um estágio acertando cada um na primeira tentativa concede um fragmento; os dez fragmentos liberam a ilha secreta.

**Reutilização entre baús:** é necessária para preencher 90 posições com 50 itens validados. A lista exata está em `docs/MAPA_DE_QUESTOES_POR_BAU.md` e `data/atribuicoes.json`.

## Publicação no GitHub Pages

Use o **ZIP GitHub Pages** com `index.html` na raiz. Não suba uma pasta contendo a raiz do projeto dentro do repositório, a menos que seu Pages esteja configurado para ela. Veja `docs/PUBLICAR_NO_GITHUB.md`.

Compatível com o salvamento `tesouro-das-palavras-v6`: moedas, fragmentos e baús já abertos não são apagados. **Uma partida que já abriu baús com questões autorais manterá esses baús abertos.** Para treinar todos os baús com questões PAEBES, inicie **Nova campanha** (após exportar seu progresso, se desejar guardá-lo), ou use a função de repetição dos estágios concluídos.

## Origem e integridade

- `data/questions.json`: somente os **57 itens originais**.
- `data/questions.original.json`: registro original da versão anterior, preservado byte a byte.
- `data/gabaritos-professor.json`: **50 respostas** do gabarito fornecido, 7 pendentes; nunca edita os enunciados e alternativas.
- `data/atribuicoes.json`: os **30 trios** de questões originais.
- `assets/questoes/paebes2024/`: reproduções gráficas originais, incluindo itens com mais de uma página.
- `docs/fonte/`: os PDFs-fonte no pacote completo; não enviados no ZIP do GitHub Pages.

## Testes

No diretório do projeto, com Node.js:

```bash
for arquivo in tests/*.mjs; do node "$arquivo" || exit 1; done
```

Teste em Chromium isolado (Playwright instalado):

```bash
/opt/pyvenv/bin/python tests/test-browser-rotation.py
```

O teste Chromium utiliza HTML/JS e imagens incorporados por limitações administrativas de acesso HTTP do ambiente de teste. A publicação no GitHub Pages, os controles em aparelhos físicos e permissões de reprodução dos textos/imagens de terceiros ainda devem ser conferidos antes do uso público.

O jogo é um recurso de **treinamento**, não uma aplicação segura contra consulta ao JSON ou alteração de salvamento no navegador.
