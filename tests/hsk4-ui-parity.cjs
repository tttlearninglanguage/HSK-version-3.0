/* Compare actual HSK 3/4 components, using the HSK 3 stylesheet as the source of truth. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'hsk3.html'),'utf8');
const blocks=[...source.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
const expected='/* Generated from hsk3.html by scripts/sync-hsk3-theme.py. Keep original cascade order. */\n'+blocks.map(([_,a,css],i)=>'/* HSK 3 style block '+i+' '+a.trim()+' */\n'+css).join('\n')+'\n';
assert.equal(fs.readFileSync(path.join(root,'HSK4/hsk3-theme.css'),'utf8'),expected,'HSK 4 must use the exact existing HSK 3 CSS cascade');
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end('Missing')}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;const errors=[];
 try{for(const width of [1440,390]){
  const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const p3=await ctx.newPage(),p4=await ctx.newPage();
  for(const p of [p3,p4]){p.on('pageerror',e=>errors.push(e.message));await p.route('https://fonts.googleapis.com/**',r=>r.abort())}
  await p3.goto(base+'/hsk3.html');await p4.goto(base+'/HSK4/index.html');await p4.waitForFunction(()=>window.HSK4);for(const p of [p3,p4])await p.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
  const props=['fontFamily','fontSize','fontWeight','lineHeight','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderTopStyle','borderTopColor','borderRadius','boxShadow','backgroundColor','display'];
  async function match(selector,label,properties=props){await Promise.all([p3.mouse.move(0,0),p4.mouse.move(0,0)]);const read=([selector,properties])=>{const el=document.querySelector(selector);if(!el)throw Error('Missing '+selector);const s=getComputedStyle(el);return Object.fromEntries(properties.map(k=>[k,s[k]]))};const a=await p3.evaluate(read,[selector,properties]),b=await p4.evaluate(read,[selector,properties]);assert.deepEqual(b,a,label+' at '+width);checks++}
  async function overflow(p,screen){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),screen+' must not overflow at '+width);checks++}
  async function screen(tab){await p3.evaluate(tab=>openLesson(1,tab),tab);await p4.goto(base+'/HSK4/index.html#lesson/1/'+tab);await p4.waitForSelector('#content')}
  await match('.qh-top','home banner');await match('.qh-top h1','course title');await match('.qh-card','lesson card');await match('.qh-card .qh-title','lesson card title');await match('.qh-utility','home shortcut');await match('.qh-home','home padding',['paddingLeft','paddingRight']);
  assert.equal(await p4.locator('.qh-card').count(),10);assert.equal(await p4.locator('.qh-card[href]').count(),1);assert(await p4.locator('.study-hero-art img').evaluate(img=>img.complete&&img.naturalWidth>0));await overflow(p4,'home');
  // Course search remains useful while only one lesson is open.
  await p4.locator('#lessonSearch').fill('我们');assert.equal(await p4.locator('.lesson-card:visible').count(),1);await p4.locator('#lessonSearch').fill('not-a-lesson');assert(await p4.locator('#lessonEmpty').isVisible());await p4.locator('#lessonSearch').fill('');checks+=3;
  for(const tab of ['words','grammar','flash','games']){
   await screen(tab);await match('.unit-title-banner','lesson banner');await match('.unit-title-banner h2','lesson heading');await match('.tabs button.active','active lesson tab');
   if(tab==='words'){await match('.tablewrap','vocabulary table panel');await match('table th','table heading');await match('table .hanzi','word typography');assert.equal(await p4.locator('tbody tr').count(),40);assert.equal(await p4.locator('.hsk4-word-pos').count(),40);assert.equal(await p4.locator('.word-grid').count(),0);}
   if(tab==='grammar'){for(const selector of ['.h2-section-intro','.h2-ref-grammar','.h2-ref-formula','.h2-ref-example','.h2-ref-pinyin'])await match(selector,selector)}
   if(tab==='flash'){
    await match('.hsk-unit-flash-panel','flash panel');await match('#hskUnitFlashCard','flash card');await match('.hsk-unit-flash-filters button.active','flash filter');await match('#hskUnitFlashActions .primary','flash next');
    await p3.locator('#hskUnitFlashCard').click();await p4.locator('#hskUnitFlashCard').click();await match('#hskUnitFlashCard h2','flash pinyin');await match('.hsk-unit-flash-example','flash example');
    assert(await p4.locator('#hskUnitFlashCard .hsk3-example-pin').textContent());
    const sourceIds=await p4.evaluate(()=>HSK4.lesson.words.map(w=>w.id));await p4.locator('[data-action="flash-shuffle"]').click();assert.deepEqual(await p4.evaluate(()=>HSK4.lesson.words.map(w=>w.id)),sourceIds,'shuffle must not mutate source order');
    await p4.locator('[data-action="known"]').click();await p4.locator('[data-filter="known"]').click();assert((await p4.locator('.hsk-unit-flash-status').innerText()).includes('1/1'));await p4.locator('[data-filter="unknown"]').click();assert((await p4.locator('.hsk-unit-flash-status').innerText()).includes('/39'));checks+=4;
   }
   if(tab==='games'){await match('.game-group-title','game grouping');await match('.game-card','game tile');await match('.game-card h3','game title');assert.equal(await p4.locator('.game-card').count(),18);assert.equal(await p4.locator('.game-groups>section').count(),6);}
   await overflow(p4,tab);
   if(process.env.HSK4_SCREENSHOTS){await p4.evaluate(()=>scrollTo(0,0));await p4.screenshot({path:path.join(process.env.HSK4_SCREENSHOTS,'hsk4-revised-'+tab+'-'+width+'.png'),fullPage:false})}
  }
  await p3.evaluate(()=>{openLesson(1,'games');startGame('hanzi')});await p4.locator('[data-mode="hanzi"]').click();for(const selector of ['.exercise-shell','.exercise-panel','.exercise-question','.exercise-actions','.exercise-options','.option'])await match(selector,selector);assert.equal(await p4.locator('#voiceSelect').count(),1);await overflow(p4,'question');
  await p3.evaluate(()=>{openLesson(1,'games');h2StartReading(-1)});await p4.goto(base+'/HSK4/index.html#lesson/1/games');await p4.locator('[data-mode="passages"]').click();for(const selector of ['.h2-reading-layout','.h2-passage','.h2-passage-text','.h2-reading-question'])await match(selector,selector);await overflow(p4,'reading');
  await p3.evaluate(()=>{openLesson(1,'games');startGuidedWriting()});await p4.goto(base+'/HSK4/index.html#lesson/1/games');await p4.locator('[data-mode="writing"]').click();await match('.answer-area','guided writing panel');await match('.guided-words','guided words');await overflow(p4,'writing');
  for(const view of ['review','stats']){await p3.evaluate(view=>view==='review'?showReview():showStats(),view);await p4.goto(base+'/HSK4/index.html#'+view);await match('.dash-banner',view+' banner');await match('.dash-banner h1',view+' heading');await match('.dash-section',view+' section');if(view==='stats')await match('.dash-stat',view+' stat card');await overflow(p4,view)}
  console.log('PASS '+width+'px: actual HSK 3/4 computed component styles match across home, words, grammar, flash, games, question, reading, writing, review and stats');await ctx.close();
 }
 assert.deepEqual(errors,[]);console.log('PASS '+checks+' visual parity and interaction checks; exact HSK 3 stylesheet cascade.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
