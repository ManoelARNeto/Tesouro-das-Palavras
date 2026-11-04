"""Teste Chromium isolado: conteúdo e módulos inline para ambiente com navegação HTTP bloqueada.
Uso: /opt/pyvenv/bin/python tests/test-browser-rotation.py
"""
from pathlib import Path
import base64
import json
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
first_chest_ids=json.loads((ROOT/'data/atribuicoes.json').read_text(encoding='utf-8'))['treasureQuestions']['s1-t1']
question_lookup={q['id']:q for q in json.loads((ROOT/'data/questions.json').read_text(encoding='utf-8'))['questions']}
allowed_webp={asset['src'] for qid in first_chest_ids for asset in question_lookup[qid]['imagens_original']}
image_assets={}
for p in (ROOT/'assets').rglob('*'):
    if p.suffix.lower() not in {'.png','.webp'}:continue
    rel=p.relative_to(ROOT).as_posix()
    if p.suffix.lower()=='.webp' and rel not in allowed_webp:continue
    image_assets[rel]=('data:image/webp;base64,' if p.suffix.lower()=='.webp' else 'data:image/png;base64,')+base64.b64encode(p.read_bytes()).decode()
json_assets={}
for filename in ['data/questions.json','data/atribuicoes.json','data/gabaritos-professor.json']:
    json_assets[filename]=json.loads((ROOT/filename).read_text(encoding='utf-8'))
cache={}
def linked_module(rel):
    if rel in cache:return cache[rel]
    code=(ROOT/rel).read_text(encoding='utf-8')
    def replace(match):
        prefix,loc=match.groups()
        target=(Path(rel).parent/loc).as_posix()
        # Normalize relative paths with ..
        target=__import__('posixpath').normpath(target)
        return prefix+'"'+linked_module(target)+'"'
    code=re.sub(r'(from\s+|import\s+)[\'\"](\.{1,2}/[^\'\"]+)[\'\"]',replace,code)
    result='data:text/javascript;base64,'+base64.b64encode(code.encode('utf-8')).decode()
    cache[rel]=result
    return result

html=(ROOT/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="styles/main.css">','<style>'+(ROOT/'styles/main.css').read_text(encoding='utf-8')+'</style>')
bootstrap='''
<script>
const resources=%s;
const jsonData=%s;
const saved=new Map();
Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>saved.get(key)||null,setItem:(key,v)=>saved.set(key,String(v)),removeItem:key=>saved.delete(key),clear:()=>saved.clear()}});
window.fetch=async url=>{ const key=String(url); if(!(key in jsonData))throw Error('Fetch de recurso desconhecido: '+key); return {ok:true,json:async()=>structuredClone(jsonData[key])}; };
const imgDescriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,get(){return imgDescriptor.get.call(this)},set(v){return imgDescriptor.set.call(this,resources[String(v)]||v)}});
</script>
''' % (json.dumps(image_assets),json.dumps(json_assets,ensure_ascii=False))
html=html.replace('<script type="module" src="src/main.js"></script>',bootstrap+'<script type="module">import "'+linked_module('src/main.js')+'";</script>')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    print('HTML incorporado montado, bytes:',len(html),flush=True)
    page.set_content(html,wait_until='domcontentloaded',timeout=45000)
    print('page content loaded',flush=True)
    page.wait_for_function("window.__tesouroGame && window.__tesouroGame.questions.questions.length === 57 && window.__tesouroGame.ui.screen === 'menu'",timeout=30000)
    print('game initialized',flush=True)
    page.locator('#btn-new').click()
    page.wait_for_function("window.__tesouroGame.state === 'playing'",timeout=10000)
    page.evaluate('''()=>{
        const game=window.__tesouroGame;
        game.world.excavate('s1-t1');
        game.saveCurrentStage();
        game.openChestQuestion('s1-t1');
    }''')
    page.wait_for_function("window.__tesouroGame.state === 'question'",timeout=10000)
    # Item original validado, inclusive sua reprodução visual, deve aparecer no baú.
    assert page.locator('.original-figure img').count()>0, 'A questão deve manter imagem do PDF'
    page.wait_for_function("[...document.querySelectorAll('.original-figure img')].some(img=>img.complete && img.naturalWidth>0)",timeout=5000)
    print('question screen ready',flush=True)
    ids=[]
    for step in range(4):
        q=page.evaluate('window.__tesouroGame.activeQuestion')
        ids.append(q['id'])
        if step<3:
            wrong=next(a['id'] for a in q['alternativas'] if a['id']!=q['gabarito']['alternativa'])
            page.locator(f'input[name="question-answer"][value="{wrong}"]').check()
            page.locator('#btn-question-confirm').click()
            page.wait_for_function('(expected)=>window.__tesouroGame.activeQuestion.id !== expected',arg=q['id'])
            assert page.locator('#question-notice').is_visible(), 'Aviso da nova questão deve aparecer'
            assert page.locator('#question-panel').evaluate('(el)=>el.scrollTop')==0
            if step==0:
                page.screenshot(path=str(ROOT/'docs'/'questao_2_apos_erro_celular.png'))
                # Fechar a questão e inspecionar novamente o mesmo baú deve reabrir Q2.
                page.locator('#btn-question-close').click()
                assert page.evaluate('window.__tesouroGame.state')=='playing'
                page.evaluate("window.__tesouroGame.openChestQuestion('s1-t1')")
                assert page.evaluate('window.__tesouroGame.activeQuestion.id')!=q['id']
        else:
            page.locator(f'input[name="question-answer"][value="{q["gabarito"]["alternativa"]}"]').check()
            page.locator('#btn-question-confirm').click()
            assert page.locator('#question-feedback').is_visible()
            state=page.evaluate('''()=>({opened:[...window.__tesouroGame.world.opened],coins:window.__tesouroGame.economy.coins,attempts:window.__tesouroGame.stageStates[window.__tesouroGame.stage.id].attempts['s1-t1']})''')
            assert 's1-t1' in state['opened'] and state['coins']==10 and state['attempts']==4, state
    assert len(set(ids[:3]))==3 and ids[0]==ids[3], ids
    assert all(item.startswith('PAEBES-2024') for item in ids),ids
    assert not errors, errors
    page.screenshot(path=str(ROOT/'docs'/'previa-troca-automatica.png'),full_page=True)
    desktop=browser.new_page(viewport={'width':1280,'height':800})
    desktop.on('pageerror',lambda e: errors.append(str(e)))
    desktop.set_content(html,wait_until='domcontentloaded',timeout=45000)
    desktop.wait_for_function("window.__tesouroGame && window.__tesouroGame.ui.screen === 'menu'",timeout=30000)
    desktop.locator('#btn-new').click()
    desktop.evaluate("()=>{window.__tesouroGame.world.excavate('s1-t1');window.__tesouroGame.saveCurrentStage();window.__tesouroGame.openChestQuestion('s1-t1')}")
    desktop.wait_for_function("window.__tesouroGame.state === 'question'",timeout=10000)
    q=desktop.evaluate('window.__tesouroGame.activeQuestion')
    wrong=next(a['id'] for a in q['alternativas'] if a['id']!=q['gabarito']['alternativa'])
    desktop.locator(f'input[name="question-answer"][value="{wrong}"]').check()
    desktop.locator('#btn-question-confirm').click()
    desktop.wait_for_function('(old)=>window.__tesouroGame.activeQuestion.id!==old',arg=q['id'])
    assert desktop.locator('#question-notice').is_visible()
    desktop.screenshot(path=str(ROOT/'docs'/'questao_2_apos_erro_desktop.png'))
    assert not errors, errors
    browser.close()
    print('Chromium integrado: inicialização, janela do baú, 3 erros / 3 trocas, 4º acerto, 10 moedas, aviso móvel, sem erros JS. IDs:',ids)
