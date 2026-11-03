# Publicação no GitHub Pages — Versão 1.0 / Etapa 6

**O projeto continua modular.** Não faça conversão para HTML único: mantenha `index.html` na raiz com `src/`, `styles/`, `assets/`, `data/` e `.nojekyll`.

## Atualização do repositório

1. Em um computador, baixe e extraia **O_Tesouro_das_Palavras_Etapa6_GitHub_Pages.zip** (ou use os arquivos do ZIP completo).
2. **Antes de atualizar**, peça a cada aluno que use `Configurações → Exportar progresso`, guardando seu arquivo `.json`.
3. No repositório já configurado, substitua o conteúdo da versão anterior pelos arquivos internos do ZIP, preservando a localização do `index.html`.
4. Faça commit e acesse a URL pública configurada em `Settings → Pages`.
5. Se aparecer a versão antiga, recarregue ignorando o cache. No **mesmo endereço do repositório**, use `Continuar` para migrar o salvamento v5 → v6.
6. Se o aluno estiver em outro dispositivo ou se a origem do site mudou, abra `Configurações → Importar progresso` e selecione o JSON exportado na v6. Backups de v5 exigem primeiro a atualização do jogo e uma nova exportação em v6.

## Verificação após publicação

- Tela inicial aparece sem erro de carregamento no console.
- Iniciar campanha; mover com WASD/setas e testar joystick virtual em dispositivo físico.
- Abrir o mapa (`M`), inventário (`I`) e diário (`J`).
- Encontrar o primeiro monte, cavar com `E`/`AÇÃO`, visualizar a questão, errar, acertar e confirmar abertura do baú.
- Conferir moedas, persistência após recarregar e avanço de estágio.
- Ao terminar três baús, verificar a elegibilidade do fragmento; testar uma rodada perfeita e uma com erro.
- Exportar e importar progresso com um arquivo real.
- Validar a renderização em pelo menos um celular Android e um iPhone, se disponíveis.

## Direitos e segurança

O ZIP de implantação omite o **PDF-fonte, as prévias e os testes**, mas mantém os recursos visuais associados às questões originais que podem aparecer na biblioteca. **Omitir o PDF não equivale a obter autorização de uso dos textos/imagens.** Verifique a licença de reprodução antes de disponibilizar publicamente. A validação dos gabaritos é client-side e não protege respostas contra inspeção do código.

O jogo roda inteiramente em hospedagem estática; não são necessários servidores externos, contas de aluno, tokens ou banco de dados remoto.
