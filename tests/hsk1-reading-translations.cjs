const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'HSK1/index.html'),'utf8');
const readings=JSON.parse(source.match(/window.HSK_READING\s*=\s*(\[.*?\]);/)[1]);
assert.equal(readings.length,75);
for(const r of readings){assert(r.translation.length>150,r.id);assert(!/[\u3400-\u9fff]|undefined|null/.test(r.translation),r.id);assert(r.translation.endsWith('Cả hai đều rất vui.'),r.id)}
(async()=>{
 const server=http.createServer((q,r)=>{try{const f=path.resolve(root,'.'+new URL(q.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))throw Error();r.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html; charset=utf-8');r.end(fs.readFileSync(f))}catch{r.statusCode=404;r.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{for(const width of [1440,390]){const p=await b.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}/HSK1/index.html`);
 for(const reading of readings){await p.evaluate(r=>HSKReadingPicker.open(r.lesson,r.id),reading);await p.waitForSelector('.reading-study');const toggle=p.locator('#readingTranslationToggle'),translation=p.locator('#readingTranslation');assert(await translation.isHidden());assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await translation.textContent(),reading.translation);
 const state=await p.evaluate(()=>JSON.stringify(localStorage));await toggle.click();assert(await translation.isVisible());assert.equal(await toggle.innerText(),'Ẩn bản dịch');assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert(await p.locator('#readingPinyin').isHidden());await p.locator('#togglePinyin').click();assert(await p.locator('#readingPinyin').isVisible());assert(await translation.isVisible());assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await toggle.click();assert(await translation.isHidden());assert(await p.locator('#readingPinyin').isVisible());assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),state);
 }
 await p.evaluate(()=>{HSKReadingPicker.open(1,'R01-1');toggleReadingTranslation();gradePassage(session.options.indexOf(session.passages[0].questions[0].answer));nextPassage()});assert(await p.locator('#readingTranslation').isHidden());assert.equal(await p.evaluate(()=>session.qi),1);assert.deepEqual(errors,[]);console.log(`PASS ${width}px: all 75 translations, show/hide, pinyin independence, no overflow or progress changes, next question`);await p.close();}
 }finally{await b.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
