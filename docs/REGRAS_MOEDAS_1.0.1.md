# Correção de recompensas — versão 1.0.1

A recompensa de todos os 30 baús (fácil, médio e difícil) depende da tentativa em que o estudante **acertou**:

| Acerto | Moedas |
|---|---:|
| 1ª tentativa | 50 |
| 2ª tentativa | 30 |
| 3ª tentativa ou posteriores | 10 |

- Ao errar, nenhuma moeda já conquistada é perdida; a recompensa futura do baú é reduzida.
- A contagem é **por baú** e continua ao fechar o desafio, trocar a questão ou reabrir o navegador.
- Um baú só paga uma vez em todo o histórico da campanha. Repetir um estágio para tentar o fragmento não duplica moedas.
- Os **fragmentos do mapa secreto** ainda exigem três acertos de primeira em cada estágio.
- A atualização mantém o salvamento **v6** e moedas de versões anteriores; não altera moedas já concedidas e não redistribui retroativamente o saldo.
- Pontuação máxima da nova campanha: **30 × 50 = 1.500 moedas**. A pontuação mínima para concluir todos os baús é **30 × 10 = 300 moedas**.
- A interface de questões mostra o valor do próximo acerto e recalcula esse valor após cada erro.

## Publicar no GitHub Pages

Substitua os arquivos do repositório pelos do pacote de publicação, mantendo `index.html` na raiz. A estrutura estática e os arquivos JSON do banco de questões permanecem inalterados. Recomenda-se exportar o progresso antes da atualização.
