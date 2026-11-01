/* Native speech behavior simulated in Chromium; physical Apple audio still needs device QA. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function mockSpeech(){
 const engine=new EventTarget();engine.voices=[];engine.calls=[];engine.paused=false;engine.speaking=false;engine.pending=false;engine.cancelCount=0;engine.resumeCount=0;
 engine.getVoices=()=>engine.voices;
 engine.cancel=()=>{engine.cancelCount++;engine.speaking=false;engine.pending=false;const last=engine.calls.at(-1);if(last)last.utterance.onerror?.({error:'canceled'})};
 engine.resume=()=>{engine.resumeCount++;engine.paused=false};
 engine.speak=u=>{engine.calls.push({utterance:u,gesture:window.__speechGesture===true});if(!engine.hold){engine.speaking=true;u.onstart?.()}};
 Object.defineProperty(window,'speechSynthesis',{value:engine,configurable:true});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.voice=null}};
 window.__speechGesture=false;
 document.addEventListener('click',()=>{window.__speechGesture=true;setTimeout(()=>window.__speechGesture=false,0)},true);
 window.__speech=engine;
}
(async()=>{const server=http.createServer((q,r)=>{try{const file=path.resolve(root,'.'+new URL(q.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();r.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');r.end(fs.readFileSync(file))}catch{r.statusCode=404;r.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
try{b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});for(const width of [390,1440]){const page=await b.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(mockSpeech);
for(let level=1;level<=3;level++){
 await page.goto(`http://127.0.0.1:${server.address().port}/hsk${level}.html`);
 // First click must issue speak synchronously, even before voices are available.
 await page.evaluate(()=>openLesson(1,'flash'));await page.locator('[data-action="listen"]').click();
 let result=await page.evaluate(()=>({calls:__speech.calls.length,cancel:__speech.cancelCount,gesture:__speech.calls[0].gesture,lang:__speech.calls[0].utterance.lang,voice:__speech.calls[0].utterance.voice}));
 assert.deepEqual(result,{calls:1,cancel:0,gesture:true,lang:'zh-CN',voice:null});
 await page.evaluate(()=>{__speech.calls.at(-1).utterance.onend();openLesson(1,'games');startGame('hanzi');__speech.voices=[{name:'Sin-ji',lang:'zh-HK',voiceURI:'cantonese',localService:true},{name:'Tingting',lang:'zh-CN',voiceURI:'mandarin',localService:true},{name:'Remote Mandarin',lang:'zh-CN',voiceURI:'remote',localService:false}];__speech.dispatchEvent(new Event('voiceschanged'))});
 assert(await page.locator('#voiceSelect option[value="mandarin"]').count());
 // A paused native engine must resume and use local Mandarin rather than Cantonese.
 await page.evaluate(()=>{__speech.paused=true;speak('你好')});
 result=await page.evaluate(()=>({voice:__speech.calls.at(-1).utterance.voice.voiceURI,resumed:__speech.resumeCount}));assert.equal(result.voice,'mandarin');assert.equal(result.resumed,1);
 // Explicit preference, stale preferences, and interrupted requests remain safe.
 await page.evaluate(()=>chooseHskVoice('remote'));assert.equal(await page.evaluate(()=>__speech.calls.at(-1).utterance.voice.voiceURI),'remote');await page.evaluate(()=>{openLesson(1,'games');startGame('hanzi')});assert.equal(await page.locator('#voiceSelect').inputValue(),'remote');
 await page.evaluate(()=>{chooseHskVoice('removed-voice');const old=__speech.calls.at(-1).utterance;speak('谢谢');old.onerror({error:'synthesis-failed'})});assert.equal(await page.locator('#hsk-speech-notice').count(),0);assert.equal(await page.evaluate(()=>__speech.calls.at(-1).utterance.voice.voiceURI),'mandarin');
 // Failed native voice offers a real click retry without forcing that voice again.
 await page.evaluate(()=>__speech.calls.at(-1).utterance.onerror({error:'voice-unavailable'}));await page.getByRole('button',{name:'🔊 Nghe lại',exact:true}).click();assert.equal(await page.evaluate(()=>__speech.calls.at(-1).utterance.voice),null);assert.equal(await page.evaluate(()=>__speech.calls.at(-1).gesture),true);
 const counts=await page.evaluate(()=>{let lessons=0,topics=0;for(const l of L){openLesson(l.id,'flash');const before=__speech.calls.length;document.querySelector('[data-action="listen"]').click();if(__speech.calls.length!==before+1)throw Error('lesson audio '+l.id);lessons++}topicHome();const count=document.querySelectorAll('.topic-card').length;for(let id=1;id<=count;id++){topicOpen(id);topicMode('flash');let before=__speech.calls.length;document.querySelector('.topic-tools button[onclick^="topicSay"]').click();if(__speech.calls.length!==before+1)throw Error('topic flash audio '+id);before=__speech.calls.length;topicMode('listen');if(__speech.calls.length!==before+1)throw Error('topic listening must not defer speech '+id);topics++}return{lessons,topics}});
 // No-start fallback is actionable, not another delayed autoplay attempt.
 await page.evaluate(()=>{__speech.hold=true;speak('再见')});await page.locator('#hsk-speech-notice').waitFor({timeout:7000});assert(await page.getByRole('button',{name:'🔊 Nghe lại',exact:true}).count());await page.evaluate(()=>{__speech.hold=false});await page.getByRole('button',{name:'🔊 Nghe lại',exact:true}).click();assert.equal(await page.locator('#hsk-speech-notice').count(),0);
 assert.deepEqual(errors,[]);console.log(`HSK ${level}, ${width}px: ${counts.lessons} lessons/${counts.topics} topics and speech recovery scenarios passed`);
}
await page.close()}
// Missing API and blocked localStorage must not crash startup or retry controls.
const page=await b.newPage();await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw new Error('blocked storage')}});await page.goto(`http://127.0.0.1:${server.address().port}/hsk1.html`);await page.evaluate(()=>speak('你好'));assert(await page.locator('#hsk-speech-notice').count());await page.close();
}finally{if(b)await b.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
