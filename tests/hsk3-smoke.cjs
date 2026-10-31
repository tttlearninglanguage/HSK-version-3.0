/* Run with Node.js and Playwright installed: node tests/hsk3-smoke.cjs */
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const topicData=JSON.parse(fs.readFileSync(path.join(root,'hsk3.html'),'utf8').match(/const TOPICS=(\[.*\]);/)[1]);
const source=JSON.parse(fs.readFileSync(path.join(root,'hsk3-source-manifest.json'),'utf8'));
(async()=>{
 const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;try{const file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end('Not found')}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const failures=[];let checks=0;
 try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const context=await browser.newContext({viewport,reducedMotion:'reduce'});const page=await context.newPage();
 page.on('pageerror',e=>failures.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 // Capture speech calls without depending on OS voices or actual microphone input.
 await page.addInitScript(()=>{window.__spoken=[];if(window.speechSynthesis){speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>window.__spoken.push({text:u.text,lang:u.lang})}});
 await page.goto(url+'/index.html');await page.locator('a.level[href="./hsk3.html"]').click();assert.equal(await page.title(),'HSK 3 Learning Quest');assert.equal(await page.locator('.qh-card').count(),18);checks++;
 await page.evaluate(()=>{localStorage.setItem('hsk2-quest-v1','unchanged-hsk2');localStorage.setItem('hsk1-quest-v1','unchanged-hsk1');localStorage.setItem('hsk2-topics-v2','unchanged-hsk2-topics')});
 // Match every source vocabulary cell (including repeats) and every grammar example.
 const data=await page.evaluate(()=>window.HSK_LESSONS);
 assert.equal(data.reduce((n,l)=>n+l.words.length,0),483);assert.equal(data.reduce((n,l)=>n+l.structuredGrammar.length,0),63);
 for(const l of data){const row=source.lessons.find(x=>x.id===l.id);const cells=l.words.map(w=>[w.hanzi,w.pinyin,w.meaning,w.example,w.examplePinyin,w.translation]);assert.equal(crypto.createHash('sha256').update(JSON.stringify(cells)).digest('hex'),row.sha256);assert.equal(l.title,row.title);for(const w of l.words)assert(Object.values(w).every(Boolean));for(const g of l.structuredGrammar)assert(g.formula&&g.explanation&&g.examples.length)}checks+=18;
 // All lesson screens, every basic and advanced game, and all grammar/readings.
 for(let id=1;id<=18;id++){
  for(const tab of ['words','grammar','flash','games']){await page.evaluate(([i,t])=>openLesson(i,t),[id,tab]);assert.equal(await page.locator('#content').count(),1);if(tab==='grammar')assert.equal(await page.locator('.h2-ref-grammar').count(),data[id-1].structuredGrammar.length);if(tab==='flash'){await page.locator('#hskUnitFlashCard').click();assert(await page.locator('.hsk3-example-pin').textContent())}checks++}
  for(const mode of ['hanzi','meaning','pinyin','listen','type','dictation','cloze','translate','order','reading','speaking','mixed']){
   await page.evaluate(([i,m])=>{openLesson(i,'games');startGame(m)},[id,mode]);
   assert(await page.locator('#app').innerText());
   await page.evaluate(()=>{const m=session.questions[session.index].submode||session.mode;if(['hanzi','meaning','pinyin','listen'].includes(m)){const w=session.questions[session.index];checkAnswer(session.options.findIndex(x=>x.id===w.id))}else if(['type','dictation'].includes(m)){checkAnswer(session.questions[session.index].hanzi)}else if(m==='cloze'){answerCloze(session.clozeOptions.indexOf(session.missing))}else {if(m==='order')session.chosen=Array.from(session.target.replace(/[。！？]/g,''));else document.querySelector('#advInput').value=m==='reading'?session.questions[session.index].translation:session.target;gradeAdvanced()}});
   assert(await page.locator('#feedback').textContent());checks++;
  }
  for(const mode of ['choice','order','write']){
   await page.evaluate(([i,m])=>{openLesson(i,'games');h2StartGrammar(m)},[id,mode]);assert.equal(await page.locator('.h2-exercise').count(),1);
   if(mode==='choice')await page.locator('.h2-answer').first().click();
   if(mode==='order'){await page.locator('.h2-tiles button').first().click();await page.locator('.h2-exercise button.primary').click()}
   if(mode==='write'){await page.locator('#h2-grammar-input').fill('我认真学习汉语。');await page.locator('.h2-exercise button.primary').click()}
   assert(await page.locator('#h2-feedback').textContent());checks++;
  }
  await page.evaluate(i=>{openLesson(i,'games');h2StartReading(-1)},id);
  for(let q=0;q<20;q++){await page.locator('.h2-reading-question .h2-answer').first().click();await page.locator('#h2-feedback button.primary').click()}
  assert(await page.locator('.h2-complete').textContent());checks++;
 }
 // Source verification for topics, all topic modes and their back controls.
 await page.evaluate(()=>topicHome());assert.equal(await page.locator('.topic-card').count(),36);
 let topicCount=0;
 for(let id=1;id<=36;id++){
  await page.evaluate(i=>topicOpen(i),id);
  const cells=await page.locator('#topicContent .topic-word').evaluateAll(rows=>rows.map(r=>r.innerText));
  const count=source.topics[id-1].count;topicCount+=count;
  const sourceWords=topicData[id-1].words.map(w=>[w.hanzi,w.pinyin,w.meaning,w.example,w.examplePinyin,w.translation]);
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(sourceWords)).digest('hex'),source.topics[id-1].sha256);
  assert.equal(cells.length,count,'topic '+id+' word count');
  await page.locator('.hsk-topic-back').click();assert.equal(await page.locator('.topic-card').count(),36);
  await page.evaluate(i=>{topicOpen(i);topicMode('flash')},id);assert.equal(await page.locator('.topic-flash').count(),1);await page.evaluate(()=>topicFlip());assert(await page.locator('.topic-flash').textContent());
  for(const mode of ['han','viet','pin','listen','type','cloze']){
   await page.evaluate(m=>topicMode(m),mode);assert(await page.locator('#topicContent').textContent());
   if(await page.locator('#topicTyped').count()){await page.locator('#topicTyped').fill('测试');await page.evaluate(()=>topicSubmitTyped())}
   else {const button=page.locator('#topicContent button[onclick*="topicChoose"]').first();assert.equal(await button.count(),1);await button.click()}
   checks++;
  }
 }
 assert.equal(topicCount,960);
 // Unit progress persists after reload; study keys from earlier levels remain untouched.
 await page.evaluate(()=>{topicExit();openLesson(1,'flash')});await page.locator('[data-action="mark"]').click();await page.reload();assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk3-quest-v1')).known['hsk3-L01-01']));
 await page.evaluate(()=>{openLesson(18,'games');startGuidedWriting()});await page.locator('#guidedText').fill('我学会了包饺子。');await page.evaluate(()=>saveGuidedWriting());await page.reload();await page.evaluate(()=>{openLesson(18,'games');startGuidedWriting()});assert.equal(await page.locator('#guidedText').inputValue(),'我学会了包饺子。');
 await page.evaluate(()=>topicToMain('review'));assert.equal(await page.locator('.lessoncheck').count(),18);await page.evaluate(()=>dashSelectUnits(false));assert.equal(await page.locator('.lessoncheck:checked').count(),0);await page.evaluate(()=>dashSelectUnits(true));
 await page.evaluate(()=>topicToMain('stats'));assert(await page.locator('.dash-history').textContent());assert(await page.locator('.hsk3-top-back').isVisible());
 assert.equal(await page.evaluate(()=>localStorage.getItem('hsk2-quest-v1')),'unchanged-hsk2');assert.equal(await page.evaluate(()=>localStorage.getItem('hsk1-quest-v1')),'unchanged-hsk1');assert.equal(await page.evaluate(()=>localStorage.getItem('hsk2-topics-v2')),'unchanged-hsk2-topics');
 await page.evaluate(()=>{topicExit();openLesson(18,'games')});await page.evaluate(()=>window.scrollTo(0,1000));await page.evaluate(()=>openLesson(18,'flash'));assert.equal(await page.evaluate(()=>scrollY),0);
 await page.locator('[data-action="listen"]').click();
 const spoke=await page.evaluate(()=>window.__spoken);assert(spoke.some(x=>x.text&&x.lang==='zh-CN'));
 await page.evaluate(()=>home());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'home overflows');
 if(process.env.HSK3_SCREENSHOTS){await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-home-'+viewport.width+'.png'),fullPage:true});await page.evaluate(()=>{openLesson(18,'flash');document.querySelector('#hskUnitFlashCard').click()});await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-flash-'+viewport.width+'.png'),fullPage:true})}
 await page.locator('header nav button').first().click();assert(page.url().endsWith('/index.html'));for(const level of [1,2]){await page.goto(url+'/hsk'+level+'.html');assert((await page.locator('body').innerText()).includes('HSK '+level))}
 console.log('PASS '+viewport.width+'px: all 18 lessons, 36 topics, flashcards, game answers, grammar, reading completion, progress isolation, writing draft, navigation, speech invocation');await context.close();
 }
 assert.deepEqual(failures,[]);console.log('PASS '+checks+' checks; no uncaught browser errors.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
