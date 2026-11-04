# Publicar ou atualizar no GitHub Pages — versão 1.0.3 (PAEBES real)

1. **Faça backup da versão atual** do repositório e do progresso em **Configurações → Exportar progresso**.
2. Extraia `O_Tesouro_das_Palavras_v1.0.3_PAEBES_GitHub_Pages.zip` e envie os **arquivos internos** para a raiz do repositório. Mantenha `index.html`, `.nojekyll`, `assets/`, `src/`, `styles/` e `data/` nos caminhos originais. Evite deixar o antigo `data/questions.autorais.json` publicado: ele não faz parte desta versão.
3. Faça commit e acesse a URL do GitHub Pages. Recarregue ignorando o cache caso a tela anterior ainda apareça.
4. Escolha **Nova campanha** para praticar os 30 baús com questões originais. Em **Continuar**, os baús previamente abertos continuam abertos para preservar o salvamento.
5. Verifique a primeira questão do primeiro baú: **2024.01**, descritor D016_P. Ao errar, deve mudar para **2024.02** e, após outro erro, **2024.03**. O PDF original e suas alternativas devem continuar visíveis.
6. Confirme as moedas **50/30/10**, os fragmentos por três acertos de primeira e a progressão do mapa secreto.
7. Consulte `docs/AUDITORIA_GABARITO_PAEBES_2024.md` e valide manualmente as quatro divergências de descritor. Os itens 2024.50 a 2024.56 ficam apenas para consulta.

A versão web inclui os recortes visuais dos itens originais e o JSON com a chave de correção. **Verifique as autorizações para disponibilização pública de textos, imagens e tirinhas**. O PDF-fonte e o PDF do gabarito não são enviados no pacote web para reduzir tamanho, mas esse fato não elimina exigências de licença para os recortes incluídos.

A hospedagem é estática, sem API, sem servidor obrigatório e sem cobrança. O `localStorage` mantém o progresso apenas na mesma origem/navegador enquanto não for apagado. Use a exportação/importação de backup ao trocar de dispositivo.
