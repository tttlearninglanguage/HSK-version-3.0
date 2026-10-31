/* Run with Node.js and Playwright: node tests/hsk-title-typography.cjs */
const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser,checks=0;
 try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:360,height:640}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  for(let level=1;level<=3;level++){
   await page.goto(`http://127.0.0.1:${server.address().port}/hsk${level}.html`);
   const results=await page.evaluate(async()=>{
    const failures=[];let screens=0,tokens=0;
    const settle=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    function check(selector,label){const h=document.querySelector(selector);if(!h){failures.push(label+': missing heading');return}const size=getComputedStyle(h).fontSize;for(const el of h.querySelectorAll('.hanzi,.topic-hanzi,.h2-word')){if(getComputedStyle(el).fontSize!==size)failures.push(`${label}: ${el.textContent} is ${getComputedStyle(el).fontSize}, heading is ${size}`);if(el.matches('.h2-word')){tokens++;const css=getComputedStyle(el);if(css.padding!=='0px'||parseFloat(css.minHeight)>0)failures.push(label+': lookup token has control spacing')}}screens++}
    for(const lesson of L)for(const tab of ['words','flash','games']){openLesson(lesson.id,tab);await settle();check('#app .unit-title-banner h2',`lesson ${lesson.id} ${tab}`)}
    topicHome();const count=document.querySelectorAll('.topic-card').length;
    for(let i=1;i<=count;i++)for(const mode of ['words','flash','menu']){topicOpen(i);if(mode!=='words')topicMode(mode);await settle();check('#topicRoot .topic-head h1',`topic ${i} ${mode}`)}
    return {failures,screens,tokens};
   });
   assert.deepEqual(results.failures,[],`HSK ${level}, ${viewport.width}px`);checks+=results.screens;
   // HSK 2/3 title dictionary buttons must retain their lookup behavior in Flashcard mode.
   if(level>1){assert(results.tokens>0);await page.evaluate(()=>{topicExit();openLesson(1,'flash')});const word=page.locator('.unit-title-banner .h2-word').first();await word.click();await page.locator('#h2-dictionary[open]').waitFor();await page.evaluate(()=>document.querySelector('#h2-dictionary').close())}
   console.log(`HSK ${level}, ${viewport.width}px: ${results.screens} headings passed (${results.tokens} lookup tokens)`);
  }
  await page.close();
 }
 console.log(`${checks} heading checks passed`);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
