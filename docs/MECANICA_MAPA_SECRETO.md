# Regras de obtenção dos fragmentos e da Ilha das Palavras Perdidas

## Conceito

O mapa antigo está rasgado em **dez partes**, uma por estágio. Cada estágio tem **três baús** (Fácil, Médio, Difícil). O jogador conquista a parte do mapa **somente quando responde corretamente ao primeiro envio de resposta de cada um dos três baús**. A troca de questão antes de responder não conta como tentativa, e a troca após um erro não apaga o erro.

## Fluxo em sala

1. Interpretar a pista geográfica e usar a pá para desenterrar o baú.
2. Ler o texto, selecionar e confirmar uma alternativa.
3. O baú abre com acerto, independentemente de quantas tentativas foram usadas.
4. Quando três baús são abertos, o próximo estágio fica disponível.
5. O fragmento aparece apenas se todas as três questões foram acertadas de primeira.
6. Um estágio concluído sem fragmento pode ser repetido. Essa repetição reinicia **os três baús e a contagem da rodada**, não zera o progresso pedagógico global.
7. Ao obter todos os 10 fragmentos, o inventário revela o mapa completo, e um cenário adicional fica liberado.
8. Na Ilha das Palavras Perdidas, o aluno percorre o caminho até o Altar do Livro e usa a interação normal para receber a relíquia.

## Recompensas

| Baú | Moedas ao abrir pela primeira vez |
|---|---:|
| Fácil | 25 |
| Médio | 50 |
| Difícil | 100 |
| Total da campanha sem repetir recompensas | 1.750 |

Não há moeda adicional ao repetir um baú já recompensado. O histórico por questão continua registrando acertos, erros e número de tentativas para uma análise pedagógica posterior.

## Persistência

Cada estágio possui sua própria contagem `attempts` e marcações `firstTry` por ID de baú. O inventário guarda `coins`, `rewardedChests`, `fragments`, `relic` e `secretCompleted` na chave de salvamento v5. Fragmentos já conquistados não desaparecem com o replay de outro estágio. O cenário secreto não entra no total de 30 baús nem usa uma questão de gabarito não validado.
