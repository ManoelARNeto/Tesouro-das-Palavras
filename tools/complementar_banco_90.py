"""Acrescenta 57 questões autorais: 90 avaliáveis + 57 originais em consulta.
Não produz gabaritos para itens originais da coletânea que estão sem chave oficial.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def item(level, descriptor, question, right, wrong, reason):
    assert len(wrong)==4 and len(set([right]+wrong))==5
    return (level, descriptor, question, right, wrong, reason)

E=lambda question,right,wrong,reason: item('Fácil','D021_P',question,right,wrong,reason)
M=lambda question,right,wrong,reason: item('Médio','D023_P',question,right,wrong,reason)
H=lambda question,right,wrong,reason: item('Difícil','D023_P',question,right,wrong,reason)

contexts=[
  {
   'title':'A biblioteca do bairro depois das seis',
   'text':'''Na Vila Horizonte, a biblioteca comunitária costumava encerrar as atividades às 17 horas. Quem trabalhava durante o dia raramente conseguia retirar livros. Após uma consulta com moradores, voluntários passaram a abrir o espaço duas noites por semana, até as 20 horas. Em três meses, o número de empréstimos aumentou, mas a coordenação advertiu que o resultado não significava, por si só, maior hábito de leitura: parte dos usuários já lia antes, porém não tinha acesso ao acervo. Agora a equipe pretende oferecer mediação de leitura e avaliar a participação, em vez de observar apenas a quantidade de livros emprestados.''',
   'questions':[
    E('Em quais dias a biblioteca passou a funcionar até as 20 horas, segundo o texto?', 'Em duas noites por semana.', ['Em todas as noites.','Somente aos domingos.','Nas manhãs de sábado.','Apenas nos feriados.'], 'O texto afirma que a biblioteca abre duas noites por semana até as 20 horas.'),
    M('Qual dificuldade motivou a ampliação do horário da biblioteca?', 'O horário anterior impedia parte dos trabalhadores de utilizar o espaço.', ['A biblioteca possuía poucos livros de ficção.','Os moradores não tinham interesse em conversar.','Os voluntários queriam substituir a escola.','A equipe precisava reduzir empréstimos.'], 'O funcionamento até as 17 horas excluía pessoas que trabalhavam de dia.'),
    H('Ao distinguir empréstimos de hábito de leitura, a coordenação busca', 'evitar interpretar um indicador de acesso como prova suficiente de mudança de comportamento.', ['mostrar que a contagem de empréstimos é inútil em qualquer estudo.','defender que os usuários novos já conheciam todos os livros.','afirmar que a ampliação do horário fracassou completamente.','substituir a avaliação por opiniões individuais sem evidência.'], 'Mais empréstimos podem decorrer de melhor acesso; a frequência de leitura exige outros indicadores.')
   ]
  },
  {
   'title':'Boletim da qualidade da água',
   'text':'''O boletim mensal da associação de moradores reúne medições feitas em três pontos de um córrego: nascente, ponte e foz. Em abril, as análises apontaram turbidez mais elevada perto da ponte após dias de chuva intensa. Técnicos explicaram que a água barrenta não permite concluir, isoladamente, que há contaminação química; para isso, são necessários outros exames. A associação decidiu publicar os resultados completos, inclusive quando não confirmam suspeitas, e promover encontros para explicar o significado dos indicadores. O objetivo é que a comunidade acompanhe o rio sem confundir alerta preventivo com diagnóstico definitivo.''',
   'questions':[
    E('Em que ponto do córrego foi registrada maior turbidez em abril?', 'Perto da ponte.', ['Na nascente.','Na foz.','No reservatório municipal.','Na estação de tratamento.'], 'O boletim assinala maior turbidez perto da ponte.'),
    M('Por que os técnicos não afirmaram que a água estava quimicamente contaminada?', 'Porque a turbidez, sozinha, não demonstra contaminação química.', ['Porque a chuva impede qualquer coleta de água.','Porque a associação não mediu a temperatura.','Porque a nascente fica fora do município.','Porque todos os exames deram resultado negativo.'], 'A própria notícia ressalva que análises específicas são indispensáveis.'),
    H('A decisão de divulgar inclusive resultados que contrariam suspeitas indica uma prioridade por', 'transparência e interpretação criteriosa das evidências.', ['notícias mais alarmantes para obter audiência.','supressão de dados inconvenientes à associação.','substituição da investigação por boatos.','proibição de participação dos moradores.'], 'A associação busca tornar o processo verificável, não apenas confirmar expectativas.')
   ]
  },
  {
   'title':'Dois convites para a maratona de leitura',
   'text':'''Texto 1 — Cartaz do grêmio: “Na sexta-feira, a partir das 14 horas, traga seu livro favorito ao pátio da escola. Teremos leitura compartilhada e troca de indicações. A participação é gratuita.” Texto 2 — Mensagem de uma estudante: “Eu não gostava de ler em voz alta, mas a última roda de leitura me fez perceber que as pausas e os comentários dos colegas ajudam a compreender melhor um conto. Nesta sexta, quero participar de novo.” Embora tratem do mesmo evento, os textos apresentam perspectivas diferentes: um informa a programação; o outro relata uma experiência pessoal que pode incentivar novos participantes.''',
   'questions':[
    E('Segundo o cartaz, a maratona de leitura começará', 'às 14 horas de sexta-feira.', ['às 8 horas de segunda-feira.','ao meio-dia de sábado.','às 18 horas de domingo.','às 10 horas de quinta-feira.'], 'O Texto 1 informa sexta-feira, a partir das 14 horas.'),
    M('O que levou a estudante a reconsiderar sua relação com a leitura em voz alta?', 'Perceber que a participação dos colegas favorece a compreensão.', ['Receber uma nota maior do que esperava.','Descobrir que a leitura individual estava proibida.','Encontrar livros obrigatórios para vender.','Assistir a um espetáculo musical no pátio.'], 'O testemunho relaciona pausas e comentários dos colegas à melhor compreensão.'),
    H('A diferença central entre os dois textos está no fato de que', 'o primeiro oferece informações práticas, enquanto o segundo usa uma vivência como argumento para participar.', ['ambos apresentam resultados de uma pesquisa científica.','o primeiro critica o evento e o segundo informa seus custos.','o primeiro narra uma memória e o segundo estabelece regulamentos.','ambos exigem pagamento para a participação.'], 'O cartaz comunica dados organizacionais e o depoimento manifesta avaliação pessoal.')
   ]
  },
  {
   'title':'O mural das histórias esquecidas',
   'text':'''Quando a escola anunciou um projeto para registrar histórias do bairro, muitos estudantes pensaram em entrevistar apenas moradores conhecidos nas redes sociais. A professora sugeriu começar pelos porteiros, feirantes e trabalhadores da limpeza, que raramente apareciam nos arquivos oficiais. As entrevistas revelaram mudanças no modo de usar a praça, na circulação dos ônibus e nas festas populares. O mural final reuniu fotografias, depoimentos e um aviso: “Memória coletiva não é a versão de uma pessoa; é uma conversa entre lembranças que às vezes se contradizem.” A turma percebeu que registrar diferenças também ajuda a compreender a história local.''',
   'questions':[
    E('Quais profissionais a professora sugeriu entrevistar no início do projeto?', 'Porteiros, feirantes e trabalhadores da limpeza.', ['Apenas artistas famosos e empresários.','Somente atletas e influenciadores.','Exclusivamente professores universitários.','Apenas funcionários do transporte aéreo.'], 'Esses três grupos são mencionados explicitamente como fontes pouco visíveis.'),
    M('Por que o mural reuniu depoimentos que nem sempre coincidiam?', 'Para representar diferentes memórias de uma mesma comunidade.', ['Para provar que nenhuma entrevista era confiável.','Para evitar que os estudantes apresentassem fotografias.','Para escolher uma versão única e obrigatória dos fatos.','Para substituir toda pesquisa por lembranças pessoais.'], 'O texto define a memória coletiva como diálogo entre relatos, inclusive divergentes.'),
    H('A frase apresentada no mural questiona principalmente a ideia de que', 'a história de uma comunidade pode ser explicada por um único ponto de vista.', ['fotografias impedem qualquer lembrança.','trabalhadores da cidade não possuem experiências relevantes.','a praça sempre teve exatamente a mesma função.','toda contradição entre relatos indica mentira intencional.'], 'A frase valoriza a pluralidade das lembranças, não uma narrativa isolada.')
   ]
  },
  {
   'title':'Solo vivo, colheita possível',
   'text':'''Durante uma visita a pequenas propriedades, a agrônoma Luísa observou que áreas cobertas com palha mantinham mais umidade nos dias quentes. Ela explicou que essa cobertura reduz a exposição direta do solo ao sol e ajuda a proteger a superfície contra o impacto das chuvas. Um agricultor perguntou se bastava espalhar palha para resolver qualquer problema de produtividade. Luísa respondeu que não: o manejo também depende de análise do solo, qualidade das sementes, disponibilidade de água e acompanhamento técnico. Ao final, a equipe distribuiu um guia com recomendações adaptáveis, não uma receita única para todas as propriedades.''',
   'questions':[
    E('Qual material era utilizado para cobrir parte do solo nas propriedades visitadas?', 'Palha.', ['Concreto.','Plástico colorido.','Areia de praia.','Pedras ornamentais.'], 'O texto cita explicitamente a cobertura com palha.'),
    M('A resposta da agrônoma ao agricultor mostra que', 'uma prática agrícola pode ajudar, mas não substitui a avaliação das condições locais.', ['o uso de palha é sempre prejudicial à produção.','as sementes não influenciam a produtividade.','todas as propriedades apresentam solo idêntico.','a análise do solo é desnecessária em pequenas propriedades.'], 'A agrônoma reconhece benefícios e também condicionantes do manejo.'),
    H('Ao afirmar que o guia não é uma “receita única”, o texto enfatiza', 'a necessidade de adaptar recomendações técnicas a contextos diversos.', ['a possibilidade de dispensar conhecimento técnico.','a superioridade de uma única solução para todos.','a inutilidade de registrar experiências agrícolas.','a obrigação de abandonar qualquer cobertura vegetal.'], 'A expressão rejeita soluções universais e destaca a especificidade de cada propriedade.')
   ]
  },
  {
   'title':'Vozes do mercado antigo',
   'text':'''Em um episódio do podcast escolar, dois comerciantes lembraram a reforma do mercado municipal. Para dona Celina, a nova cobertura resolveu goteiras que danificavam as mercadorias nos dias de chuva. Para seu Adalberto, as mudanças facilitaram a limpeza, mas afastaram algumas bancas tradicionais da entrada principal. Os estudantes não escolheram uma fala vencedora: apresentaram as duas versões e perguntaram aos ouvintes que melhorias poderiam preservar o patrimônio sem dificultar a vida dos trabalhadores. Ao publicar o episódio, acrescentaram as datas da reforma e as fontes consultadas, distinguindo recordações pessoais de informações documentadas.''',
   'questions':[
    E('Qual problema foi resolvido pela nova cobertura do mercado, segundo dona Celina?', 'As goteiras que atingiam mercadorias.', ['A falta de ônibus no bairro.','O preço das frutas importadas.','A ausência de escolas próximas.','A circulação de turistas no porto.'], 'Dona Celina atribui à cobertura a solução das goteiras.'),
    M('Por que os estudantes apresentaram as duas versões da reforma?', 'Porque a mesma mudança podia produzir benefícios e perdas para grupos diferentes.', ['Porque os comerciantes narraram acontecimentos de cidades distintas.','Porque nenhuma das duas pessoas conhecia o mercado.','Porque a reforma foi cancelada antes de começar.','Porque o podcast proibia opiniões pessoais.'], 'As experiências valorizam aspectos diferentes da mesma intervenção.'),
    H('A distinção entre memória pessoal e informação documentada contribui para', 'evitar que lembranças subjetivas sejam tratadas automaticamente como dados comprovados.', ['retirar legitimidade de toda experiência vivida.','demonstrar que datas e documentos não têm importância.','impedir a participação de comerciantes na produção do episódio.','substituir todos os relatos por propaganda institucional.'], 'Os produtores reconhecem valor das memórias sem confundi-las com registro verificável.')
   ]
  },
  {
   'title':'Energia solar: números e escolhas',
   'text':'''O conselho de uma escola avaliou a instalação de painéis solares. O orçamento inicial indicou alto investimento, mas a equipe de manutenção estimou economia ao longo dos anos. Uma representante dos estudantes perguntou se bastaria comparar o valor da conta de luz antes e depois. O técnico respondeu que seria necessário considerar a variação no número de turmas, os dias de funcionamento e as condições climáticas. Na reunião seguinte, o conselho aprovou um estudo de viabilidade e decidiu publicar os cálculos para consulta pública. A proposta, portanto, avançou como investigação, não como promessa de economia imediata.''',
   'questions':[
    E('Qual medida o conselho aprovou na reunião seguinte?', 'Um estudo de viabilidade dos painéis solares.', ['A demolição do prédio escolar.','A suspensão das aulas noturnas.','A instalação imediata sem orçamento.','A compra de geradores a diesel.'], 'O conselho aprovou um estudo de viabilidade, e não a instalação imediata.'),
    M('Por que a comparação simples entre contas de energia seria insuficiente?', 'Porque outras condições podem alterar o consumo entre os períodos observados.', ['Porque os painéis funcionam apenas à noite.','Porque a escola não possui equipamentos elétricos.','Porque as contas de energia não apresentam valores numéricos.','Porque a análise climática é proibida em escolas.'], 'Mudanças de uso e clima afetam o consumo e precisam ser consideradas.'),
    H('A passagem da promessa de economia para um estudo de viabilidade evidencia', 'uma decisão que distingue expectativa favorável de resultado demonstrado.', ['uma recusa definitiva de qualquer fonte renovável.','a certeza de que o investimento jamais será recuperado.','a aceitação de números sem contexto.','a eliminação da transparência na gestão.'], 'A decisão exige análise antes de concluir sobre benefício econômico.')
   ]
  },
  {
   'title':'Inscrições para o estágio de observação',
   'text':'''COMUNICADO — O centro cultural oferecerá vinte vagas para estágio de observação em produção de eventos. As inscrições ficarão abertas de 3 a 12 de agosto, por formulário eletrônico. Podem participar estudantes matriculados na 3ª série do Ensino Médio. A seleção considerará disponibilidade para dois encontros presenciais e uma carta breve de interesse. O comunicado esclarece que o estágio não corresponde a uma contratação e que não haverá pagamento. Em contrapartida, os participantes receberão declaração de frequência e acompanhamento de profissionais da área. Dúvidas serão atendidas pela equipe do centro cultural nos horários indicados no site.''',
   'questions':[
    E('Quantas vagas o centro cultural oferecerá para o estágio?', 'Vinte.', ['Dez.','Doze.','Trinta.','Cinquenta.'], 'O comunicado informa vinte vagas.'),
    M('Um estudante que espera receber salário deve compreender que', 'a atividade é formativa e não prevê remuneração.', ['a inscrição funciona como contrato de trabalho.','os encontros presenciais são opcionais para todos.','o pagamento depende apenas de uma boa carta.','a declaração de frequência substitui salário obrigatório.'], 'O comunicado nega contratação e pagamento, indicando natureza de observação.'),
    H('O trecho que diferencia estágio de observação e contratação cumpre a função de', 'delimitar expectativas e evitar interpretação equivocada da oferta.', ['prometer benefícios que não constam nas condições.','dispensar a leitura dos critérios de seleção.','indicar que a atividade envolve jornada profissional remunerada.','impedir que estudantes da 3ª série participem.'], 'A explicação explicita limites da oportunidade e protege o entendimento do público.')
   ]
  },
  {
   'title':'Celulares na sala: um debate',
   'text':'''Na reunião pedagógica, uma professora defendeu que celulares podem apoiar pesquisas rápidas e ampliar recursos de acessibilidade. Um colega ponderou que notificações constantes dificultam a concentração quando não há regras claras. Ao fim do encontro, o grupo evitou tratar a tecnologia como solução ou ameaça absoluta. A proposta foi definir objetivos didáticos para cada uso, garantir alternativas a estudantes sem aparelho e avaliar os resultados. A ata registrou que o principal desafio não é decidir se o celular é bom ou mau em qualquer situação, mas estabelecer critérios que tornem seu uso educacional e inclusivo.''',
   'questions':[
    E('Qual problema foi citado pelo professor que fez ressalvas ao uso dos celulares?', 'Notificações que atrapalham a concentração.', ['Falta de energia na biblioteca.','Excesso de livros didáticos.','Ausência de pátio coberto.','Impossibilidade de pesquisar na internet.'], 'O colega aponta as notificações constantes como risco à atenção.'),
    M('A decisão de oferecer alternativas aos estudantes sem aparelho busca', 'evitar que o uso de uma ferramenta aumente desigualdades de participação.', ['proibir que qualquer estudante pesquise.','substituir todas as aulas por atividades domésticas.','dispensar o planejamento dos professores.','garantir o mesmo modelo de telefone para todos.'], 'O acesso desigual a aparelhos exige formas equivalentes de participação.'),
    H('Qual posição sintetiza melhor a conclusão do debate?', 'A pertinência do celular depende da finalidade pedagógica, das regras e das condições de acesso.', ['Celulares devem ser usados em toda atividade, sem exceção.','Toda tecnologia compromete necessariamente a aprendizagem.','A única decisão relevante é o preço dos aparelhos.','O planejamento docente deixa de existir quando há dispositivos.'], 'A ata rejeita avaliações absolutas e defende critérios contextualizados.')
   ]
  },
  {
   'title':'A biblioteca que viaja de ônibus',
   'text':'''Um ônibus adaptado como biblioteca visita cinco comunidades rurais em semanas alternadas. A lista de paradas é divulgada pela rádio local e em cartazes nas unidades de saúde. No início do projeto, os organizadores mediam o sucesso apenas pelo total de empréstimos, mas perceberam que essa medida escondia uma dificuldade: muitas famílias não podiam ir até o ponto de parada no horário anunciado. A equipe passou a registrar também sugestões de itinerário e a alterar o calendário em diálogo com os moradores. Em uma avaliação recente, a coordenação afirmou que levar livros a um lugar não significa, necessariamente, torná-los acessíveis às pessoas.''',
   'questions':[
    E('Por quais meios é divulgada a lista de paradas do ônibus-biblioteca?', 'Pela rádio local e por cartazes nas unidades de saúde.', ['Somente por redes sociais pagas.','Exclusivamente por jornais nacionais.','Por anúncios em cinemas comerciais.','Apenas por mensagens individuais de professores.'], 'O texto identifica rádio local e cartazes nas unidades de saúde.'),
    M('Qual problema levou a equipe a rever a forma de avaliar o projeto?', 'Nem todas as famílias conseguiam chegar ao ônibus no horário divulgado.', ['Os livros foram substituídos por computadores.','A rádio local deixou de funcionar.','As comunidades passaram a receber ônibus todos os dias.','As unidades de saúde se recusaram a expor cartazes.'], 'A frequência aos pontos dependia de condições de deslocamento e horário.'),
    H('A afirmação final contrapõe principalmente', 'presença física de um recurso e possibilidade efetiva de utilizá-lo.', ['transporte terrestre e transporte marítimo.','leitura silenciosa e leitura em voz alta.','livros de ficção e livros de referência.','comunicação por rádio e comunicação por jornais.'], 'O projeto reconhece a diferença entre oferecer material e garantir acesso real.')
   ]
  },
  {
   'title':'Fotografias de um porto antigo',
   'text':'''No arquivo histórico da cidade, duas fotografias mostram a mesma rua do porto com cinquenta anos de diferença. Na primeira, carroças ocupam a via; na segunda, há ônibus e bicicletas. Uma legenda antiga afirmava que a primeira imagem representava “um tempo de maior tranquilidade”. A pesquisadora responsável pela exposição manteve a legenda original, mas acrescentou uma observação: fotografias mostram partes de uma cena e não permitem concluir, sozinhas, como todas as pessoas viviam naquela época. Para ampliar a exposição, o grupo reuniu relatos de trabalhadores, mapas e registros de comércio. A proposta é usar as imagens como fontes, sem confundi-las com retratos completos do passado.''',
   'questions':[
    E('Qual elemento de transporte aparece na fotografia mais antiga?', 'Carroças.', ['Metrôs.','Aviões.','Patinetes elétricos.','Barcos a motor na avenida.'], 'O texto indica carroças na primeira imagem.'),
    M('Por que a pesquisadora acrescentou uma observação à legenda?', 'Para lembrar que uma fotografia não comprova sozinha como era toda a vida social.', ['Para provar que a legenda era obrigatoriamente falsa.','Para ocultar a presença das carroças.','Para eliminar o uso de imagens como fonte histórica.','Para substituir as fotografias por desenhos imaginários.'], 'A observação aponta os limites de generalizar a partir de uma cena.'),
    H('O conjunto de fontes reunidas pela exposição permite', 'confrontar interpretações e construir uma compreensão histórica mais abrangente.', ['confirmar automaticamente qualquer lembrança nostálgica.','descartar todos os dados que não aparecem nas imagens.','afirmar que o passado tinha menos problemas apenas pela ausência de carros.','tratar a opinião da legenda como uma medição objetiva.'], 'Relatos, mapas e registros diversificam evidências e oferecem perspectiva crítica.')
   ]
  },
  {
   'title':'O plástico que volta como matéria-prima',
   'text':'''Uma cooperativa começou a receber embalagens plásticas separadas por moradores do bairro. O material passa por triagem, limpeza e preparação antes de ser enviado a empresas recicladoras. Em entrevista, a coordenadora explicou que reciclagem não elimina o problema do consumo excessivo: há embalagens difíceis de processar, perdas no transporte e custos de energia. Por isso, a campanha da cooperativa reúne três orientações: reduzir produtos descartáveis quando possível, reutilizar embalagens seguras e encaminhar resíduos corretamente. O cartaz conclui: “Separar é importante, mas consumir com atenção também faz parte da solução.”''',
   'questions':[
    E('O que acontece com o plástico antes de seguir às empresas recicladoras?', 'Ele passa por triagem, limpeza e preparação.', ['Ele é queimado em todas as casas.','Ele é transformado diretamente em alimentos.','Ele é lançado nos rios para transporte.','Ele é enterrado sem qualquer separação.'], 'O texto enumera triagem, limpeza e preparação.'),
    M('Por que a coordenadora considera insuficiente depender apenas da reciclagem?', 'Porque parte do problema decorre do consumo e dos limites do processamento de resíduos.', ['Porque nenhum plástico pode ser reciclado.','Porque toda embalagem reutilizada se torna tóxica.','Porque a triagem elimina todas as perdas de transporte.','Porque a reciclagem dispensa energia e logística.'], 'Os limites citados indicam que reciclar é uma parte, não a totalidade da resposta.'),
    H('A frase do cartaz amplia o sentido de responsabilidade ambiental ao', 'relacionar o descarte correto às decisões anteriores de consumo.', ['afirmar que a coleta seletiva não tem importância.','transferir toda a responsabilidade exclusivamente aos recicladores.','defender o aumento do uso de descartáveis para ajudar a cooperativa.','substituir o problema dos resíduos por uma questão de aparência das embalagens.'], 'O cartaz articula escolhas de compra, reutilização e separação de resíduos.')
   ]
  },
  {
   'title':'Notícia sobre o céu da madrugada',
   'text':'''Um grupo de estudantes acompanhou, durante duas semanas, as condições para observar estrelas no entorno da cidade. Em noites nubladas, poucos pontos luminosos ficaram visíveis. Em locais afastados de postes, o grupo registrou mais estrelas, embora o céu continuasse sendo o mesmo. No relatório, os estudantes explicaram que a diferença de visibilidade não significa aumento da quantidade de astros, mas influência da iluminação artificial e das nuvens. A escola vai divulgar o trabalho em uma feira de ciências e orientar o público a não transformar observações limitadas em conclusões gerais sobre o universo.''',
   'questions':[
    E('Por quanto tempo o grupo acompanhou as condições do céu?', 'Durante duas semanas.', ['Durante um único dia.','Durante seis meses.','Durante cinco anos.','Durante três horas.'], 'O primeiro período informa que o acompanhamento durou duas semanas.'),
    M('Por que os estudantes registraram mais estrelas em locais afastados de postes?', 'Porque a menor iluminação artificial favoreceu a observação.', ['Porque as estrelas se aproximaram fisicamente da cidade.','Porque o universo passou a conter mais astros.','Porque os postes mudaram a posição das constelações.','Porque as nuvens desapareceram apenas no relatório.'], 'A diferença de visibilidade está ligada à luminosidade e à cobertura de nuvens.'),
    H('O cuidado em não generalizar as observações reforça que', 'um resultado depende das condições e dos limites do procedimento utilizado.', ['qualquer observação escolar é incapaz de produzir conhecimento.','a quantidade de estrelas muda conforme o bairro.','os registros de uma única noite explicam todo o universo.','as condições ambientais não interferem em uma investigação.'], 'As conclusões são delimitadas pelo intervalo e pelas condições da observação.')
   ]
  },
  {
   'title':'A feira que mudou de endereço',
   'text':'''A feira de produtores passou da praça central para um espaço coberto próximo à rodoviária. A prefeitura destacou a proteção contra chuva e a existência de banheiros acessíveis. Parte dos comerciantes aprovou a mudança, mas outros reclamaram da dificuldade de atrair clientes habituais. Após ouvir feirantes e moradores, a administração instalou placas de orientação e reforçou uma linha de ônibus aos sábados. A associação dos produtores pediu uma nova avaliação dentro de seis meses. No comunicado conjunto, as entidades afirmaram que uma obra pode melhorar as condições de trabalho sem resolver automaticamente todas as necessidades de circulação e venda.''',
   'questions':[
    E('Para onde foi transferida a feira de produtores?', 'Para um espaço coberto próximo à rodoviária.', ['Para o estacionamento de um aeroporto.','Para a quadra de uma escola distante.','Para a praça central, onde já estava.','Para o porto de cargas.'], 'O texto aponta um espaço coberto próximo à rodoviária.'),
    M('Por que as placas de orientação e o reforço da linha de ônibus foram adotados?', 'Para facilitar o acesso de consumidores ao novo endereço.', ['Para impedir o funcionamento da feira aos sábados.','Para substituir as bancas por lojas virtuais.','Para ampliar os custos dos comerciantes.','Para encerrar a venda de produtos locais.'], 'As medidas respondem à dificuldade de circulação e de encontrar a nova feira.'),
    H('O pedido de reavaliação após seis meses pressupõe que', 'os efeitos da mudança precisam ser observados na prática e podem exigir ajustes.', ['a transferência já foi unanimemente aprovada.','a nova cobertura será desfeita necessariamente.','os comerciantes devem abandonar suas atividades.','a melhoria dos banheiros resolve todas as reclamações.'], 'A associação busca reunir evidências após a adaptação ao novo espaço.')
   ]
  },
  {
   'title':'O alerta que chegou antes da chuva',
   'text':'''Uma escola publicou em seu mural um aviso da Defesa Civil sobre a possibilidade de chuva forte no fim da tarde. A mensagem orientava a evitar travessias de áreas alagadas e acompanhar os canais oficiais. Alguns estudantes interpretaram o aviso como garantia de que haveria enchente; outros acharam que, por se tratar apenas de possibilidade, não precisavam tomar qualquer cuidado. Na aula seguinte, a professora explicou que alertas combinam previsão e prevenção: eles indicam risco, não um desfecho inevitável. A turma reformulou o aviso para deixar mais clara a diferença entre agir com prudência e afirmar um acontecimento como certo.''',
   'questions':[
    E('Qual órgão foi citado como responsável pelo aviso sobre chuva forte?', 'A Defesa Civil.', ['A biblioteca escolar.','O conselho de classe.','A secretaria de cultura.','A associação de esportes.'], 'O texto identifica a Defesa Civil como fonte do aviso.'),
    M('Qual compreensão equivocada os estudantes tiveram sobre o alerta?', 'Alguns confundiram indicação de risco com certeza de ocorrência.', ['Todos compreenderam a mensagem da mesma forma.','Todos deixaram de consultar fontes oficiais.','O aviso não apresentava qualquer orientação.','A mensagem tratava apenas de um evento cultural.'], 'O texto contrapõe interpretações extremas de certeza e despreocupação.'),
    H('A explicação da professora permite concluir que a função de um alerta é', 'orientar medidas preventivas diante de uma possibilidade relevante, sem apresentar previsão como fato consumado.', ['anunciar que o evento ocorrerá necessariamente em toda a cidade.','dispensar qualquer atitude enquanto não houver confirmação de dano.','substituir canais oficiais por rumores de mensagens privadas.','eliminar toda incerteza presente nos modelos meteorológicos.'], 'Alertas sustentam decisões prudentes sob risco, não garantias de resultado.')
   ]
  },
  {
   'title':'Sessão de cinema na praça',
   'text':'''O cineclube do bairro organizou uma exibição gratuita de curtas-metragens produzidos por jovens da região. Antes da sessão, uma voluntária explicou que o público poderia votar em seu filme favorito, mas essa votação não definiria a qualidade artística de cada obra. Depois, realizadores conversaram com os espectadores sobre escolhas de roteiro, fotografia e montagem. Alguns filmes receberam poucos votos e, ainda assim, provocaram debates longos. A organização avaliou o evento por diferentes critérios: participação, diversidade de produções e qualidade das conversas. A noite terminou sem um prêmio oficial, mas com a proposta de realizar novos encontros.''',
   'questions':[
    E('Quanto custou ao público assistir à exibição do cineclube?', 'Nada; a exibição foi gratuita.', ['Uma mensalidade obrigatória.','O preço de uma assinatura de streaming.','Uma taxa por curta-metragem.','O valor de um ingresso de cinema comercial.'], 'O evento é descrito como uma exibição gratuita.'),
    M('Por que a votação do público não foi considerada medida suficiente da qualidade dos filmes?', 'Porque popularidade e análise artística não são necessariamente equivalentes.', ['Porque os realizadores não compareceram ao debate.','Porque todos os filmes receberam os mesmos votos.','Porque a votação foi feita antes de qualquer exibição.','Porque a organização proibiu o público de opinar.'], 'A organização adverte que preferência não define, sozinha, qualidade artística.'),
    H('O fato de filmes pouco votados gerarem debates longos funciona como', 'evidência de que o interesse de uma obra pode ultrapassar a preferência medida por votos.', ['prova de que as obras mais votadas não merecem ser vistas.','garantia de que debates longos sempre indicam qualidade superior.','argumento para eliminar a participação do público.','sinal de que os espectadores não compreenderam nenhuma obra.'], 'O texto usa o contraste entre votos e conversas para ampliar critérios de avaliação.')
   ]
  },
  {
   'title':'Comida da estação no refeitório',
   'text':'''A equipe do refeitório escolar passou a consultar produtores locais para planejar o cardápio com alimentos disponíveis em cada estação. A nutricionista explicou que essa escolha poderia facilitar compras e reduzir o tempo de transporte de alguns produtos, mas não garantiria, por si só, uma alimentação equilibrada. Para isso, seria necessário considerar variedade, necessidades nutricionais e formas de preparo. Os estudantes participaram de uma pesquisa sobre desperdício e perceberam que porções muito grandes eram descartadas com frequência. O plano seguinte combinou planejamento de compras, ajustes nas porções e educação alimentar, em vez de apostar em uma única medida.''',
   'questions':[
    E('Quem foi consultado para planejar o cardápio com produtos da estação?', 'Produtores locais.', ['Motoristas de ônibus interestaduais.','Empresas de cinema.','Jornalistas esportivos.','Agências de turismo estrangeiro.'], 'O texto informa que a equipe consultou produtores locais.'),
    M('Por que escolher alimentos da estação não garante uma alimentação equilibrada?', 'Porque equilíbrio também depende de variedade, necessidades nutricionais e preparo.', ['Porque todo alimento da estação é inadequado.','Porque o transporte define sozinho o valor nutricional.','Porque nenhum produto local pode ser cozido.','Porque a escola deixou de servir refeições.'], 'A nutricionista acrescenta fatores complementares à origem e sazonalidade.'),
    H('A articulação entre compras, porções e educação alimentar expressa', 'uma resposta que relaciona diferentes causas e dimensões do desperdício.', ['a ideia de que basta diminuir todas as porções indiscriminadamente.','a conclusão de que produtores locais não têm papel no cardápio.','a defesa de um único procedimento independente das condições.','a substituição dos estudantes por decisões sem investigação.'], 'O plano é multifatorial: aquisição, distribuição e hábitos de consumo.')
   ]
  },
  {
   'title':'Tecnologia e verificação de notícias',
   'text':'''Em uma oficina sobre circulação de notícias, estudantes receberam duas mensagens sobre o fechamento de uma ponte. A primeira dizia “URGENTE: a ponte foi interditada” e não indicava fonte. A segunda apresentava um comunicado oficial, com data, localização e um período de manutenção programada. A turma comparou os textos e descobriu que a primeira mensagem exagerava o alcance da medida: apenas uma faixa estaria fechada durante algumas horas. A educadora observou que a palavra “urgente” pode chamar atenção, mas não substitui informações verificáveis. Ao final, os participantes criaram uma lista de conferência de autoria, data, contexto e evidências.''',
   'questions':[
    E('Que informação estava presente na segunda mensagem sobre a ponte?', 'Um comunicado oficial com data e localização.', ['Uma entrevista anônima sem referências.','Uma promoção comercial para motoristas.','Um poema sem indicação de lugar.','Uma enquete sobre filmes de ação.'], 'A segunda mensagem traz comunicado oficial, data e localização.'),
    M('Qual problema a turma identificou na primeira mensagem?', 'Ela apresentava como interdição total uma restrição parcial e temporária.', ['Ela informava a data exata da manutenção.','Ela era assinada pelo órgão responsável.','Ela indicava que uma faixa permaneceria aberta.','Ela apresentava todos os detalhes do comunicado oficial.'], 'O aviso sem fonte exagerava o alcance da obra.'),
    H('No contexto da oficina, o uso da palavra “urgente” é apresentado como', 'um recurso de apelo que pode aumentar a circulação de conteúdo sem garantir sua confiabilidade.', ['prova suficiente da autenticidade de qualquer notícia.','indicação obrigatória de uma fonte científica.','substituto de documentos e datas verificáveis.','garantia de que uma obra já foi concluída.'], 'A educadora contrasta apelo emocional com verificação documental.')
   ]
  },
  {
   'title':'Pequenos mapas de um grande bairro',
   'text':'''Ao representar o bairro em um mapa coletivo, a turma desenhou primeiro as ruas principais. Depois, moradores idosos lembraram caminhos de pedestres que não apareciam em aplicativos de navegação. Um desses trajetos havia sido fechado por uma obra, mas ainda era citado como referência nas conversas. Os estudantes marcaram no mapa tanto os caminhos acessíveis quanto aqueles que existiam apenas na memória local, usando símbolos diferentes. Na legenda, escreveram que um mapa é resultado de escolhas: mostrar certos elementos não significa que os demais sejam inexistentes ou sem importância. A atividade despertou discussões sobre acesso, história e atualização de informações.''',
   'questions':[
    E('Que pessoas ajudaram a lembrar trajetos ausentes dos aplicativos?', 'Moradores idosos.', ['Apenas turistas estrangeiros.','Somente jogadores de futebol.','Exclusivamente funcionários de companhias aéreas.','Apenas vendedores de aparelhos eletrônicos.'], 'Moradores idosos citaram caminhos que não apareciam nos aplicativos.'),
    M('Por que os estudantes criaram símbolos diferentes na legenda?', 'Para distinguir caminhos ainda acessíveis de trajetos preservados na memória.', ['Para eliminar todas as ruas principais.','Para identificar o preço das casas.','Para ocultar os trajetos conhecidos.','Para mostrar apenas os caminhos disponíveis em aplicativos.'], 'A legenda diferencia situação atual e referência histórica.'),
    H('A frase de que todo mapa resulta de escolhas chama atenção para', 'o caráter seletivo de qualquer representação espacial.', ['a ideia de que todo mapa é necessariamente falso.','a impossibilidade de usar símbolos gráficos.','a obrigação de representar todos os elementos sem critério.','o fato de que a memória local nunca contribui para a cartografia.'], 'Mapas selecionam aspectos da realidade conforme objetivos e fontes.')
   ]
  },
]

assert len(contexts)==19, len(contexts)
path=ROOT/'data'/'questions.json'
source=json.loads(path.read_text(encoding='utf8'))
if len(source['questions'])==147:
    print('Banco v1.0.2 já complementado; nenhuma alteração aplicada.')
    raise SystemExit(0)
assert len(source['questions'])==90
assert sum(q['origem']=='coletanea_paebes_2024' for q in source['questions'])==57
new=[]
for i,ctx in enumerate(contexts):
    assert len(ctx['questions'])==3
    for j,(difficulty,descriptor,stem,right,wrong,reason) in enumerate(ctx['questions']):
        number=34+i*3+j
        # Gabaritos in different positions; the original authored items are unchanged.
        k=(number*3+1)%5
        options=list(wrong)
        options.insert(k,right)
        new.append({
            'id':f'AUT-2026-{number:03d}',
            'origem':'autoral_baseada_em_descritores_da_coletanea',
            'titulo':ctx['title'],
            'numero_original':None,
            'fonte':'Questão autoral produzida para O Tesouro das Palavras (2026); não é questão oficial PAEBES.',
            'descritor':descriptor,'dificuldade':difficulty,
            'texto_base':ctx['text'], 'enunciado':stem,
            'alternativas':[{'id':chr(65+q),'texto':v} for q,v in enumerate(options)],
            'gabarito':{'alternativa':chr(65+k),'validado':True,'situacao':'autoral_com_resposta_justificada'},
            'justificativa':reason,
            'dica':'Localize informações do texto e examine a relação entre as ideias antes de selecionar a alternativa.',
            'avaliavel':True,
            'imagens_original':[]
        })
assert len(new)==57
assert len(set(q['id'] for q in new))==57
source['questions'].extend(new)
source['total']=147;source['originais']=57;source['autorais']=90;source['avaliaveis']=90
source['observacao']='90 questões autorais avaliáveis para 30 baús (3 por baú); 57 itens reproduzidos do PDF seguem preservados para consulta, sem gabaritos oficiais. Os itens originais não serão avaliados sem validação docente.'
path.write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
originals=json.loads((ROOT/'data'/'questions.autorais.json').read_text(encoding='utf8'))
originals['questions'].extend(new); originals['total']=90
(ROOT/'data'/'questions.autorais.json').write_text(json.dumps(originals,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

# Each chest retains its v1.0.1 primary question, receives two dedicated reserve questions.
placements=json.loads((ROOT/'data'/'atribuicoes.json').read_text(encoding='utf8'))
base=dict(placements['treasureQuestions'])
extras={level:[] for level in ['Fácil','Médio','Difícil']}
for q in source['questions']:
    if q['id'] in ['AUT-2026-031','AUT-2026-032','AUT-2026-033'] or q in new:
        extras[q['dificuldade']].append(q['id'])
assert all(len(v)==20 for v in extras.values()), {x:len(y) for x,y in extras.items()}
from collections import defaultdict
used=defaultdict(int)
for chest,primary in base.items():
    num=int(chest.split('-')[0][1:]);diff=['Fácil','Médio','Difícil'][int(chest.split('-')[1][1:])-1]
    index=used[diff];used[diff]+=2
    base[chest]=[primary,extras[diff][index],extras[diff][index+1]]
placements['schemaVersion']=2;placements['version']='v1.0.2';placements['treasureQuestions']=base;placements['reserveQuestions']=[]
placements['nota']='Três questões autorais com gabarito justificado e dificuldade correspondente por baú. Troca automática após cada erro. 57 questões do PDF preservadas, mas sem gabarito oficial e fora das fechaduras.'
(ROOT/'data'/'atribuicoes.json').write_text(json.dumps(placements,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
assigned=[q for ids in base.values() for q in ids]
assert len(assigned)==90 and len(set(assigned))==90
print('Banco gerado: 147 registros = 90 autorais avaliáveis + 57 originais preservados; 30 baús × 3 exclusivas.')
