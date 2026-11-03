const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../HSK4/data'),read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const catalog=read('course.json'),manifest=read('upper-source-manifest.json'),corrections=read('source-corrections.json');
assert.deepEqual(catalog.lessons.map(l=>l.id),[1,2,3,4,5,6,7,8,9,10]);assert.equal(catalog.lower.status,'upcoming');assert.deepEqual(catalog.lower.lessons,[11,12,13,14,15,16,17,18,19,20]);
const lessons=catalog.lessons.map(e=>read(e.content)),practices=catalog.lessons.map(e=>read(e.practice));
const dictionary=new Map([...read('dictionary.json'),...read('dictionary-upper.json'),...lessons.flatMap(l=>l.words),...read('dictionary-overrides.json')].map(w=>[w.hanzi,w]));
const ids=new Set(),texts=new Set();let words=0,grammar=0,questions=0,checkedTexts=0;
for(const [index,l]of lessons.entries()){
 const m=manifest.lessons[index],p=practices[index],originalGrammar=l.grammar.filter(g=>g.sourceType!=='user-supplement'||g.sourceOriginal).map(g=>g.sourceOriginal||g);assert.equal(l.id,index+1);assert.equal(l.volume,'upper');assert.equal(p.lesson,l.id);assert.equal(l.words.length,m.wordCount);assert.equal(originalGrammar.length,m.grammarCount);
 const raw=l.words.map(w=>m.wordFields.map(k=>w.sourceOriginal?.[k]??w[k]));assert.equal(crypto.createHash('sha256').update(JSON.stringify(raw)).digest('hex'),m.wordsSha256,'original source hash lesson '+l.id);
 assert.deepEqual(originalGrammar.map(g=>({id:g.id,name:g.name,formula:g.formula,explanation:g.explanation,examples:g.examples.map(e=>({hanzi:e.hanzi,pinyin:e.sourcePinyin??e.pinyin,translation:e.translation}))})),m.grammarSource,'source grammar lesson '+l.id);
 assert.equal(p.vocabulary.length,l.words.length);assert(l.grammar.every(g=>p.grammar.some(q=>q.pointId===g.id)));words+=l.words.length;grammar+=l.grammar.length;
 for(const [i,w]of l.words.entries()){
  assert(!ids.has(w.id));ids.add(w.id);assert.equal(w.id,`hsk4-L${String(l.id).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`);assert(m.wordFields.every(k=>typeof w[k]==='string'&&w[k].trim()));assert(w.partOfSpeech);assert(w.example.includes(w.hanzi));
  const q=p.vocabulary[i];assert.equal(q.wordId,w.id);assert.equal(q.tokens.join(''),w.example);assert.equal(q.cloze.replace('＿＿＿',q.answer),w.example);assert.equal(q.answer,w.hanzi);assert.equal(new Set(q.options).size,4);assert.equal(q.options.filter(o=>o===q.answer).length,1);
  if(w.sourceOriginal)assert(corrections.words.some(c=>c.wordId===w.id));
 }
 for(const [i,g]of l.grammar.entries()){
  const q=p.grammar.find(q=>q.pointId===g.id);assert.equal(q.pointId,g.id);assert.equal(new Set(q.options).size,4);assert(q.options.includes(q.answer));assert.equal(q.question.replace('＿＿＿',q.answer),q.sentence);if(q.sourceType!=='supplementary')assert.equal(q.sentence,g.examples[0].hanzi);assert(g.usage&&g.note);
 }
 assert.equal(p.readings.length,5);const active=new Map(dictionary);for(const w of l.words)active.set(w.hanzi,w);const keys=[...active.keys()].sort((a,b)=>b.length-a.length);
 const checkLookup=text=>{let i=0;while(i<text.length){if(!/[\u3400-\u9fff]/.test(text[i])){i++;continue}const key=keys.find(k=>text.startsWith(k,i));assert(key,`Missing lookup in lesson ${l.id}: ${text.slice(i,i+15)}`);const w=active.get(key);assert(w.pinyin&&w.meaning);i+=key.length}checkedTexts++};
 for(const r of p.readings){assert.equal(r.lesson,l.id);assert(!ids.has(r.id));ids.add(r.id);assert(!texts.has(r.text));texts.add(r.text);assert(r.text.length>=170&&r.text.length<=220);assert(r.pinyin&&r.translation);assert.equal(r.sourceType,'supplementary');assert.equal(r.questions.length,5);checkLookup(r.text);
  for(const q of r.questions){questions++;assert(!ids.has(q.id));ids.add(q.id);assert(/[\u3400-\u9fff]/.test(q.question));assert(!/[àáảãạăâđêôơư]/i.test(q.question));assert.equal(new Set(q.options).size,4);assert(q.options.includes(q.answer));assert(q.options.every(o=>/[\u3400-\u9fff]/.test(o)));assert(q.explanation);if(l.id>1){checkLookup(q.question);q.options.forEach(checkLookup)}}
 }
 const w=p.writing;assert(w.sample&&w.samplePinyin&&w.translation);assert(w.suggestedWords.every(h=>l.words.some(x=>x.hanzi===h)));if(l.id>1){assert(w.sample.length>=100&&w.sample.length<=150);assert(w.outline.length>=3);checkLookup(w.sample)}
 console.log(`PASS lesson ${l.id}: ${l.words.length} source words, ${l.grammar.length} grammar points (DOCX + recorded supplements), source audit/corrections, cloze/order, 5 independent readings/25 questions, writing and lookup`);
}
assert.equal(words,387);assert.equal(grammar,37);assert.equal(questions,250);assert.equal(texts.size,50);
console.log(`PASS upper course: ${words} words, ${grammar} grammar points, 50 unique readings/${questions} questions, ${checkedTexts} lookup texts; lower remains upcoming.`);
