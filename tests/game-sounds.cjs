const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html; charset=utf-8');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];
 try{for(const level of [1,2,3,4]){
  const page=await browser.newPage({viewport:{width:390,height:844}});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.addInitScript(()=>{window.tones=[];window.audioResumes=0;class Audio{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}resume(){window.audioResumes++;this.state='running';return Promise.resolve();}createOscillator(){return {frequency:{setValueAtTime(f){window.tones.push(f);}},connect(){},disconnect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}}window.AudioContext=Audio;});
  await page.goto(`${base}/HSK${level}/index.html${level===4?'#lesson/1/games':''}`);await page.waitForSelector('[data-game-sounds]');
  async function expectNotes(action,notes){await page.evaluate(()=>tones=[]);await action();await page.waitForTimeout(20);assert.deepEqual(await page.evaluate(()=>tones),notes,`HSK${level}`);}
  const right=[523.25,659.25,783.99],wrong=[293.66,220];
  // Shared audio engine: different tones, nullable grades, user-gesture resume, mute and persistence.
  await expectNotes(()=>page.evaluate(()=>HSKGameSounds.play(true)),right);await expectNotes(()=>page.evaluate(()=>HSKGameSounds.play(false)),wrong);await expectNotes(()=>page.evaluate(()=>HSKGameSounds.play(null)),[]);assert.equal(await page.evaluate(()=>audioResumes),1);
  await page.locator('[data-game-sounds]').click();assert.equal(await page.locator('[data-game-sounds]').getAttribute('aria-pressed'),'false');await expectNotes(()=>page.evaluate(()=>HSKGameSounds.play(true)),[]);await page.reload();await page.waitForSelector('[data-game-sounds]');assert.equal(await page.locator('[data-game-sounds]').getAttribute('aria-pressed'),'false');await page.locator('[data-game-sounds]').click();
  if(level<4){
   for(const mode of ['hanzi','meaning','pinyin','listen','type','dictation','cloze','order','translate','speaking'])for(const correct of [true,false]){
    await page.evaluate(m=>{topicExit();openLesson(1,'games');startGame(m);tones=[]},mode);
    const expected=correct?right:wrong;
    await expectNotes(()=>page.evaluate(({mode,correct})=>{const s=session,w=s.questions[s.index];if(['hanzi','meaning','pinyin','listen'].includes(mode)){const i=s.options.findIndex(x=>correct?x.id===w.id:x.id!==w.id);checkAnswer(i);checkAnswer(i);}else if(['type','dictation'].includes(mode)){checkAnswer(correct?w.hanzi:'错误答案');checkAnswer('错误答案');}else if(mode==='cloze'){answerCloze(s.clozeOptions.findIndex(x=>correct?x===s.missing:x!==s.missing));answerCloze(0);}else {if(mode==='order')s.chosen=[correct?w.example:'错误答案'];else document.querySelector('#advInput').value=correct?w.example:'错误答案';gradeAdvanced();gradeAdvanced();}},{mode,correct}),expected);
   }
   await expectNotes(()=>page.evaluate(()=>{openLesson(1,'games');startGame('translate');gradeAdvanced()}),[]);
   // Topic games and the separate final-exam renderer also emit exactly one result.
   await page.evaluate(()=>{topicOpen(1);topicMode('han');tones=[]});await page.locator('.topic-options button').first().click();
   assert.deepEqual(await page.evaluate(()=>tones),(await page.locator('#topicFeedback').innerText()).includes('✓ Chính xác!')?right:wrong);
   await page.evaluate(()=>{topicExit();openLesson(1,'games');startFinalExam();const w=session.questions[session.index];w.examMode='hanzi';renderExamQuestion();tones=[]});
   await expectNotes(()=>page.evaluate(()=>{answerExam(session.options.findIndex(x=>x.id===session.questions[0].id));answerExam(0)}),right);

   if(level===1){await page.evaluate(()=>{openLesson(1,'games');startPassages()});await page.locator('[data-reading="open"]').first().click();await expectNotes(()=>page.evaluate(()=>{const s=session,q=s.passages[0].questions[s.qi];gradePassage(s.options.indexOf(q.answer));gradePassage(0)}),right);
    await page.evaluate(()=>GrammarMastery.start('u03-g01',1,true));await expectNotes(()=>page.evaluate(()=>{const q=GrammarMastery.bank.points.find(p=>p.id==='u03-g01').questions.find(q=>q.level===1);const i=q.options.findIndex(o=>GrammarMastery.normalize(o.text)===GrammarMastery.normalize(q.answer));document.querySelector(`[data-gm=choice][data-index="${i}"]`).click()}),right);
   }else{
    for(const mode of ['choice','order']){
     await page.evaluate(mode=>{openLesson(1,'games');h2StartGrammar(mode);tones=[]},mode);
     if(mode==='choice')await page.locator('.h2-answer').first().click();
     else {await page.locator('.h2-tiles button').first().click();await page.evaluate(()=>h2AnswerGrammar());}
     const text=await page.locator('#h2-feedback').innerText();assert.deepEqual(await page.evaluate(()=>tones),text.includes('✓ Chính xác!')?right:wrong);
     const before=await page.evaluate(()=>tones.length);await page.evaluate(()=>h2AnswerGrammar(0));assert.equal(await page.evaluate(()=>tones.length),before);
    }
    await page.evaluate(()=>{openLesson(1,'games');h2StartReading(0);tones=[];h2AnswerReading(0);h2AnswerReading(0)});
    assert.deepEqual(await page.evaluate(()=>tones),(await page.locator('#h2-feedback').innerText()).includes('✓ Chính xác!')?right:wrong);
    await page.evaluate(()=>{openLesson(1,'games');h2StartGrammar('write');document.querySelector('#h2-grammar-input').value='我的答案'});await expectNotes(()=>page.evaluate(()=>h2AnswerGrammar()),[]);await expectNotes(()=>page.evaluate(()=>h2SelfNext(true)),right);
   }
  }else{
   for(const mode of ['hanzi','meaning','pinyin','listen','listen-sentence','cloze','grammar','passages','mixed'])for(const correct of [true,false]){
    await page.goto(`${base}/HSK4/index.html#lesson/1/games`);await page.locator(`[data-mode="${mode}"]`).click();if(mode==='passages')await page.locator('[data-reading-id]').first().click();await page.waitForSelector('#answerArea');const index=await page.evaluate(correct=>{const q=HSK4.getSession().questions[0];return q.options.findIndex(x=>correct?x===q.answer:x!==q.answer)},correct);
    await expectNotes(()=>page.locator(`[data-action="answer"][data-index="${index}"]`).click(),correct?right:wrong);
   }
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow');assert.equal(await page.locator('[data-game-sounds]').count(),1);
  // Unavailable Web Audio must not break normal scoring.
  await page.reload();await page.waitForSelector('[data-game-sounds]');await page.evaluate(()=>{AudioContext=undefined;webkitAudioContext=undefined;HSKGameSounds.play(true)});
  if(level<4){await page.evaluate(()=>{openLesson(1,'games');startGame('hanzi');checkAnswer(session.options.findIndex(x=>x.id===session.questions[0].id))});assert((await page.locator('#feedback').innerText()).includes('Chính xác'));}
  console.log(`PASS HSK${level}: grading hooks, distinct tones, nullable/duplicate answers, mute/reload, mobile layout and unavailable audio`);await page.close();
 }
 // Actual browser AudioContext also accepts envelopes and cleans up nodes.
 const real=await browser.newPage();real.on('pageerror',e=>errors.push(e.message));await real.route('https://fonts.googleapis.com/**',r=>r.abort());await real.goto(`${base}/HSK4/index.html#lesson/1/games`);await real.locator('[data-mode="hanzi"]').click();await real.locator('[data-action="answer"]').first().click();await real.waitForTimeout(400);await real.close();
 const blocked=await browser.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.route('https://fonts.googleapis.com/**',r=>r.abort());await blocked.addInitScript(()=>{window.AudioContext=class{constructor(){this.state='suspended'}resume(){return Promise.reject(Error('blocked'))}};Storage.prototype.setItem=()=>{throw Error('storage blocked')};});await blocked.goto(`${base}/HSK4/index.html#lesson/1/games`);await blocked.waitForSelector('[data-game-sounds]');await blocked.evaluate(()=>HSKGameSounds.play(true));await blocked.locator('[data-game-sounds]').click();await blocked.locator('[data-game-sounds]').click();await blocked.waitForTimeout(50);await blocked.close();assert.deepEqual(errors,[]);

 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
