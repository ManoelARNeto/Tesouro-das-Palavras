import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {QuestionRepository} from '../src/data/QuestionRepository.js';
import {STAGES} from '../src/world/stages.js';
import {SaveManager} from '../src/core/SaveManager.js';
const root=path.resolve(import.meta.dirname,'..');
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const source=read('data/questions.json'),original=read('data/questions.original.json'),key=read('data/gabaritos-professor.json');
assert.equal(source.schemaVersion,2);assert.equal(source.questions.length,57);
assert.equal(source.autorais,0);assert.equal(key.schemaVersion,2);
assert.deepEqual(source.questions,original.questions,'As 57 questões originais devem permanecer sem alterações');
assert.equal(Object.values(key.gabaritos).filter(a=>a?.validado).length,50);
assert.equal(Object.values(key.gabaritos).filter(a=>!a).length,7);
assert.equal(key.divergencias_descritor.length,4);
for(const q of original.questions){
 assert.equal(q.origem,'coletanea_paebes_2024');assert.equal(q.alternativas.length,5);
 assert.equal(new Set(q.alternativas.map(a=>a.id)).size,5);
 for(const asset of q.imagens_original)assert.ok(fs.existsSync(path.join(root,asset.src)),`Imagem original ausente: ${asset.src}`);
}
const placed=read('data/atribuicoes.json');assert.equal(placed.schemaVersion,3);
assert.equal(Object.keys(placed.treasureQuestions).length,30);
const used=new Set();
for(const stage of STAGES)for(const chest of stage.treasures){
 const ids=placed.treasureQuestions[chest.id];
 assert.equal(ids.length,3,`Três itens no baú ${chest.id}`);
 assert.equal(new Set(ids).size,3,`Três itens diferentes no baú ${chest.id}`);
 for(const id of ids){
  const q=original.questions.find(x=>x.id===id);assert.ok(q,`Item PAEBES não encontrado: ${id}`);
  assert.ok(key.gabaritos[id]?.validado,`Item sem gabarito: ${id}`);
  assert.equal(q.dificuldade,chest.difficulty,`Dificuldade incompatível no baú ${chest.id}`);used.add(id);
 }
}
assert.equal(used.size,50,'Todas as 50 questões com gabarito devem aparecer nos 30 baús');
const store={};const storage={getItem:k=>store[k]??null,setItem(k,v){store[k]=v},removeItem(k){delete store[k]}};
const save=new SaveManager(storage);
store['tesouro-das-palavras-v3']=JSON.stringify({version:3,currentStage:0,unlockedStages:[0],stageStates:{'praia-naufragos':{found:['s1-t1'],x:200,y:300,seconds:42}},settings:{zoom:2}});
const migrated=save.load();assert.deepEqual(migrated.stageStates['praia-naufragos'].dug,['s1-t1']);
assert.deepEqual(migrated.stageStates['praia-naufragos'].opened,[]);
save.save(migrated);assert.equal(save.load().version,6);
const originalFetch=globalThis.fetch;
globalThis.fetch=async url=>({ok:true,json:async()=>read(url)});
const repo=new QuestionRepository();await repo.load();
globalThis.fetch=originalFetch;
assert.deepEqual(repo.statistics(),{originais:57,autorais:0,validas:50,pendentes:7});
assert.equal(repo.assessable(repo.find('PAEBES-2024-01')),true);
for(const id of key.pendentes)assert.equal(repo.assessable(repo.find(id)),false,id);
for(const stage of STAGES)for(const chest of stage.treasures){
 const list=repo.questionsForChest(chest.id,chest.difficulty);
 assert.equal(list.length,3);list.forEach(q=>assert.equal(repo.assessable(q),true));
}
console.log('test-questions.mjs: 57 itens íntegros, 50 respostas conferidas, 7 pendências, 90 posições, 30 baús e migração OK');
