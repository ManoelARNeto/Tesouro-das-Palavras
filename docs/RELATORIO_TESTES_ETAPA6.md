# Relatório de validação — Etapa 6

**Nota sobre a versão 1.0.1:** este relatório registra a campanha original de 30/10/2026, antes da correção de moedas. O total histórico de 1.750 moedas mencionado abaixo pertence à versão 1.0. Para a correção 1.0.1, consulte `docs/REGRAS_MOEDAS_1.0.1.md` e os testes atualizados (teto de 1.500 moedas).

**Escopo:** revisão de conteúdo, jogabilidade, performance básica, migração de progresso, acessibilidade funcional e publicação estática. **Data de teste:** 30/10/2026. **Base:** Etapa 5. **Versão:** 1.0 / salvamento v6.

## Testes automatizados (Node.js)

| Suite | O que verifica | Resultado |
|---|---|---|
| test-world.mjs | limites e geração | Aprovado |
| test-exploration.mjs | 30 posições alcançáveis e colisões | Aprovado |
| test-campaign.mjs | sequência dos 10 estágios e 30 baús | Aprovado |
| test-questions.mjs | 90 itens, 57 do PDF, 33 autorais e 30 atribuições | Aprovado |
| test-rewards.mjs | moedas, primeira tentativa, replays, 10 fragmentos, altar secreto | Aprovado |
| test-release.mjs | migração v5→v6, backup, fallback de questões e campanha | Aprovado |
| test-integrity.mjs | hashes SHA-256 dos arquivos pedagógicos preservados | Aprovado |

## Exercício no navegador

Teste realizado em **Chromium headless**, com `page.set_content` e módulos/imagens/JSON incorporados temporariamente, devido à política que impede o acesso HTTP direto do navegador de testes. **Não é validação real do GitHub Pages publicado.**

- **1365×768 desktop** e **390×844 celular emulado**: tela inicial, mapa, configurações, fluxo de escavação, modal de questão e download de backup; sem erros de JavaScript observados.
- **Campanha completa**: 30 acertos / 30 baús abertos / **1.750 moedas** / **10 fragmentos** / 10 estágios desbloqueados / estado de vitória.
- **Área secreta**: acesso à ilha e interação com o altar, relíquia adicionada ao inventário.
- **Resgate de progresso**: após iniciar uma nova campanha, importar backup restaurou moedas, fragmentos, estágio e relíquia.
- **Falha seguida de replay**: o fragmento não foi entregue quando a primeira questão teve erro; após repetir a rodada e acertar as três questões, o fragmento foi concedido, sem duplicar moedas.
- **Interface**: removidas notificações que ficavam sobre os painéis e corrigido o retorno do seletor de estágios para a tela de pausa.

## Conteúdo pedagógico

- O banco mantém **90 questões**, sem alterações de conteúdo frente à Etapa 5; os itens reproduzidos do PDF continuam pendentes de gabarito validado, por isso não abrem baús.
- Os arquivos preservados têm hashes SHA-256 armazenados em `docs/MANIFESTO_INTEGRIDADE.json`.
- Os desafios da campanha utilizam questões autorais validadas, com dificuldade correspondente ao baú.

## Testes ainda necessários fora do ambiente

1. Publicar no GitHub Pages e verificar `fetch` e imports ES por HTTP/HTTPS, inclusive caminhos relativos em repositório de projeto.
2. Testar joystick, orientação, rolagem, zoom, áudio do dispositivo (o jogo não implementa trilha sonora) e foco de teclado em dispositivos físicos.
3. Verificar desempenho em celulares de baixa capacidade e períodos prolongados de uso (bateria / taxa de quadros).
4. Confirmar permissões de publicação dos materiais de terceiros e validar oficialmente os gabaritos originais antes de uso avaliativo.
5. Avaliar a acessibilidade em leitores de tela e com estudantes que precisem de adaptações adicionais.

**Resultado:** adequado como versão final funcional para teste e publicação estática condicionada às verificações de hospedagem, dispositivos e direitos de reprodução acima.
