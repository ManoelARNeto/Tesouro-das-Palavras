/** Estrutura preparada para a Etapa 4; ainda não integra a jogabilidade da Etapa 2. */
export class QuestionRepository {
 constructor(){this.questions=[];}
 async load(url='data/questions.demo.json'){
  const response=await fetch(url);if(!response.ok)throw Error(`Banco indisponível: ${response.status}`);
  const obj=await response.json();if(obj.schemaVersion!==1||!Array.isArray(obj.questions))throw Error('Formato do banco de questões inválido');
  const ids=new Set();
  for(const q of obj.questions){
   if(typeof q.id!=='string'||ids.has(q.id)||typeof q.enunciado!=='string'||!Array.isArray(q.alternativas)||q.alternativas.length<2)throw Error('Questão inválida ou duplicada: '+q.id);
   ids.add(q.id);
   const options=new Set(q.alternativas.map(a=>a.id));
   if(options.size!==q.alternativas.length)throw Error('Alternativas repetidas: '+q.id);
  }
  this.questions=obj.questions;return this.questions.length;
 }
 /** Somente itens com gabaritos fundamentados podem entrar no sistema de avaliação. */
 assessable(){return this.questions.filter(q=>q.gabarito?.validado===true&&q.alternativas.some(a=>a.id===q.gabarito.alternativa));}
 find(id){return this.questions.find(q=>q.id===id)||null;}
}
