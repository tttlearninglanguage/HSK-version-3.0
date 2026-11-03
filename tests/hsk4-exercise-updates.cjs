const {chromium}=require('playwright');
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end('Missing')}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];let checks=0;
try{for(const width of [1440,390]){
const ctx=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
await page.addInitScript(()=>{window.__recognizers=[];window.SpeechRecognition=class {constructor(){window.__recognizers.push(this)}start(){}abort(){} };if(window.speechSynthesis){speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>u.onstart?.()}});
async function start(mode,count='40'){await page.goto(base+'/HSK4/index.html#lesson/1/games');await page.waitForFunction(()=>window.HSK4);await page.locator('#questionCount').selectOption(count);await page.locator(`[data-mode="${mode}"]`).click();await page.waitForSelector('#answerArea')}
async function lookupUnsubmitted(){const token=page.locator('#answerArea .answer-text .lookup').first();await token.click();assert(await page.locator('#gloss .pin').innerText());assert(!await page.evaluate(()=>HSK4.getSession().answered),'looking up must not submit');assert.equal(await page.evaluate(()=>HSK4.getSession().correct),0);await page.keyboard.press('Escape');checks++}
function chineseOptions(q){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);for(const x of q.options){assert(/[\u3400-\u9fff]/.test(x));assert(!/[A-Za-zÀ-ỹ]/.test(x))}assert(q.options.includes(q.answer))}
await start('listen-sentence');assert.equal(await page.evaluate(()=>HSK4.getSession().questions.length),40);await lookupUnsubmitted();
for(let i=0;i<40;i++){
 const q=await page.evaluate(()=>HSK4.getSession().questions[HSK4.getSession().index]);chineseOptions(q);assert.equal(q.answer,q.sentence);
 assert.deepEqual(await page.locator('#answerArea .answer-text').allTextContents(),q.options);
 assert.equal(await page.locator('button button').count(),0,'must not nest buttons');
 await page.locator(`[data-action="answer"][data-index="${q.options.indexOf(q.answer)}"]`).click();assert.equal(await page.evaluate(()=>HSK4.getSession().correct),i+1);
 // Dictionary stays usable after grading and never adds a point.
 if(i===0){await page.locator('#answerArea .lookup').first().click();assert(await page.locator('#gloss').isVisible());assert.equal(await page.evaluate(()=>HSK4.getSession().correct),1);await page.keyboard.press('Escape')}
 await page.locator('[data-action="next"]').click();checks++;
}assert((await page.locator('main').innerText()).includes('40 / 40 câu đúng'));
await start('passages');await lookupUnsubmitted();
for(let i=0;i<12;i++){const q=await page.evaluate(()=>HSK4.getSession().questions[HSK4.getSession().index]);chineseOptions(q);assert.deepEqual(await page.locator('#answerArea .answer-text').allTextContents(),q.options);await page.locator(`[data-action="answer"][data-index="${q.options.indexOf(q.answer)}"]`).click();assert.equal(await page.evaluate(()=>HSK4.getSession().correct),i+1);await page.locator('[data-action="next"]').click();checks++}assert((await page.locator('main').innerText()).includes('12 / 12 câu đúng'));
// Verify lookup coverage for all Chinese listening/reading options, not just one token.
const missing=await page.evaluate(()=>{const strings=[...HSK4.lesson.words.map(w=>w.example),...HSK4.practice.readings.flatMap(r=>r.questions.flatMap(q=>q.options))];return strings.flatMap(text=>HSK4.tokenize(text).filter(t=>/[\u3400-\u9fff]/.test(t.text)&&!t.word).map(t=>({text,missing:t.text}))) });assert.deepEqual(missing,[]);checks++;
await start('hanzi');const baseline=await page.locator('.exercise-question').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
for(const mode of ['cloze','translate','order']){await start(mode);const font=await page.locator('.exercise-question').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert.equal(font,baseline,mode+' prompt should match the shared grammar scale');if(mode==='cloze'){const choice=await page.locator('#options .option').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(choice>=22);assert(choice>19)}assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks++}
await start('speaking');await page.locator('[data-action="record"]').click();await page.evaluate(()=>{const r=window.__recognizers.at(-1);r.onresult({results:[Object.assign([{transcript:'我想申请奖学金。'}],{isFinal:true})]})});assert.equal(await page.locator('#typed').inputValue(),'我想申请奖学金。');assert(!await page.evaluate(()=>HSK4.getSession().answered));await page.locator('#typed').fill('我想申请去中国学习。');assert.equal(await page.locator('#typed').inputValue(),'我想申请去中国学习。');await page.locator('[data-action="submit-text"]').click();assert(await page.evaluate(()=>HSK4.getSession().answered));assert.equal(await page.evaluate(()=>HSK4.getSession().autoCount),0);await page.evaluate(()=>window.__recognizers.at(-1).onresult({results:[[{transcript:'迟到的结果'}]]}));assert.equal(await page.locator('#typed').inputValue(),'我想申请去中国学习。');checks+=4;
// A result from a superseded mic request must not overwrite the latest input.
await start('speaking');await page.locator('[data-action="record"]').click();await page.locator('[data-action="record"]').click();await page.evaluate(()=>window.__recognizers.at(-2).onresult({results:[[{transcript:'旧的结果'}]]}));assert.equal(await page.locator('#typed').inputValue(),'');await page.evaluate(()=>window.__recognizers.at(-1).onresult({results:[[{transcript:'新的结果'}]]}));assert.equal(await page.locator('#typed').inputValue(),'新的结果');
// A late result after navigation must not populate another exercise's answer.
await start('translate');await page.evaluate(()=>window.__recognizers.at(-1).onresult({results:[[{transcript:'不应该出现'}]]}));assert.equal(await page.locator('#typed').inputValue(),'');checks+=3;
console.log('PASS '+width+'px: 40 Chinese listening questions, 12 Chinese reading questions, lookup without submission, typography, editable mic input and stale-result guards');await ctx.close();
}assert.deepEqual(errors,[]);console.log('PASS '+checks+' targeted exercise checks.');
}finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
