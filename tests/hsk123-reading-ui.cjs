const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':f.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(fs.readFileSync(f))}catch{res.statusCode=404;res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const width of [390,1440])for(const level of [1,2,3]){
  const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const s=new EventTarget();s.calls=[];s.cancelCount=0;s.getVoices=()=>[];s.speak=u=>{s.calls.push(u);s.speaking=true;u.onstart?.()};s.cancel=()=>{s.cancelCount++;s.speaking=false;s.calls.at(-1)?.onerror?.({error:'canceled'})};s.resume=()=>{};
   Object.defineProperty(window,'speechSynthesis',{value:s});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.__speech=s;
  });
  await p.goto(`http://127.0.0.1:${server.address().port}/HSK${level}/index.html${level===4?'#lesson/1/games':''}`);
  if(level===4){await p.locator('[data-mode="passages"]').click();await p.locator('[data-reading-id]').first().click()}
  else await p.evaluate(n=>{openLesson(1,'games');if(n===1){startPassages();HSKReadingPicker.open(1,'R01-1')}else h2StartReading(0)},level);
  await p.waitForSelector('.reading-study');
  const panel=p.locator('.reading-study');assert.equal(await panel.count(),1);
  const passage=panel.locator('.h2-passage-text,p.hanzi').first(),question=panel.locator('.h2-reading-question>h3,h3.hanzi').first();
  const passageBox=await passage.boundingBox(),questionBox=await question.boundingBox();assert(questionBox.y>passageBox.y+passageBox.height);
  const toggle=p.locator('#togglePinyin,[aria-controls="h2-reading-pinyin"]'),pin=p.locator('#readingPinyin,#h2-reading-pinyin');
  assert(await pin.isHidden());await toggle.click();assert(await pin.isVisible());assert(await pin.locator('ruby rt').count()>3);assert.equal(await toggle.getAttribute('aria-expanded'),'true');if(process.env.HSK_READING_SCREENSHOTS){fs.mkdirSync(process.env.HSK_READING_SCREENSHOTS,{recursive:true});await p.screenshot({path:path.join(process.env.HSK_READING_SCREENSHOTS,`hsk${level}-${width}-pinyin.png`),fullPage:true})}await toggle.click();assert(await pin.isHidden());
  const word=passage.locator('.h2-word,.hsk-clickword').first();await word.click();
  const gloss=p.locator('#hsk-reading-gloss');assert(await gloss.isVisible());assert(await gloss.locator('.gloss-pin').innerText());assert((await gloss.locator('p').last().innerText()).length>0);assert.equal(await p.locator('#h2-dictionary[open]').count(),0);
  const wordBox=await word.boundingBox(),glossBox=await gloss.boundingBox();assert(glossBox.x>=0&&glossBox.x+glossBox.width<=width);assert(Math.min(Math.abs(glossBox.y+glossBox.height-wordBox.y),Math.abs(glossBox.y-wordBox.y-wordBox.height))<40);
  await gloss.locator('.gloss-audio').click();assert.equal(await p.evaluate(()=>__speech.calls.at(-1).text),await word.innerText());await p.keyboard.press('Escape');assert.equal(await gloss.count(),0);
  await word.focus();await p.keyboard.press('Enter');assert(await gloss.isVisible());await gloss.getByRole('button',{name:'Đóng tra từ'}).click();assert.equal(await gloss.count(),0);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(process.env.HSK_READING_SCREENSHOTS){fs.mkdirSync(process.env.HSK_READING_SCREENSHOTS,{recursive:true});await p.screenshot({path:path.join(process.env.HSK_READING_SCREENSHOTS,`hsk${level}-${width}.png`),fullPage:true})}
  const answer=p.locator('.reading-study .h2-answer,.reading-study .option').first();await answer.click({position:{x:5,y:5}});assert((await p.locator('#h2-feedback,#passageFeedback').innerText()).length>0);assert.deepEqual(errors,[]);
  console.log(`PASS HSK ${level} ${width}px: single panel, ruby pinyin, anchored lookup, keyboard, audio and answer feedback`);await p.close();
 }}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
