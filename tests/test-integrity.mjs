import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/MANIFESTO_INTEGRIDADE.json'),'utf8'));
let count=0;
for(const [rel,expected] of Object.entries(manifest.arquivos)){
 const filename=path.join(root,rel);
 assert.ok(fs.existsSync(filename),`Arquivo pedagógico não encontrado: ${rel}`);
 const hash=crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
 assert.equal(hash,expected,`O conteúdo foi alterado: ${rel}`);count++;
}
assert.equal(count,manifest.totalArquivos);
console.log(`test-integrity.mjs: ${count} arquivos pedagógicos preservados e verificados (SHA-256)`);
