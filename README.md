# O Tesouro das Palavras — Etapa 6: versão 1.0

Jogo educativo 2D para a 3ª série do Ensino Médio. Esta é a **versão consolidada** das seis etapas, executável como site estático no navegador e compatível com GitHub Pages. Continua utilizando **Canvas 2D nativo, HTML/CSS/JavaScript ES Modules**, sem bibliotecas pagas, APIs, contas ou servidor de aplicação.

## Conteúdo consolidado

- **10 estágios jogáveis** com cenários distintos e **3 baús por estágio** (Fácil, Médio, Difícil).
- **Mapa antigo com pistas de localização**, exploração, pá permanente, escavação, colisões, câmera, movimentação WASD/setas e joystick virtual.
- **90 questões**: 57 itens da coletânea PAEBES 2024 e 33 questões demonstrativas autorais. Os originais do PDF permanecem fiéis ao material fornecido e **não entram na correção sem gabarito validado**.
- A resposta correta abre o baú; erros preservam o progresso. Cada baú concede **25 / 50 / 100 moedas** (conforme dificuldade) apenas na primeira abertura histórica.
- **Um fragmento por estágio** se os três baús forem respondidos corretamente na primeira tentativa da rodada. Em caso de erro, é possível **repetir o estágio** para tentar o fragmento sem duplicar moedas.
- **10 fragmentos** desbloqueiam a **Ilha das Palavras Perdidas**, com altar final e relíquia.
- Inventário, diário, seleção de estágios, biblioteca de questões, pausa e configurações.

## Melhorias da Etapa 6

1. **Salvamento v6**: migração de v5 e anteriores, validação básica dos dados e correções de retomada. A seleção de estágio no menu agora mantém histórico de questões, respostas e recompensas.
2. **Backup portátil**: `Configurações → Exportar progresso` cria um `.json`; `Importar progresso` permite recuperar a campanha em outro navegador (na mesma versão), substituindo o progresso local após confirmação. Não contém dados de identificação pessoal.
3. **Banco resiliente**: se uma questão alternativa de uma rodada anterior não existir ou perder a validação, o sistema tenta recuperar a atribuição original validada; nunca aprova uma questão sem gabarito válido.
4. **Atalhos**: `M` mapa, `I` inventário, `J` diário, `Esc` pausa/voltar. `E` e `Espaço` continuam sendo a única interação com pá e objetos.
5. **Avançar estágio**: após a conclusão, botão de acesso direto ao estágio seguinte (ou à área secreta, quando liberada).
6. **Otimização**: HUD atualizado a intervalos curtos em vez de cada frame; renderização em menus reduzida, sem alterar fluidez da exploração.
7. **Acessibilidade**: opção de animação reduzida, respeito à preferência de movimento reduzido do dispositivo, ajustes de contraste e rolagem, botões maiores e adequação às áreas seguras do celular.
8. **Testes e integridade**: verificações em Node, simulação de campanha completa em Chromium, teste de migração e manifesto de hashes SHA-256 para todos os arquivos pedagógicos preservados.

## Executar no computador

1. Extraia a pasta e mantenha `index.html`, `styles/`, `src/`, `assets/` e `data/` juntos.
2. Execute `INICIAR_NO_WINDOWS.bat` ou `./INICIAR_NO_MAC_LINUX.sh` com Python instalado; ou:

   ```bash
   python -m http.server 8000
   ```

3. Abra `http://localhost:8000`. **Não abra `index.html` por `file://`** porque o jogo utiliza módulos ES e `fetch`.

## Atualizar no GitHub Pages

Consulte `docs/PUBLICAR_NO_GITHUB.md`. Há um ZIP completo, para edição/auditoria, e um ZIP leve com os arquivos necessários ao site. **Não altere a URL ou origem da página se precisar manter o mesmo `localStorage`.** Antes da atualização, peça aos estudantes que exportem o progresso.

## Testes automatizados

Na raiz do projeto (Node.js 22 ou compatível):

```bash
for f in tests/*.mjs; do node "$f" || exit 1; done
```

Os testes verificam integridade do acervo, 90 questões, 10 estágios, 30 baús, colisões e trajetos, recompensa por primeira tentativa, 1.750 moedas, 10 fragmentos, replay, acesso ao altar, migrações, recuperação de questão e validade de backups.

**Validação em navegador:** foi realizada em Chromium headless com HTML, módulos, JSON e imagens incorporados temporariamente, porque o ambiente de teste não permite navegar pelo servidor HTTP local. Foram exercitados desktop (1365×768), celular simulado (390×844), questão, mapa, configurações e download de backup. Um segundo teste completou os 30 baús, obteve os 10 fragmentos, entrou na ilha secreta, recuperou a relíquia, importou o backup e executou replay após erro, sem erros JS detectados. O servidor estático também foi validado via `curl` local. **Não foi possível verificar o GitHub Pages publicado nem celulares físicos.**

## Limitações e publicação responsável

- `localStorage` é **local ao navegador**; pode ser apagado pelo usuário ou políticas do dispositivo. Use o backup antes de limpar dados ou mudar de aparelho. Não há sincronização multiusuário.
- A validação das respostas ocorre no próprio navegador e os JSON são públicos na hospedagem estática: o jogo **não é uma prova segura contra consulta ao gabarito**.
- As **57 questões reproduzidas do PDF** continuam pendentes de gabarito oficial/conferência do professor; as 30 atribuídas aos baús são autorais validadas. A classificação de dificuldade dos itens originais não é oficial.
- PDF original e imagens/textos reproduzidos incluem material de terceiros. **Confirme autorização de publicação** antes de enviar o repositório e, se necessário, substitua/remova os conteúdos sem autorização antes de disponibilizar o site publicamente.
- Não houve teste em hardware real, auditoria externa de acessibilidade ou medição comparativa de FPS em diversos aparelhos.

## Arquivos importantes

- `src/core/Game.js`, `src/core/SaveManager.js`, `src/core/Rewards.js` — fluxo do jogo, salvamento, economia.
- `src/data/QuestionRepository.js` — validação das questões e compatibilidade do banco.
- `data/questions.json`, `data/atribuicoes.json`, `data/gabaritos-professor.json` — banco da versão final (texto e imagens preservados).
- `docs/RELATORIO_TESTES_ETAPA6.md` — testes, limitações e critérios de aceite.
- `docs/MANIFESTO_INTEGRIDADE.json` — hash dos arquivos de acervo sem alterações.
