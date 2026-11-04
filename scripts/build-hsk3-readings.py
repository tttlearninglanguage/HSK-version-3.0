"""Compile 90 authored HSK 3 readings; verify cumulative learned vocabulary and lookup coverage."""
from pathlib import Path
from collections import Counter
import re,json,hashlib,ast,runpy
ROOT=Path(__file__).resolve().parents[1];page=ROOT/'HSK3/index.html';source=page.read_text()
scope=runpy.run_path(str(ROOT/'scripts/hsk3-reading-scope.py'))
first=scope['first'];provenance=scope['origins'];extras={}
def tokenize(text,unit):
 out=[]
 for chunk in re.findall('[\u3400-\u9fff]+',text):
  unknown,tokens=scope['segment'](chunk,unit)
  if unknown:raise ValueError(f'Unit {unit}: outside learned vocabulary: {chunk}')
  out.extend(tokens)
 return out
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
match=re.search(r'window.HSK3_UPDATE=(.*);',source);data=json.loads(match[1]);known={w['hanzi'] for w in data['dictionary']}
for w in [{'hanzi':'李文','pinyin':'Lǐ Wén','meaning':'Lý Văn (tên người)','source':'HSK 1 Unit 2'}, {'hanzi':'李','pinyin':'Lǐ','meaning':'họ Lý','source':'HSK 1 Unit 2: 李文'}, {'hanzi':'拍','pinyin':'pāi','meaning':'chụp (ảnh); động từ trong 拍照','source':'HSK 3 Unit 5: 拍照'}, {'hanzi':'有时间','pinyin':'yǒu shíjiān','meaning':'có thời gian, rảnh','source':'HSK 1: 有 + 时间'}]:
 if w['hanzi'] not in known:data['dictionary'].append(w)
dictionary=sorted(data['dictionary'],key=lambda w:-len(w['hanzi']))
lookup={w['hanzi']:w for w in dictionary}
current_unit=1
context_maps={}
def annotate(text):
 output=[]
 for part in re.split('([\u3400-\u9fff]+)',text):
  if not re.match('[\u3400-\u9fff]',part):output.append(part);continue
  ts=tokenize(part,current_unit);index=0;annotated=[]
  for token in ts:
   w=lookup.get(token)
   if not w or not w.get('pinyin') or not w.get('meaning'):raise ValueError(f'Missing dictionary: {token}')
   pin=w['pinyin']
   if token=='还':pin='huán' if re.match('(?:书|伞)',part[index+1:]) or (part[index+1:index+2]=='给' and re.search('(?:把|伞|书|钱|东西)$',part[:index])) or index==len(part)-1 else 'hái'
   if token=='得':pin='děi' if re.match('(?:多练|带大衣|回去)',part[index+1:]) else 'dé' if part[index+1:index+2]=='了' else 'de'
   if token=='只':pin='zhī' if index>0 and part[index-1] in '一二两三四五六七八九十几这那' else 'zhǐ'
   if token=='长':pin='zhǎng' if part[index+1:index+2] in ['大','得'] else 'cháng'
   if token=='种':pin='zhǒng'
   if token=='了' and index>0 and part[index-1]=='不':pin='liǎo'
   meaning=w['meaning']
   if token=='还':meaning='trả lại' if pin=='huán' else 'vẫn, còn; còn ... nữa'
   if token=='得':meaning={'děi':'phải, cần phải','dé':'đạt được, giành được','de':'trợ từ nối động từ với bổ ngữ mức độ hoặc khả năng'}[pin]
   if token=='只':meaning='lượng từ chỉ động vật' if pin=='zhī' else 'chỉ, chỉ có'
   if token=='种':meaning='loại, kiểu; lượng từ chỉ chủng loại'
   if token=='了' and pin=='liǎo':meaning='được, nổi; dùng trong bổ ngữ khả năng'
   if token=='长':meaning='lớn lên, phát triển' if pin=='zhǎng' else 'dài'
   annotated.append({'hanzi':token,'pinyin':pin,'meaning':meaning});output.append(pin);index+=len(token)
  context_maps[part]=annotated
 return ' '.join(output)
blocks=re.split('^@',(ROOT/'HSK3/content/readings-v2.txt').read_text(),flags=re.M)[1:];records=[];report=[];counts=Counter()
for block in blocks:
 lines=block.strip().splitlines();unit,title=lines.pop(0).split('/',1);unit=int(unit);current_unit=unit;context_maps={};counts[unit]+=1;rid=f'H3-R{unit:02}'+('' if counts[unit]==1 else f'-{counts[unit]}')
 vi=next(i for i,l in enumerate(lines) if l.startswith('VI: '));text='\n'.join(lines[:vi]);translation=lines[vi][4:];qa=lines[vi+1:];assert len(qa)==6,rid
 size=len(re.findall('[\u3400-\u9fff]',text));assert 225<=size<=340,(rid,size)
 used=set(tokenize(text,unit));questions=[]
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
 record={'id':rid,'lesson':unit,'revision':2,'title':title,'text':text,'translation':translation,'pinyin':annotate(text),'grammar':list(dict.fromkeys(g['name'] for g in lesson['grammar'])),'questions':questions,'tokens':context_maps}
 records.append(record);report.append({'id':rid,'lesson':unit,'title':title,'hanziCount':size,'sha256':hashlib.sha256(text.encode()).hexdigest(),'vocabulary':[{'hanzi':w,'firstHsk3Lesson':first[w],'source':provenance[w]} for w in sorted(used)],'outsideScope':[]})
assert len(records)==90 and all(counts[i]==5 for i in range(1,19));assert len({r['text'] for r in records})==90;assert len({r['title'] for r in records})==90
archive=ROOT/'HSK3/content/readings-v1.archive.json'
if not archive.exists():archive.write_text(json.dumps(data['readings'],ensure_ascii=False,indent=2)+'\n')
data['readings']=records;source=source[:match.start(1)]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+source[match.end(1):];page.write_text(source)
(ROOT/'HSK3/content/readings-v2.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'HSK3/content/readings-v2-audit.json').write_text(json.dumps({'revision':2,'readings':90,'questions':540,'scope':'HSK 1–2 lessons/topics and grammar forms; HSK 3 through the current Unit','supplementalLearnedForms':extras,'readingsAudit':report},ensure_ascii=False,indent=2)+'\n')
print(f'Built 90 distinct readings / 540 questions; {min(r["hanziCount"] for r in report)}–{max(r["hanziCount"] for r in report)} Han characters; zero outside-scope or missing dictionary tokens.')
