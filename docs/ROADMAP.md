# Roteiro incremental de desenvolvimento — O Tesouro das Palavras

## Etapa 1 — Concluída (v0.1)
- Menu inicial, nova expedição/continuar, preferências, pausa, mapa original de 96 × 72 blocos.
- Aventureiro pixel art, movimentação WASD/setas e joystick virtual, câmera suave, colisões.
- Cinco regiões, placas interativas, diário, salvamento local.

## Etapa 2 — Concluída (v0.2)
- Pá sempre em posse do personagem; **sem botão para selecionar ou equipar ferramenta**.
- Tecla `E` / `Espaço` e botão `AÇÃO` como **única interação**, contextualizada por proximidade.
- Cinco locais escaváveis e cinco baús que aparecem **somente após a escavação**.
- Três barreiras de areia removíveis e três locais secretos registráveis no diário.
- Novos sprites originais de ambiente e obstáculos com colisão.
- Animação curta de escavação e impedimento de atravessar baús desenterrados.
- Persistência de escavações/locais secretos; compatibilidade de leitura com salvamento v1.

## Etapa 3 — Próxima: Mapa do tesouro e pistas
- Criar `TreasureMap` com representações estilizadas, pontos de referência descobertos e pistas textuais.
- Distribuir fragmentos do mapa e impedir revelação automática das posições exatas.
- Relacionar pistas aos cinco `BURIED_SITES` estáveis e aos locais secretos já implementados.

## Etapa 4 — Baús, fechaduras e questões
- Acrescentar `ChestState`: `buried`, `closed`, `challenging`, `open` e persistir transições.
- Após cavar e revelar um baú, permitir interação para abrir uma questão de Língua Portuguesa.
- Importar PDF de prova autorizado para JSON externo, preservar textos, imagens e alternativas.
- Bloquear correção quando faltarem gabaritos validados; registrar acertos e tentativas.
- Não alterar o gesto central: o jogador sempre usa o mesmo botão para cavar ou interagir.

## Etapa 5 — Recompensas, progressão e conclusão
- Moedas, chaves e fragmentos, inventário, expansão de regiões e condição de vitória.
- Não conceder recompensa de baú antes da resposta correta.

## Etapa 6 — Acabamento e validação
- Acessibilidade, desempenho em celulares básicos, testes de integração reais e painel docente opcional.

## Observações de arquitetura
- `BURIED_SITES` contém IDs estáveis, independentes de índices, questões e arquivos visuais.
- `World.excavate` só modifica o estado do mundo; a lógica de avaliação futura será independente.
- Não foram copiados sprites, mapas ou narrativas de outros jogos.
