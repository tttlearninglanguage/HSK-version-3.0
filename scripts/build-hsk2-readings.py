"""Compile authored HSK 2 readings with cumulative HSK 1 + HSK 2 scope checks."""
from pathlib import Path
from functools import lru_cache
from collections import Counter
import re,json,hashlib,ast
ROOT=Path(__file__).resolve().parents[1];page=ROOT/'HSK2/index.html';source=page.read_text()
first={};provenance={}
for level in [1,2]:
 text=(ROOT/f'HSK{level}/index.html').read_text();lessons=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',text)[1])
 for lesson in lessons:
  for w in lesson['words']:
   if w['hanzi'] not in first:first[w['hanzi']]=0 if level==1 else lesson['id'];provenance[w['hanzi']]=f'HSK {level} Unit {lesson["id"]}'
extras={'李文':(0,'HSK 1 Unit 2 title'),'李':(0,'Surname in the learned name 李文'),'一样':(9,'HSK 2 Unit 9 equality formula'),'相比':(12,'HSK 2 Unit 12 comparison formula'),'比起':(12,'HSK 2 Unit 12 comparison formula'),'出来':(5,'HSK 2 Unit 5 directional formula 出 + 来'),'跳':(14,'跳舞 in the learned duration pattern V+O+V+duration'),'支':(10,'Classifier in Unit 10 笔 example 这支笔是新买的')}
for word,(unit,origin) in extras.items():first[word]=unit;provenance[word]=origin
lex=sorted(first,key=lambda w:-len(w))
def tokenize(text,unit):
 tokens=[]
 for chunk in re.findall('[\u3400-\u9fff]+',text):
  @lru_cache(None)
  def solve(i):
   if i==len(chunk):return ()
   for w in lex:
    if first[w]<=unit and chunk.startswith(w,i):
     rest=solve(i+len(w))
     if rest is not None:return (w,)+rest
   return None
  found=solve(0)
  if found is None:raise ValueError(f'Unit {unit}: outside learned vocabulary: {chunk}')
  tokens.extend(found)
 return tokens
# Reuse reviewed choice categories, not HSK 1 story templates or text.
tree=ast.parse((ROOT/'scripts/build-hsk1-readings.py').read_text());pools=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='pools' for t in n.targets))
additions={
 'so':'第一次/两次/三次/四次/五次/两名/三名/四名/五名/十多名/三十多名/二十多个/十多个/二十多人/三百元/二百元/十元/五元/一支/两支/三支/四支',
 'gio':'两点半/十一点半/八点二十分/九点二十分/三点五十分/两个星期/三个星期/一个星期/快两年/五点半/八点半/一个半小时',
 'noi':'学校外/超市前/书店外/学校的书店/前边的大教室/我家/学校旁边/桌子左边/左边/右边/旁边/门口/教室后面/公司/药店/学校的教室/学校里面/洗手间/书店里面/地铁站/医院旁边/房子前面/电影院左边的饭馆',
 'viec':'坐公交车/打车/跑步/踢足球/游泳/洗杯子/洗菜/买菜/买票/做米饭/做鱼/画画/跳舞/上网/考试/准备晚饭/送书/找书/介绍意思/走一会儿/跑太快/不要等我吃饭/要上课/有课',
 'dap':'不懂/不高/太长/太小/不太大/很近/很远/累/贵一点儿/大一些/没有了/对了/晴天/阴天/有点儿小/不知道怎么游/没有/有一个问题不懂',
 'nguoi':'爷爷/奶奶/丈夫/妻子/男孩儿/女孩儿/家人/中国学生/外国学生/朋友的妈妈/朋友的妻子/来接我的朋友/小时候的朋友/三个同学/高中学生/李',
 'do':'中文电影/大杯子/书里的问题/生日画/画笔/鱼/花/学校/小的/贵的/坏手表/手表/笔/本子/新本子/车/姓名/姓名和时间/画画的书/最小的/小时候的学校/中国的书/电话的号',
 'mon':'奶茶/肉/鱼和肉/米饭和肉/蛋糕/蛋糕和牛奶/面包和牛奶/热茶',
 'tu':'红色/白色/黑色/绿色/绿色和黑色/红色和白色/红色和绿色/白色和黑色/红色和黑色/绿色和白色',
}
for cat,values in additions.items():pools[cat]+='/'+values
match=re.search(r'window.HSK2_UPDATE=(.*);',source);data=json.loads(match[1]);known={w['hanzi'] for w in data['dictionary']}
reviewed=json.loads(re.search(r'const entries = (\[.*?\]);',(ROOT/'HSK1/data/reading-dictionary.js').read_text(),re.S)[1])
for word in reviewed:
 if word['hanzi'] in ['李文','李'] and word['hanzi'] not in known:data['dictionary'].append(word)
if '跳' not in known:data['dictionary'].append({'hanzi':'跳','pinyin':'tiào','meaning':'nhảy, múa (thành phần động từ của 跳舞)','source':'HSK 2 Unit 14: 跳舞 tiàowǔ'})
if '有时间' not in known:data['dictionary'].append({'hanzi':'有时间','pinyin':'yǒu shíjiān','meaning':'có thời gian, rảnh','source':'Learned HSK 1 combination: 有 + 时间; prevents incorrect 有时 + 间 splitting'})
dictionary=sorted(data['dictionary'],key=lambda w:-len(w['hanzi']))
def annotate(text):
 out=[];i=0
 while i<len(text):
  if not re.match('[\u3400-\u9fff]',text[i]):out.append(text[i]);i+=1;continue
  word=next((w for w in dictionary if text.startswith(w['hanzi'],i)),None)
  if not word or not word.get('pinyin') or not word.get('meaning'):raise ValueError(f'Missing dictionary: {text[i:]}')
  out.append(word['pinyin']);i+=len(word['hanzi'])
 return ' '.join(out)
blocks=re.split('^@',(ROOT/'HSK2/content/readings-v2.txt').read_text(),flags=re.M)[1:];records=[];report=[];counts=Counter()
for block in blocks:
 lines=block.strip().splitlines();unit,title=lines.pop(0).split('/',1);unit=int(unit);counts[unit]+=1;rid=f'H2-R{unit:02}-{counts[unit]}'
 vi=next(i for i,l in enumerate(lines) if l.startswith('VI: '));text='\n'.join(lines[:vi]);translation=lines[vi][4:];qa=lines[vi+1:];assert len(qa)==6,rid
 size=len(re.findall('[\u3400-\u9fff]',text));assert 150<=size<=240,(rid,size)
 used=set(tokenize(text,unit));questions=[]
 if unit<4:assert not re.search('过(?!来)',text),(rid,'experience before Unit 4')
 if unit<7:assert not re.search('(?<!觉)得',text),(rid,'得 before Unit 7')
 for index,line in enumerate(qa,1):
  fields=line.split('|');question,answer,category=fields[:3];used.update(tokenize(question,unit));used.update(tokenize(answer,unit));eligible=[]
  for choice in dict.fromkeys(pools[category].split('/')):
   if choice==answer or choice in answer or answer in choice:continue
   try:tokenize(choice,unit)
   except ValueError:continue
   eligible.append(choice)
  suffix=next((v for v in ['口人','块钱','分钟','岁','本','斤','件','只','元','天','个','课','名','次','支'] if answer.endswith(v)),None) if category=='so' else None
  narrowed=[v for v in eligible if v.endswith(suffix)] if suffix else []
  if category=='gio' and '点' in answer:narrowed=[v for v in eligible if '点' in v]
  if category=='gio' and answer.startswith('星期'):narrowed=[v for v in eligible if v.startswith('星期')]
  if category=='tu' and '色' in answer:narrowed=[v for v in eligible if v.endswith('色') and '和' not in v]
  if category=='tu' and '和' in answer:narrowed=[v for v in eligible if '和' in v and '色' in v]
  if category=='viec':
   transport=['坐飞机','坐火车','坐出租车','坐公交车','坐地铁','打车','开车','走路']
   sports=['打篮球','踢足球','跑步','游泳','走路']
   if answer in transport or answer=='打车':
    narrowed=[]
    for v in transport:
     if v=='打车':continue
     if v==answer or ({v,answer}<={'坐出租车','打车'}):continue
     try:tokenize(v,unit)
     except ValueError:continue
     narrowed.append(v)
   elif answer in sports and '运动' in question:narrowed=[v for v in eligible if v in sports]
  if category=='dap' and '天气' in question:
   narrowed=[v for v in ['晴天','阴天','下雨了','下雪了','很热','很冷'] if v!=answer]
   narrowed=[v for v in narrowed if all(first[w]<=unit for w in tokenize(v,unit))]
  if len(narrowed)>=3:eligible=narrowed
  assert len(eligible)>=3,(rid,category)
  start=int(hashlib.sha256(f'{rid}-{index}'.encode()).hexdigest()[:6],16)%len(eligible);options=(eligible[start:]+eligible[:start])[:3];options.insert((unit+index)%4,answer)
  if len(fields)>4:
   options=fields[4].split('/');assert len(options)==3;options.insert((unit+index)%4,answer)
  for option in options:used.update(tokenize(option,unit));annotate(option)
  annotate(question);annotate(answer)
  chars=set(re.findall('[\u3400-\u9fff]',question));segments=[v.strip() for v in re.split(r'(?<=[。！？])|\n',text) if v.strip()]
  def score(segment):return 2*len(chars&set(segment))+(8 if answer in segment else 0)-(8 if segment.endswith('？') else 0)
  evidence=fields[3] if len(fields)>3 else max(segments,key=score);assert evidence in text,(rid,evidence)
  questions.append({'id':f'{rid}-v2-Q{index}','question':question,'answer':answer,'options':options,'explanation':f'Thông tin đối chiếu trong bài: “{evidence}”','evidence':evidence})
 # Metadata lists only structures taught by this Unit; the prose is reviewed separately.
 lesson=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',source)[1])[unit-1]
 record={'id':rid,'lesson':unit,'revision':2,'title':title,'text':text,'translation':translation,'pinyin':annotate(text),'grammar':list(dict.fromkeys(g['name'] for g in lesson['grammar'])),'questions':questions}
 records.append(record);report.append({'id':rid,'lesson':unit,'title':title,'hanziCount':size,'sha256':hashlib.sha256(text.encode()).hexdigest(),'vocabulary':[{'hanzi':w,'firstHsk2Lesson':first[w],'source':provenance[w]} for w in sorted(used)],'outsideScope':[]})
assert len(records)==75 and all(counts[i]==5 for i in range(1,16));assert len({r['text'] for r in records})==75;assert len({r['title'] for r in records})==75
data['readings']=records;source=source[:match.start(1)]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+source[match.end(1):];page.write_text(source)
(ROOT/'HSK2/content/readings-v2.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'HSK2/content/readings-v2-audit.json').write_text(json.dumps({'revision':2,'readings':75,'questions':450,'scope':'All HSK 1 + HSK 2 through current Unit','supplementalLearnedForms':extras,'readingsAudit':report},ensure_ascii=False,indent=2)+'\n')
print(f'Built 75 distinct readings / 450 questions; {min(r["hanziCount"] for r in report)}–{max(r["hanziCount"] for r in report)} Han characters; zero outside-scope or missing dictionary tokens.')
