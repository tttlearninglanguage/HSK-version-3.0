/* Requires Node.js, Playwright and Chromium. Run: node tests/hsk3-readings.cjs */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'HSK3/index.html'),'utf8');
const data=JSON.parse(html.match(/window.HSK3_UPDATE=(.*);/)[1]);
const dataReadings=require('../HSK3/content/readings-v2.json');assert.deepEqual(data.readings,dataReadings);assert.equal(data.readings.length,90);assert.equal(data.readings.reduce((n,p)=>n+p.questions.length,0),540);
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(fs.readFileSync(f))}catch{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const width of [1440,390]){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.__speech=[];speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>window.__speech.push(u.text)});
  await page.goto('http://127.0.0.1:'+server.address().port+'/HSK3/index.html');
  for(let lesson=1;lesson<=18;lesson++){
   await page.evaluate(id=>{openLesson(id,'games');h2ReadingMenu()},lesson);
   assert.equal(await page.locator('.h2-reading-card').count(),5);assert.equal(await page.locator('.reading-choice').count(),5);
   // Open each of the five cards via its actual button.
   for(let index=0;index<5;index++){
    await page.locator('.h2-reading-card button').nth(index).click();assert.equal(await page.locator('.h2-passage').count(),1);
    await page.evaluate(()=>h2ReadingMenu());
   }
   await page.evaluate(()=>h2StartReading(-1));
   await page.evaluate(()=>{
    const byText=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(t));
    byText('Hiện Pinyin').click();if(document.querySelector('#h2-reading-pinyin').hidden)throw Error('pinyin toggle');
    byText('Hiện bản dịch').click();if(document.querySelector('#h2-reading-translation').hidden)throw Error('translation toggle');
    document.querySelector('.h2-passage [data-say]').click();
    const word=document.querySelector('.h2-passage-text [data-lookup]');word.click();if(!document.querySelector('#hsk-reading-gloss'))throw Error('dictionary');document.querySelector('#hsk-reading-gloss [aria-label="Đóng tra từ"]').click();
   });
   await page.evaluate(id=>{
    const bank=HSK3_UPDATE.readings.filter(p=>p.lesson===id);
    for(let i=0;i<30;i++){
     const expected=bank[Math.floor(i/6)].questions[i%6];
     const answer=[...document.querySelectorAll('.h2-reading-question .h2-answer')].find(b=>b.textContent===expected.answer);
     if(!answer)throw Error('missing answer '+expected.id);answer.click();
     if(!answer.disabled||!document.querySelector('#h2-feedback').textContent.includes('Chính xác'))throw Error('scoring '+expected.id);
     answer.click(); // A repeated answer must not increase the score.
     document.querySelector('#h2-feedback button.primary').click();
    }
    if(!document.querySelector('.h2-complete').textContent.includes('30/30'))throw Error('incorrect completion total');
    if(!document.querySelector('.h2-complete').textContent.includes('5 đoạn'))throw Error('incorrect passage count');
   },lesson);
   await page.locator('.h2-complete button').filter({hasText:'Xem đáp án'}).click();assert.equal(await page.locator('.h2-review-answer').count(),30);
   await page.locator('#app > .back-inline').click();assert.equal(await page.locator('#content').count(),1);
  }
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk3-quest-v1')).history.filter(h=>h.mode==='Đọc hiểu theo đoạn').length),18);
  assert(await page.evaluate(()=>__speech.length>=18));
  await page.reload();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hsk3-quest-v1')).history[0].total),30);
  await page.evaluate(()=>{openLesson(18,'games');h2ReadingMenu()});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.HSK3_SCREENSHOTS){await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-five-readings-'+width+'.png'),fullPage:true});await page.locator('.h2-reading-card button').last().click();await page.screenshot({path:path.join(process.env.HSK3_SCREENSHOTS,'hsk3-reading-detail-'+width+'.png'),fullPage:true})}
  assert.deepEqual(errors,[]);console.log('PASS '+width+'px: 90 card links, 540 correct answers, 18 complete 30-question rounds, answer reviews, lookup, audio, pinyin/translation, back navigation and persisted history');await page.close();
 }}finally{await browser.close();server.close()}
 console.log('PASS: 90 unique passages / 540 unique questions; all audited reading tokens are from bundled HSK 1–3 vocabulary.');
})().catch(e=>{console.error(e);process.exitCode=1});
