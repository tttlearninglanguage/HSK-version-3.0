const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
const server=http.createServer((req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/HSK-version-3.0\//,'');let file=path.resolve(root,relative==='/'?'index.html':relative.replace(/^\//,''));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end('missing')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/HSK-version-3.0';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const errors=[];let checks=0;
try{for(const width of [1440,390]){
const ctx=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
await page.route('https://fonts.googleapis.com/**',r=>r.abort());
await page.addInitScript(()=>{window.__spoken=[];if(window.speechSynthesis){speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>{window.__spoken.push(u.text);u.onstart?.()}}});
await page.goto(base+'/index.html');await page.locator('a[href="./HSK4/index.html"]').click();await page.waitForFunction(()=>window.HSK4);assert.equal(await page.locator('.lesson-card').count(),10);assert.equal(await page.locator('.lesson-card[href]').count(),1);assert((await page.locator('body').innerText()).includes('Sắp ra mắt'));
await page.evaluate(()=>{for(const k of ['hsk1-quest-v1','hsk2-quest-v1','hsk3-quest-v1','hsk-voice','hsk3-voice'])localStorage.setItem(k,'unchanged')});
await page.goto(base+'/HSK4/index.html#lesson/1/words');await page.waitForFunction(()=>window.HSK4);assert.equal(await page.locator('.word-card').count(),40);await page.locator('#wordSearch').fill('thị thực');assert.equal(await page.locator('.word-card').count(),1);await page.locator('#wordSearch').fill('');await page.locator('.word-card [data-action="known"]').first().click();await page.reload();await page.waitForFunction(()=>window.HSK4);assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk4-quest-v1')).known['hsk4-L01-01']));
await page.locator('[data-action="unknown-only"]').click();assert.equal(await page.locator('.word-card').count(),39);await page.locator('[data-action="unknown-only"]').click();await page.locator('[data-action="hide-pin"]').click();assert.equal(await page.locator('.word-card .pin').count(),0);await page.locator('[data-action="hide-pin"]').click();checks+=8;
await page.goto(base+'/HSK4/index.html#lesson/1/grammar');assert.equal(await page.locator('.grammar-card').count(),4);
await page.goto(base+'/HSK4/index.html#lesson/1/flash');await page.locator('#hskUnitFlashCard').press('Enter');assert(await page.locator('#hskUnitFlashCard .meaning').count());await page.locator('[data-action="say"]').first().click();assert((await page.evaluate(()=>window.__spoken)).length);await page.locator('[data-action="flash-next"]').click();assert((await page.locator('#hskUnitFlashCard').innerText()).includes('入学'));checks+=4;
if(process.env.HSK4_SCREENSHOTS)await page.screenshot({path:path.join(process.env.HSK4_SCREENSHOTS,'hsk4-flash-'+width+'.png'),fullPage:true});
const modeIds=['hanzi','meaning','pinyin','listen','listen-sentence','type','dictation','cloze','order','translate','reading','speaking','grammar','grammar-order','grammar-write','passages','mixed'];
for(const mode of modeIds){
 await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.locator(`[data-mode="${mode}"]`).click();await page.waitForSelector('#answerArea');
 const q=await page.evaluate(()=>HSK4.getSession().questions[0]);
 if(q.options){await page.locator(`[data-action="answer"][data-index="${q.options.indexOf(q.answer)}"]`).click();}
 else if(q.tokens){const s=await page.evaluate(()=>HSK4.getSession());const unused=[...s.tiles];for(const token of q.tokens){const i=unused.findIndex(t=>t.text===token);const tile=unused.splice(i,1)[0];await page.locator(`[data-action="pick"][data-index="${tile.id}"]`).click()}await page.locator('[data-action="submit-order"]').click();}
 else{await page.locator('#typed').fill(q.answer);await page.locator('[data-action="submit-text"]').click();}
 assert(await page.locator('#feedback .result').count(),mode);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow in '+mode);const st=await page.evaluate(()=>HSK4.getSession());if(q.self){assert.equal(st.autoCount,0);assert.equal(st.selfCount,1)}else assert.equal(st.correct,1);checks++;
 if(mode==='passages'){
  const word=page.locator('.passage .lookup').first();await word.click();assert(await page.locator('#gloss .pin').innerText());const a=await word.boundingBox(),b=await page.locator('#gloss').boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);assert(b.y>=0&&b.y+b.height<=960+1);assert(Math.abs(b.y-a.y)<350);await page.keyboard.press('Escape');assert.equal(await page.locator('#gloss').count(),0);
  if(process.env.HSK4_SCREENSHOTS)await page.screenshot({path:path.join(process.env.HSK4_SCREENSHOTS,'hsk4-reading-'+width+'.png'),fullPage:true});
  for(let i=1;i<12;i++){await page.locator('[data-action="next"]').click();const next=await page.evaluate(()=>HSK4.getSession().questions[HSK4.getSession().index]);await page.locator(`[data-action="answer"][data-index="${next.options.indexOf(next.answer)}"]`).click()}
  await page.locator('[data-action="next"]').click();assert((await page.locator('main').innerText()).includes('12 / 12'));checks+=12;
 }
}
// Wrong answers persist and cannot earn a second point by double clicking.
await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.locator('[data-mode="hanzi"]').click();const wrong=await page.evaluate(()=>{const q=HSK4.getSession().questions[0];return {i:q.options.findIndex(x=>x!==q.answer),id:q.wordId}});await page.locator(`[data-index="${wrong.i}"][data-action="answer"]`).click();assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('hsk4-quest-v1')).wrong[id],wrong.id),1);
await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.locator('[data-mode="writing"]').click();await page.locator('#writingText').fill('我来中国学习中文。');await page.reload();await page.waitForFunction(()=>window.HSK4);assert.equal(await page.locator('#writingText').inputValue(),'我来中国学习中文。');await page.locator('[data-action="show-writing"]').click();assert(await page.locator('#writingSample').isVisible());checks+=3;
await page.goto(base+'/HSK4/index.html#review');await page.locator('#reviewScope').selectOption('wrong');await page.locator('[data-action="review-start"]').click();assert.equal(await page.evaluate(()=>HSK4.getSession().questions.length),1);await page.locator('.exercise>a').click();assert(page.url().endsWith('#review'));
await page.goto(base+'/HSK4/index.html#stats');assert((await page.locator('main').innerText()).includes('Đọc hiểu theo đoạn'));
const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-action="export"]').click()]);const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.course,'hsk4');assert.equal(backup.draft,'我来中国学习中文。');
await page.locator('#importFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"course":"hsk3"}')});await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Không nhập'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk4-quest-v1')).history.length),1);
await page.locator('[data-action="reset"]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('hsk4-quest-v1')),null);await page.locator('#importFile').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Đã nhập'));assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk4-quest-v1')).history.length),1);checks+=6;
for(const key of ['hsk1-quest-v1','hsk2-quest-v1','hsk3-quest-v1','hsk-voice','hsk3-voice'])assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'unchanged');
await page.goto(base+'/HSK4/index.html#home');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(process.env.HSK4_SCREENSHOTS)await page.screenshot({path:path.join(process.env.HSK4_SCREENSHOTS,'hsk4-home-'+width+'.png'),fullPage:true});
await page.goto(base+'/HSK4/index.html#lesson/11/words');assert(await page.locator('h1').innerText()==='HSK 4 VERSION 3.0');await page.locator('.hsk-logo').click();assert(page.url().endsWith('/index.html'));checks+=7;
// Complete full banks to verify score aggregation and result persistence.
for(const [mode,total] of [['cloze',40],['grammar',4],['mixed',40]]){
 await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.locator('#questionCount').selectOption('40');await page.locator(`[data-mode="${mode}"]`).click();
 assert.equal(await page.evaluate(()=>HSK4.getSession().questions.length),total);
 for(let i=0;i<total;i++){const q=await page.evaluate(()=>HSK4.getSession().questions[HSK4.getSession().index]);await page.locator(`[data-action="answer"][data-index="${q.options.indexOf(q.answer)}"]`).click();await page.locator('[data-action="next"]').click()}
 assert((await page.locator('main').innerText()).includes(total+' / '+total+' câu đúng'));checks+=total;
}
await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.locator('[data-mode="hanzi"]').click();await page.goBack();assert.equal(await page.locator('.game-card').count(),18);checks++;
console.log('PASS '+width+'px: modes, answers, source fields, lookup, drafts, backup, review, storage isolation, navigation');await ctx.close();
}assert.deepEqual(errors,[]);console.log('PASS '+checks+' checks; no browser exceptions; works under GitHub Pages repository prefix.');
}finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
