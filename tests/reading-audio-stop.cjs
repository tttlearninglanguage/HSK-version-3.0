const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.json')?'application/json':f.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(fs.readFileSync(f))}catch{res.statusCode=404;res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const width of [390,1440])for(const level of [1,2,3,4]){
  const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{
   const s=new EventTarget();s.calls=[];s.cancelCount=0;s.getVoices=()=>[];s.speak=u=>{s.calls.push(u);s.speaking=true;u.onstart?.()};s.cancel=()=>{s.cancelCount++;s.speaking=false;s.calls.at(-1)?.onerror?.({error:'canceled'})};s.resume=()=>{};
   Object.defineProperty(window,'speechSynthesis',{value:s});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};window.__speech=s;
  });
  await p.goto(`http://127.0.0.1:${server.address().port}/HSK${level}/index.html${level===4?'#lesson/1/games':''}`);
  if(level===4){await p.locator('[data-mode="passages"]').click();await p.locator('[data-reading-id]').first().click()}
  else await p.evaluate(n=>{openLesson(1,'games');if(n===1){startPassages();HSKReadingPicker.open(1,'R01-1')}else h2StartReading(0)},level);
  const button=p.locator('[data-reading-audio],button[onclick*="hskReadPassage"]').first();const label=await button.innerText();
  await button.click();assert.equal(await button.innerText(),'⏹ Dừng đọc');assert.equal(await button.getAttribute('aria-pressed'),'true');assert(await p.evaluate(()=>__speech.calls.at(-1).text.length>30));
  const calls=await p.evaluate(()=>__speech.calls.length);await button.click();assert.equal(await button.innerText(),label);assert.equal(await p.evaluate(()=>__speech.calls.length),calls);assert.equal(await button.getAttribute('aria-pressed'),'false');assert.equal(await p.locator('#hsk-speech-notice').count(),0);
  // A late completion from the canceled request must not clear the new playback.
  await button.click();await p.evaluate(()=>__speech.calls.at(-2).onend());assert.equal(await button.innerText(),'⏹ Dừng đọc');await p.evaluate(()=>__speech.calls.at(-1).onend());assert.equal(await button.innerText(),label);
  await button.click();await p.evaluate(()=>__speech.calls.at(-1).onerror({error:'voice-unavailable'}));assert.equal(await button.innerText(),label);await p.getByRole('button',{name:'🔊 Nghe lại',exact:true}).click();assert.equal(await button.innerText(),'⏹ Dừng đọc');
  await p.evaluate(()=>speak('你好'));assert.equal(await button.innerText(),label);
  await button.click();const before=await p.evaluate(()=>__speech.cancelCount);await p.evaluate(()=>{if(location.pathname.includes('HSK4'))location.hash='#home';else openLesson(1,'games')});await p.waitForFunction(n=>__speech.cancelCount>n,before);assert.equal(await p.locator('#hsk-speech-notice').count(),0);assert.deepEqual(errors,[]);
  console.log(`PASS HSK ${level} ${width}px: play/stop/replay/end/error/retry/replacement/navigation`);await p.close();
 }}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
