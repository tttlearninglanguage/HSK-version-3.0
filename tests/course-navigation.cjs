/* GitHub Pages-style prefix, moved shared assets, progress isolation and legacy bookmarks. */
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),prefix='/HSK-version-3.0';
(async()=>{
 const server=http.createServer((req,res)=>{try{const pathname=new URL(req.url,'http://localhost').pathname;if(!pathname.startsWith(prefix+'/'))throw Error();let file=path.resolve(root,'.'+pathname.slice(prefix.length));if(!file.startsWith(root+path.sep))throw Error();if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file)){res.statusCode=404;file=path.join(root,'404.html')}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.svg')?'image/svg+xml':'text/html; charset=utf-8');res.end(fs.readFileSync(file))}catch{res.statusCode=404;res.end('Missing')}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+prefix;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let checks=0;const errors=[];
 try{for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:950}});const missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400&&!/\/hsk[123]\.html/.test(r.url()))missing.push(r.url())});await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.addInitScript(()=>{if(window.speechSynthesis){speechSynthesis.cancel=()=>{};speechSynthesis.speak=u=>u.onstart?.()}});
 await page.goto(base+'/index.html');await page.evaluate(()=>{for(let i=1;i<=4;i++)localStorage.setItem(`hsk${i}-quest-v1`,JSON.stringify({version:1,known:{'persisted-marker':true},history:[],wrong:{},recent:1,visited:{},sections:{}}));localStorage.setItem('hsk3-voice','hsk3-original');localStorage.setItem('hsk-voice','shared-original')});
 for(let level=1;level<=4;level++){
  await page.locator(`a.level[href="./HSK${level}/index.html"]`).click();await page.waitForURL('**/HSK'+level+'/index.html');if(level===4)await page.waitForFunction(()=>window.HSK4);else await page.waitForFunction(()=>window.HSK_LESSONS?.length);
  assert.equal(await page.locator('link[href="../shared/css/hsk-header.css"]').count(),1);assert.equal(await page.locator('link[href="../shared/css/flashcard-compact.css"]').count(),1);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('hsk-site-header')).position),'sticky');
  assert(await page.evaluate(i=>JSON.parse(localStorage.getItem(`hsk${i}-quest-v1`)).known['persisted-marker'],level));
  if(level<=3){assert.equal(await page.locator('script[src^="../shared/js/hsk-speech.js"]').count(),1);assert.equal(await page.locator('script[src="../shared/js/hsk-navigation.js"]').count(),1)}
  await page.evaluate(i=>hskChooseSpeechVoice('voice-level-'+i),level);const voiceKey=level===4?'hsk4-voice':level===3?'hsk3-voice':'hsk-voice';assert.equal(await page.evaluate(k=>localStorage.getItem(k),voiceKey),'voice-level-'+level);
  if(level<3)assert.equal(await page.evaluate(()=>localStorage.getItem('hsk3-voice')),'hsk3-original');
  await Promise.all([page.waitForURL(base+'/index.html'),page.locator('#hsk-site-header .hsk-logo').click()]);checks+=7;
 }
 // The HSK 3 directory URL also selects its isolated voice key.
 await page.goto(base+'/HSK3/');await page.evaluate(()=>hskChooseSpeechVoice('directory-hsk3'));assert.equal(await page.evaluate(()=>localStorage.getItem('hsk3-voice')),'directory-hsk3');assert.equal(await page.evaluate(()=>localStorage.getItem('hsk-voice')),'voice-level-2');checks++;
 // Simulate GitHub Pages' custom 404 handling for old bookmarks.
 for(const level of [1,2,3]){await page.goto(base+`/hsk${level}.html?from=bookmark#keep-position`);await page.waitForURL(base+`/HSK${level}/index.html?from=bookmark#keep-position`);assert.equal(await page.locator('#hsk-site-header .hsk-logo').getAttribute('href'),'../index.html');checks++}
 assert.deepEqual(missing,[]);console.log('PASS '+width+'px: HSK 1–4 navigation, shared assets, existing progress, voice keys and legacy bookmarks with repository prefix');await page.close();
 }assert.deepEqual(errors,[]);console.log('PASS '+checks+' course-organization checks.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
