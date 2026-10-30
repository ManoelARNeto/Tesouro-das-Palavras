/** Banco estático: 90 itens (originais + autorais). Nunca avalia respostas sem gabarito validado. */
export class QuestionRepository {
  constructor(){ this.questions=[]; this.byId=new Map(); this.assignments={}; this.reserve=[]; }
  async load(){
    const [source, placements, approvals] = await Promise.all([
      this.readJSON('data/questions.json'), this.readJSON('data/atribuicoes.json'),
      this.readJSON('data/gabaritos-professor.json').catch(()=>({gabaritos:{}}))
    ]);
    if(source.schemaVersion!==2 || !Array.isArray(source.questions)) throw Error('Banco de questões v2 inválido.');
    const ids = new Set();
    for(const q of source.questions){
      if(!q.id || ids.has(q.id) || !Array.isArray(q.alternativas) || q.alternativas.length<2) throw Error('Questão incompleta ou duplicada: '+q.id);
      if(new Set(q.alternativas.map(a=>a.id)).size!==q.alternativas.length) throw Error('Alternativas duplicadas: '+q.id);
      ids.add(q.id);
      const approved=approvals.gabaritos?.[q.id];
      if(q.origem==='coletanea_paebes_2024' && approved && typeof approved==='object' && approved.validado===true &&
         typeof approved.referencia==='string' && approved.referencia.trim().length>=8 &&
         q.alternativas.some(a=>a.id===approved.alternativa)){
        q.gabarito={alternativa:approved.alternativa,validado:true,situacao:'validado_pelo_professor',referencia:approved.referencia};
        q.avaliavel=true;
      }
    }
    this.questions=source.questions; this.byId=new Map(this.questions.map(q=>[q.id,q]));
    this.assignments=placements.treasureQuestions||{};
    this.reserve=placements.reserveQuestions||[];
    for(const [chest,id] of Object.entries(this.assignments)){
      if(!this.assessable(this.find(id))) throw Error(`Baú ${chest} aponta para questão não validada: ${id}`);
    }
    return this.questions.length;
  }
  async readJSON(url){ const response=await fetch(url,{cache:'no-cache'}); if(!response.ok) throw Error(`Arquivo indisponível: ${url} (${response.status})`); return response.json(); }
  find(id){ return this.byId.get(id)||null; }
  assessable(q){ return !!q && q.gabarito?.validado===true && q.alternativas.some(a=>a.id===q.gabarito.alternativa); }
  chestQuestion(chestId, difficulty, overrideId=null){
    const q=this.find(overrideId||this.assignments[chestId]);
    return this.assessable(q) && q.dificuldade===difficulty ? q : null;
  }
  alternative(q, excludedIds=new Set(), correctIds=new Set()){
    if(!q)return null;
    return this.questions.find(c=> c.id!==q.id && c.dificuldade===q.dificuldade && c.descritor===q.descritor &&
      this.assessable(c) && !excludedIds.has(c.id) && !correctIds.has(c.id))||null;
  }
  statistics(){ const counts={originais:0,autorais:0,validas:0,pendentes:0}; for(const q of this.questions){ if(q.origem==='coletanea_paebes_2024')counts.originais++;else counts.autorais++; if(this.assessable(q))counts.validas++;else counts.pendentes++; }return counts; }
}
