# O Tesouro das Palavras — Etapa 4 (v0.4.0)

Jogo educativo de exploração 2D para a **3ª série do Ensino Médio**. Continuação incremental das Etapas 1–3, executável como site **HTML/CSS/JavaScript estático no GitHub Pages**, sem servidor de aplicação, chave de API ou biblioteca externa. Os sistemas de movimentação, joystick, câmera, 10 estágios, mapas de pergaminho, pá, escavação e salvamento foram mantidos.

## Entrega da Etapa 4

| Recurso | Estado |
|---|---|
| 10 estágios, mapas diferentes, 3 baús por estágio | Funcional |
| Pá permanente (`E`, `Espaço`, `AÇÃO`) | Funcional |
| Baú escavado permanece fechado até responder certo | Funcional |
| Tela de questão completa, 5 alternativas, rolagem no celular | Funcional |
| Tentativas, erros, acertos e itens corretos no salvamento | Funcional |
| Desbloqueio Fácil → Médio → Difícil → estágio seguinte | Funcional |
| Vitória final após 30 respostas corretas | Funcional |
| Acervo consultável de 90 itens | Funcional |
| Gabaritos oficiais da coletânea anexada | **Não fornecidos: 57 pendentes** |

### Banco de 90 questões

- **57 itens do PDF original**: 56 numerados `2024.01–2024.56` e **um item completo sem número impresso** na página 25, intitulado **“Internet faz amigos”** (D032_P). Não foi atribuído um falso número oficial.
- **33 questões autorais**, com textos inéditos, 5 alternativas, resposta justificada, habilidades inspiradas nos descritores da coletânea. Não são itens oficiais do PAEBES.
- **30 questões autorais diferentes** são usadas como chave dos 30 baús, uma por baú. **3 autorais** ficam como reserva.
- As **57 originais estão disponíveis no acervo e no banco**, inclusive com recortes visuais completos de textos-base, alternativas, tabelas e tirinhas, mas **não entram na avaliação até receberem gabarito validado**. O PDF não continha gabarito oficial.
- A divisão dos 90 itens é **19 fáceis, 35 médios e 36 difíceis**. A dificuldade das questões do PDF é uma **estimativa pedagógica pelo descritor**, não uma categorização oficial nem resultado de calibragem psicométrica.

**Preservação dos itens do PDF:** os conteúdos visuais originais foram reproduzidos em arquivos WebP sem perdas, com trechos de páginas em ordem (102 imagens). O PDF recebido também está guardado **integralmente e sem alteração** em `docs/fonte/Coletanea_Itens_PAEBES_2024_Original.pdf` para conferência. O banco contém transcrição auxiliar, fonte, número original, descritor, alternativas e links para reproduções. Para exibir a questão original com fidelidade de texto e formatação, a interface usa os recortes da fonte, e não uma reescrita.

SHA-256 do PDF original: `a5b6f6409ce977b752d509f52d7e86e1905098aeffe65d64956ee8a337750f9f`

### Como jogar

1. Clique **NOVA CAMPANHA**, abra **MAPA** e interprete a primeira pista.
2. Aproxime-se do monte de terra. Com a pá que já pertence ao aventureiro, pressione `E` / `Espaço` / **AÇÃO**.
3. Quando o baú aparecer, a questão correspondente será aberta automaticamente. Fechar a janela não perde o baú encontrado.
4. Leia o texto integral, escolha entre A–E e clique **CONFIRMAR RESPOSTA**.
5. **Errar:** o baú continua fechado; a tentativa fica registrada e uma dica aparece. Você pode tentar de novo ou, quando existir outra questão validada com o mesmo descritor e dificuldade, trocar a questão.
6. **Acertar:** o baú recebe visual aberto, o acerto fica salvo e a próxima pista é liberada. Depois dos três baús, surge o próximo estágio. Após 30 acertos, abre-se o Tesouro Lendário.

Não há punição de perda de progresso nem cronômetro para responder.

## Executar localmente

1. Extraia o ZIP.
2. Execute `INICIAR_NO_WINDOWS.bat` no Windows (Python instalado), ou `./INICIAR_NO_MAC_LINUX.sh` no macOS/Linux.
3. Alternativa: na pasta do `index.html`, execute `python -m http.server 8000` e abra `http://localhost:8000`.

**Não abra `index.html` diretamente via `file://`**: arquivos JSON e módulos ES precisam ser servidos por HTTP. Nenhum serviço remoto é necessário durante a partida, desde que o jogo esteja hospedado.

## Publicar no GitHub Pages

Mantenha **toda a estrutura de pastas** no repositório. O `index.html` deve ficar na raiz publicada. Em **Settings → Pages**, selecione a branch da publicação (`main`) e **/(root)**, se estiver utilizando publicação por branch. Aguarde o GitHub fornecer o endereço `https://USUARIO.github.io/REPOSITORIO/` e abra-o para testar. Todos os caminhos internos são relativos e funcionam sob esse subdiretório. Não é necessário transformar o jogo em um único HTML.

**Atenção aos direitos autorais:** o PDF fornecido contém textos e imagens de autores/veículos de terceiros. Confirme as permissões para reprodução pública antes de enviar seus conteúdos ou os recortes originais para um repositório aberto. O pacote contém o acervo completo por solicitação do professor, mas a autorização para distribuição pública não foi verificada.

## Organização principal

```text
index.html
styles/main.css
src/main.js
src/core/{Game,Camera,Input,SaveManager}.js
src/data/QuestionRepository.js
src/entities/Player.js
src/world/{World,generator,world-config,stages}.js
src/render/Renderer.js
src/ui/UI.js
assets/objects/*.png                  # inclui chest_open.png
assets/questoes/paebes2024/*.webp    # 102 recortes fiéis
assets/sprites/aventureiro.png
data/questions.json                  # banco ativo, 90 questões
data/questions.original.json         # 57 registros do PDF
data/questions.autorais.json          # 33 registros autorais
data/indice_por_dificuldade.json     # grupos e quantitativos
data/atribuicoes.json                # mapeamento dos 30 baús
data/gabaritos-professor.json        # gabaritos pendentes da coletânea
docs/fonte/Coletanea_Itens_PAEBES_2024_Original.pdf
tests/*.mjs
```

## Inserir posteriormente gabaritos oficiais das originais

Edite apenas `data/gabaritos-professor.json` e substitua o valor `null` do item pelo objeto **com a alternativa efetivamente confirmada** e referência da validação. Modelo ilustrativo (a letra abaixo é apenas formato, **não um gabarito do PDF**):

```json
"PAEBES-2024-01": {
  "alternativa": "A",
  "validado": true,
  "referencia": "Gabarito conferido pelo professor: documento, edição e página"
}
```

Depois, se quiser colocar uma questão original em um baú, altere em `data/atribuicoes.json` apenas o ID daquele baú para o ID do item validado, respeitando **a mesma dificuldade**. O sistema rejeita configurações que apontem para questão sem resposta validada. Não altere a estrutura do código para acrescentar novos PDFs: expanda o JSON e os recursos visuais com o mesmo formato.

## Migração e salvamento

O salvamento atual usa `localStorage` com a chave `tesouro-das-palavras-v4`. Ao continuar uma partida da Etapa 3, baús anteriormente escavados são restaurados como **encontrados, mas trancados**, não como baús já respondidos. Os acertos novos são persistidos como `opened` por estágio, com estatísticas por ID. Salvamentos de versões mais antigas são migrados de forma conservadora, preservando os dados compatíveis; localizações e IDs de baús descontinuados podem precisar de nova exploração. O histórico continua apenas no navegador/origem do dispositivo.

## Testes efetuados

```bash
node tests/test-world.mjs
node tests/test-exploration.mjs
node tests/test-campaign.mjs
node tests/test-questions.mjs
```

Esses quatro testes passaram. Foi exercitada uma execução isolada da interface em Chromium desktop e celular, com recursos incorporados temporariamente devido ao bloqueio de navegação HTTP local do ambiente de testes. Verificou-se a abertura do acervo (90 entradas), um item original com tirinha, tela de mapa, escavação, tentativa errada, acerto, baú aberto, salvamento e rolagem da questão no celular. **Foi executado ainda um percurso completo de 30 respostas corretas nos 10 estágios, com vitória final. Não foi realizado um teste HTTP de ponta a ponta com GitHub Pages, nem teste em aparelho físico.** Faça essas verificações antes de aplicar aos estudantes.

## Próximas melhorias

- Validar e habilitar os 57 gabaritos originais, se disponibilizados oficialmente.
- Configuração docente para escolher questões por descritor, sem editar JSON manualmente.
- Painel de acompanhamento por descritor (sem coletar informações pessoais desnecessárias).
