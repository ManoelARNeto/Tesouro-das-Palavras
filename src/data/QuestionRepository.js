/** Repositório dos 57 itens originais da coletânea PAEBES 2024.
 * 50 respostas são confirmadas pelo gabarito enviado pelo professor.
 * 90 posições (30 baús × 3), com reutilização controlada entre baús.
 * Os sete itens sem resposta utilizável ficam apenas na consulta.
 */
export class QuestionRepository {
 constructor(){this.questions=[];this.byId=new Map();this.assignments={};}
 async load(){
  const [source,placements,approvals]=await Promise.all([
   this.readJSON('data/questions.json'),
   this.readJSON('data/atribuicoes.json'),
   this.readJSON('data/gabaritos-professor.json')
  ]);
  if(source.schemaVersion!==2||!Array.isArray(source.questions)||source.questions.length!==57)throw Error('Banco PAEBES original inválido.');
  if(approvals.schemaVersion!==2||!approvals.gabaritos)throw Error('Gabarito PAEBES fornecido não carregado.');
  const ids=new Set();
  for(const q of source.questions){
   if(q.origem!=='coletanea_paebes_2024'||!q.id||ids.has(q.id)||!Array.isArray(q.alternativas)||q.alternativas.length!==5)
    throw Error('Questão original inválida ou duplicada: '+q.id);
   const alternatives=q.alternativas.map(a=>a.id);
   if(new Set(alternatives).size!==5)throw Error('Alternativas repetidas: '+q.id);
   ids.add(q.id);
   const approved=approvals.gabaritos[q.id];
   // O dado corrigido não muda o texto-base, enunciado, ordem das alternativas ou imagens.
   if(approved?.validado===true && typeof approved.referencia==='string' && approved.referencia.trim().length>=8 && alternatives.includes(approved.alternativa)){
    q.gabarito={alternativa:approved.alternativa,validado:true,situacao:'gabarito_fornecido',referencia:approved.referencia};
    q.avaliavel=true;
   }else{q.gabarito={alternativa:null,validado:false,situacao:'pendente_de_gabarito'};q.avaliavel=false;}
  }
  this.questions=source.questions;
  this.byId=new Map(this.questions.map(q=>[q.id,q]));
  if(placements.schemaVersion!==3||Object.keys(placements.treasureQuestions||{}).length!==30)
    throw Error('São necessários 30 baús atribuídos ao gabarito PAEBES.');
  this.assignments={};const used=new Set();let slots=0;
  for(const [chest,assigned] of Object.entries(placements.treasureQuestions)){
   if(!Array.isArray(assigned)||assigned.length!==3||new Set(assigned).size!==3)
    throw Error('O baú '+chest+' precisa de três questões diferentes.');
   const qs=assigned.map(id=>this.find(id));
   if(qs.some(q=>!this.assessable(q)))throw Error('Questão sem gabarito no baú '+chest);
   if(new Set(qs.map(q=>q.dificuldade)).size!==1)throw Error('Dificuldades incompatíveis no baú '+chest);
   this.assignments[chest]=[...assigned];
   for(const id of assigned){used.add(id);slots++;}
  }
  if(slots!==90||used.size!==50)throw Error('A campanha requer 90 posições e 50 questões originais validadas distintas.');
  return this.questions.length;
 }
 async readJSON(url){const response=await fetch(url,{cache:'no-cache'});if(!response.ok)throw Error(`Arquivo indisponível: ${url} (${response.status})`);return response.json();}
 find(id){return this.byId.get(id)||null;}
 assessable(q){return !!q && q.origem==='coletanea_paebes_2024' && q.gabarito?.validado===true && q.alternativas.some(a=>a.id===q.gabarito.alternativa);}
 questionsForChest(chestId,difficulty){
  const qs=(this.assignments[chestId]||[]).map(id=>this.find(id));
  return qs.length===3&&qs.every(q=>this.assessable(q)&&q.dificuldade===difficulty)?qs:[];
 }
 /** Troca automaticamente Q1→Q2→Q3→Q1 em função das tentativas persistidas. */
 chestQuestion(chestId,difficulty,attempts=0,round=0){
  const qs=this.questionsForChest(chestId,difficulty);if(qs.length!==3)return null;
  const n=Number.isInteger(attempts)&&attempts>=0?attempts:0;
  const r=Number.isInteger(round)&&round>=0?round:0;
  return qs[(n+r)%3];
 }
 positionInChest(chestId,questionId){return (this.assignments[chestId]||[]).indexOf(questionId)+1;}
 statistics(){const result={originais:0,autorais:0,validas:0,pendentes:0};for(const q of this.questions){if(q.origem==='coletanea_paebes_2024')result.originais++;else result.autorais++;if(this.assessable(q))result.validas++;else result.pendentes++;}return result;}
}
