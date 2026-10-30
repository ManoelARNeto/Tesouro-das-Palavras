# O Tesouro das Palavras — Etapa 3: Mapas e pistas

**Versão 0.3.0.** Continuação incremental do projeto das Etapas 1 e 2. Esta versão preserva movimentação, câmera, joystick, pá permanente e exploração, e acrescenta **10 estágios**, **30 tesouros** e o sistema de **mapas antigos com pistas**.

## Novidades principais

- **Campanha com 10 estágios**, cada um com **cenário diferente**.
- **3 tesouros por estágio**, em ordem **fácil → médio → difícil**.
- **Mapa do tesouro** em estilo pergaminho, inspirado no modelo enviado pelo professor: rota pontilhada, marcos e X.
- **Seletor de estágios** com desbloqueio progressivo.
- **Diário da campanha** com andamento global e pistas do estágio atual.
- **Persistência v3**: progresso de cada estágio salvo localmente.
- **Compatibilidade com salvamentos anteriores**: partidas da Etapa 1 e 2 podem ser migradas para o primeiro estágio.

## Como funciona a progressão

1. O jogador entra em um estágio.
2. Abre o **Mapa**.
3. Lê a pista do tesouro atual.
4. Usa os **marcos do cenário** para localizar o ponto certo.
5. Aproxima-se e aperta **E** (ou **AÇÃO**) para cavar com a pá.
6. Ao achar o tesouro fácil, desbloqueia a pista média; depois a difícil.
7. Ao concluir os 3 tesouros, o próximo estágio é liberado.

> Nesta Etapa 3, os tesouros ainda **não fazem a checagem das questões oficiais**. A separação por dificuldade (fácil, médio e difícil) já está pronta para receber os bancos de questões do PAEBES na Etapa 4.

## Os 10 estágios

1. Praia dos Náufragos
2. Bosque da Lua Verde
3. Lagoa dos Espelhos
4. Ruínas da Aurora
5. Caverna Rubra
6. Dunas do Sol
7. Pântano do Sussurro
8. Penhascos do Trovão
9. Jardins do Oráculo
10. Santuário do Tesouro Lendário

## Controles

| Ação | Teclado | Celular/tablet |
|---|---|---|
| Andar | `W A S D` ou setas | Joystick virtual |
| **Cavar / interagir** | **`E` ou `Espaço`** | **Botão `AÇÃO`** |
| Abrir mapa | Botão **Mapa** na HUD | Botão **Mapa** na HUD |
| Abrir diário | Botão **Diário** | Botão **Diário** |
| Pausa | `Esc` ou botão **Pausa** | Botão **Pausa** |

## Como executar

1. Extraia o ZIP.
2. Execute `INICIAR_NO_WINDOWS.bat` (Windows) ou `./INICIAR_NO_MAC_LINUX.sh` (macOS/Linux).
3. Alternativamente, na pasta do projeto, rode:

```bash
python -m http.server 8000
```

4. Abra **http://localhost:8000** no navegador.

## Testes

Execute os testes com Node.js:

```bash
node tests/test-world.mjs
node tests/test-campaign.mjs
```

Esses testes verificam geração dos 10 estágios, quantidade total de tesouros, progressão das pistas e desbloqueio básico da campanha.

## Limitações atuais

- As **questões de Língua Portuguesa** ainda não foram vinculadas aos tesouros.
- O jogo continua em **Canvas 2D nativo**, sem Phaser 3.
- O sistema de mapa foi testado estruturalmente e precisa de validação em mais dispositivos reais.

## Próxima etapa

**Etapa 4 — Baús e questões:** cada tesouro encontrado acionará a interface de questões de Língua Portuguesa do PAEBES, respeitando os níveis fácil, médio e difícil já definidos na campanha.
