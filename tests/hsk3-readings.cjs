/* Requires Node.js, Playwright and Chromium. Run: node tests/hsk3-readings.cjs */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'hsk3.html'),'utf8');
const data=JSON.parse(html.match(/window.HSK3_UPDATE=(.*);/)[1]);
const audit=JSON.parse(fs.readFileSync(path.join(root,'hsk3-reading-vocabulary-audit.json'),'utf8'));
const lex=new Set();
function readArray(text,pattern){return JSON.parse(text.match(pattern)[1])}
for(const file of ['hsk1.html','hsk2.html','hsk3.html']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 const lessons=readArray(source,/(?:window\.)?HSK_LESSONS\s*=\s*(\[.*\]);/);
 const topics=readArray(source,/const TOPICS=(\[.*\]);/);
 for(const group of [...lessons,...topics])for(const word of group.words)lex.add(word.hanzi);
}
assert.equal(data.readings.length,90);assert.equal(new Set(data.readings.map(p=>p.text)).size,90);assert.equal(new Set(data.readings.map(p=>p.id)).size,90);
const ids=new Set(),dictionary=new Set(data.dictionary.map(w=>w.hanzi));
for(let lesson=1;lesson<=18;lesson++)assert.equal(data.readings.filter(p=>p.lesson===lesson).length,5);
for(const p of data.readings){
 assert(p.text&&p.pinyin&&p.translation&&p.title);assert.equal(p.questions.length,4);
 const row=audit.readings.find(r=>r.id===p.id);assert(row);assert.equal(row.sha256,crypto.createHash('sha256').update(p.text).digest('hex'));
 assert.equal(row.tokens.join(''),p.text.replace(/[^\u3400-\u9fff]/g,''));
 for(const token of row.tokens){assert(lex.has(token),'outside HSK vocabulary: '+token);assert(dictionary.has(token),'missing lookup: '+token)}
 for(const q of p.questions){assert(!ids.has(q.id));ids.add(q.id);assert.equal(new Set(q.options).size,4);assert(q.options.includes(q.answer));assert(q.explanation)}
}
assert.equal(ids.size,360);
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__speech=[];speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>window.__speech.push(u.text)});
  await page.goto('http://127.0.0.1:'+server.address().port+'/hsk3.html');
  for(let lesson=1;lesson<=18;lesson++){
   await page.evaluate(id=>{openLesson(id,'games');h2ReadingMenu()},lesson);
   assert.equal(await page.locator('.h2-reading-card').count(),5);assert((await page.locator('.h2-section-intro').innerText()).includes('20 câu hỏi'));
   // Open each of the five cards via its actual button.
   for(let index=0;index<5;index++){
    await page.locator('.h2-reading-card button').nth(index).click();assert.equal(await page.locator('.h2-passage').count(),1);
    await page.evaluate(()=>h2ReadingMenu());
   }
   await page.locator('.h2-section-intro button.primary').click();
   await page.evaluate(()=>{
    const byText=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(t));
    byText('Hiện pinyin').click();if(document.querySelector('#h2-reading-pinyin').hidden)throw Error('pinyin toggle');
    byText('Hiện bản dịch').click();if(document.querySelector('#h2-reading-translation').hidden)throw Error('translation toggle');
    document.querySelector('.h2-passage [data-say]').click();
    const word=document.querySelector('.h2-passage-text [data-lookup]');word.click();if(!document.querySelector('#h2-dictionary').open)throw Error('dictionary');document.querySelector('#h2-dictionary').close();
   });
   await page.evaluate(id=>{
    const bank=HSK3_UPDATE.readings.filter(p=>p.lesson===id);
    for(let i=0;i<20;i++){
     const expected=bank[Math.floor(i/4)].questions[i%4];
     const answer=[...document.querySelectorAll('.h2-reading-question .h2-answer')].find(b=>b.textContent===expected.answer);
     if(!answer)throw Error('missing answer '+expected.id);answer.click();
     if(!answer.disabled||!document.querySelector('#h2-feedback').textContent.includes('Chính xác'))throw Error('scoring '+expected.id);
     answer.click(); // A repeated answer must not increase the score.
     document.querySelector('#h2-feedback button.primary').click();
    }
    if(!document.querySelector('.h2-complete').textContent.includes('20/20'))throw Error('incorrect completion total');
    if(!document.querySelector('.h2-complete').textContent.includes('5 đoạn'))throw Error('incorrect passage count');
   },lesson);
   await page.locator('.h2-complete button').filter({hasText:'Xem đáp án'}).click();assert.equal(await page.locator('.h2-review-answer').count(),20);
   await page.locator('#app > .back-inline').click();assert.equal(await page.locator('#content').count(),1);
  }
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk3-quest-v1')).history.filter(h=>h.mode==='Đọc hiểu theo đoạn').length),18);
  assert(await page.evaluate(()=>__speech.length>=18));
  await page.reload();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk3-quest-v1')).history[0].total),20);
  await page.evaluate(()=>{openLesson(18,'games');h2ReadingMenu()});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.HSK3_SCREENSHOTS){await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-five-readings-'+width+'.png'),fullPage:true});await page.locator('.h2-reading-card button').last().click();await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-reading-detail-'+width+'.png'),fullPage:true})}
  assert.deepEqual(errors,[]);console.log('PASS '+width+'px: 90 card links, 360 correct answers, 18 complete 20-question rounds, answer reviews, lookup, audio, pinyin/translation, back navigation and persisted history');await page.close();
 }}finally{await browser.close();server.close()}
 console.log('PASS: 90 unique passages / 360 unique questions; all audited reading tokens are from bundled HSK 1–3 vocabulary.');
})().catch(e=>{console.error(e);process.exitCode=1});
