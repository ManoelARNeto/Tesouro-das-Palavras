import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {QuestionRepository} from '../src/data/QuestionRepository.js';
import {STAGES} from '../src/world/stages.js';
import {SaveManager} from '../src/core/SaveManager.js';
const project=path.resolve(import.meta.dirname,'..');
function read(relative){return JSON.parse(fs.readFileSync(path.join(project,relative),'utf8'));}
const data=read('data/questions.json');
assert.equal(data.schemaVersion,2);
assert.equal(data.questions.length,90);
const original=data.questions.filter(q=>q.origem==='coletanea_paebes_2024');
const authored=data.questions.filter(q=>q.origem.startsWith('autoral'));
assert.equal(original.length,57);assert.equal(authored.length,33);
assert.equal(original.filter(q=>q.numero_original).length,56);
assert.deepEqual(['Fácil','Médio','Difícil'].map(d=>authored.filter(q=>q.dificuldade===d).length),[11,11,11]);
for(const q of data.questions){
 assert.equal(q.alternativas.length,5,`${q.id} deve ter cinco alternativas`);
 assert.equal(new Set(q.alternativas.map(a=>a.id)).size,5,`${q.id} tem alternativas repetidas`);
 if(q.origem==='coletanea_paebes_2024'){
  assert.equal(q.gabarito.validado,false,`${q.id} não deve ser avaliada sem gabarito`);
  assert.ok(q.imagens_original.length>0,`${q.id} sem imagens do PDF`);
  for(const im of q.imagens_original)assert.ok(fs.existsSync(path.join(project,im.src)),`${q.id} tem asset faltando`);
 }else{
  assert.equal(q.gabarito.validado,true);
  assert.ok(q.justificativa);
  assert.ok(q.alternativas.some(a=>a.id===q.gabarito.alternativa));
 }
}
const placements=read('data/atribuicoes.json').treasureQuestions;
assert.equal(Object.keys(placements).length,30);
for(const [si,s] of STAGES.entries())for(const [ti,t] of s.treasures.entries()){
 const q=authored.find(q=>q.id===placements[t.id]);
 assert.ok(q,`sem questão para ${t.id}`);
 assert.equal(q.dificuldade,t.difficulty);
}
const stored={};const storage={getItem:key=>stored[key]??null,setItem:(key,value)=>{stored[key]=value},removeItem:key=>{delete stored[key]}};
const saver=new SaveManager(storage);
stored['tesouro-das-palavras-v3']=JSON.stringify({version:3,currentStage:0,unlockedStages:[0],stageStates:{'praia-naufragos':{found:['s1-t1'],x:200,y:300,seconds:42}},settings:{zoom:2}});
const migrated=saver.load();
assert.deepEqual(migrated.stageStates['praia-naufragos'].dug,['s1-t1']);
assert.deepEqual(migrated.stageStates['praia-naufragos'].opened,[],'Baús já cavados na etapa 3 não são considerados respondidos');
saver.save(migrated);assert.equal(saver.load().version,4);
// Mock fetch to check public API
const oldFetch=globalThis.fetch;
globalThis.fetch=async url=>({ok:true,json:async()=>read(url)});
const repository=new QuestionRepository();await repository.load();
assert.deepEqual(repository.statistics(),{originais:57,autorais:33,validas:33,pendentes:57});
for(const s of STAGES)for(const t of s.treasures)assert.ok(repository.chestQuestion(t.id,t.difficulty));
assert.equal(repository.assessable(original[0]),false);
globalThis.fetch=oldFetch;
console.log('test-questions.mjs: 90 itens, 57 originais, 33 autorais, 30 baús, validação e migração OK');
