"""Compile the 50 authored HSK 4 readings; preserve every non-reading practice field."""
from pathlib import Path
from collections import Counter
import json,re,hashlib,runpy
ROOT=Path(__file__).resolve().parents[1]
scope=runpy.run_path(str(ROOT/'scripts/hsk4-reading-scope.py'))
lookup=dict(scope['dictionary'])
for level in [1,2,3]:
 source=(ROOT/f'HSK{level}/index.html').read_text()
 groups=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',source)[1])+json.loads(re.search(r'const TOPICS=(\[.*\]);',source)[1])
 for group in groups:
  for word in group['words']:lookup.setdefault(word['hanzi'],word)
for hanzi,pinyin,meaning in [('小林','Xiǎo Lín','Tiểu Lâm (tên nhân vật)'),('小陈','Xiǎo Chén','Tiểu Trần (tên nhân vật)'),('小王','Xiǎo Wáng','Tiểu Vương (tên nhân vật)'),('小周','Xiǎo Zhōu','Tiểu Chu (tên nhân vật)'),('拍','pāi','chụp (ảnh); thành phần động từ 拍照'),('照','zhào','chụp (ảnh); thành phần động từ 照相'),('李文','Lǐ Wén','Lý Văn (tên người)'),('李','Lǐ','họ Lý')]:
 lookup.setdefault(hanzi,{'hanzi':hanzi,'pinyin':pinyin,'meaning':meaning})
def tokens(text,unit):
 result=[]
 for chunk in re.findall('[\u3400-\u9fff]+',text):
  n,words=scope['segment'](chunk,unit)
  if n:raise ValueError(f'Outside learned scope Unit {unit}: {chunk}')
  result.extend(words)
 return result
current_unit=1
maps={}
used=set()
def annotate(text):
 output=[]
 for chunk in re.split('([\u3400-\u9fff]+)',text):
  if not re.match('[\u3400-\u9fff]',chunk):output.append(chunk);continue
  words=tokens(chunk,current_unit);used.update(words);annotated=[];i=0
  for word in words:
   w=lookup.get(word)
   if not w or not w.get('pinyin') or not w.get('meaning'):raise ValueError(f'Missing reading gloss: {word}')
   pin=w['pinyin'];meaning=w['meaning'];after=chunk[i+len(word):];before=chunk[:i]
   if word=='还':
    pin='huán' if i==len(chunk)-1 or re.match('(?:书|杯子|给)',after) and not re.match('给(?:我|他|她|大家).*(?:介绍|讲|看|说)',after) else 'hái'
    meaning='trả lại' if pin=='huán' else 'vẫn, còn; còn thêm'
   if word=='得':
    pin='děi' if after.startswith(('吃完','提前','去','准备')) else 'dé' if after.startswith('了') else 'de'
    meaning={'děi':'phải, cần phải','dé':'đạt được','de':'trợ từ nối động từ với bổ ngữ'}[pin]
   if word=='只':
    pin='zhī' if before and before[-1] in '一两三四五六七八九十几这那' else 'zhǐ';meaning='lượng từ chỉ động vật' if pin=='zhī' else 'chỉ, chỉ có'
   if word=='种':
    pin='zhòng' if after.startswith(('的','花')) else 'zhǒng';meaning='trồng' if pin=='zhòng' else 'loại, kiểu; lượng từ chỉ chủng loại'
   if word=='转' and after.startswith(('了一会','得快')):pin='zhuàn';meaning='quay, xoay; ở đây chỉ biểu tượng đang tải'
   if word=='长':pin='zhǎng' if after.startswith(('大','得')) else 'cháng';meaning='lớn lên' if pin=='zhǎng' else 'dài'
   if word=='了' and before.endswith(('不','受不')):pin='liǎo';meaning='được, nổi; bổ ngữ khả năng'
   if word=='好':
    meaning='khỏe hơn, bình phục' if after.startswith(('些','起来')) else 'xong; sẵn sàng (bổ ngữ kết quả)' if re.search('(?:写|关|准备|收拾|记|安排|选|整理|学)$',before) else 'tốt, ổn'
   if word=='等':
    pin='děng';meaning='vân vân, ...' if before.endswith(('交通','信息','地址')) else 'đợi, chờ'
   if word=='光':meaning='ánh sáng'
   if word=='对':meaning='hướng về, đối diện với' if after.startswith('着') else 'đối với, với' if after.startswith(('我','你','他','她','大家','产品')) else 'đúng'
   if word=='过' and after.startswith(('了','一会')):meaning='qua, trôi qua'
   if word=='当' and after.startswith(('礼物','作业')):meaning='coi là, dùng làm'
   annotated.append({'hanzi':word,'pinyin':pin,'meaning':meaning});output.append(pin);i+=len(word)
  maps[chunk]=annotated
 return ' '.join(output)
records=[];audit=[];counts=Counter();by_unit={i:[] for i in range(1,11)}
for block in re.split('^@',(ROOT/'HSK4/content/readings-v2.txt').read_text(),flags=re.M)[1:]:
 lines=block.strip().splitlines();u,title,genre=lines[0].split('/',2);unit=int(u);current_unit=unit;maps={};used=set();counts[unit]+=1;rid=f'hsk4-L{unit:02}-R{counts[unit]:02}'
 text=lines[1];translation=lines[2].removeprefix('VI: ');assert lines[2].startswith('VI: ');assert len(lines[3:])==5
 size=len(re.findall('[\u3400-\u9fff]',text));assert 230<=size<=340,(rid,size)
 pin=annotate(text);questions=[];segments=[v.strip() for v in re.findall(r'.+?(?:[。！？][”’]?|$)',text) if v.strip()]
 for i,line in enumerate(lines[3:],1):
  fields=line.split('|');kind,question,options,anchor=fields[:4];rationale=fields[4] if len(fields)>4 else '';options=options.split('/');assert len(options)==4 and len(set(options))==4,(rid,question)
  answer=options[0];options=options[1:];options.insert((unit+counts[unit]+i)%4,answer)
  start,*end=anchor.split('~~');a=next((i for i,s in enumerate(segments) if start in s),None);assert a is not None,(rid,start)
  b=next((i for i,s in enumerate(segments) if i>=a and end[0] in s),None) if end else a;assert b is not None,(rid,anchor)
  evidence=''.join(segments[a:b+1]);assert evidence in text
  for value in [question,*options]:annotate(value)
  questions.append({'id':f'{rid}-v2-Q{i:02}','kind':kind,'question':question,'options':options,'answer':answer,'evidence':evidence,'explanation':f'Đối chiếu trong bài: “{evidence}” → {answer}.'+(f' {rationale}' if rationale else '')})
 record={'id':rid,'lesson':unit,'revision':2,'title':title,'genre':genre,'text':text,'pinyin':pin,'translation':translation,'questions':questions,'sourceType':'supplementary','tokens':maps}
 records.append(record);by_unit[unit].append(record);audit.append({'id':rid,'lesson':unit,'title':title,'genre':genre,'hanziCount':size,'sha256':hashlib.sha256(text.encode()).hexdigest(),'vocabulary':[{'hanzi':w,'firstHsk4Lesson':scope['first'][w],'source':scope['origin'][w]} for w in sorted(used)],'outsideScope':[]})
assert len(records)==50 and all(counts[i]==5 for i in range(1,11));assert len(set(r['text'] for r in records))==50;assert len(set(r['title'] for r in records))==50
archive=ROOT/'HSK4/content/readings-v1.archive.json'
if not archive.exists():archive.write_text(json.dumps([r for i in range(1,11) for r in json.loads((ROOT/f'HSK4/data/practice-{i:02}.json').read_text())['readings']],ensure_ascii=False,indent=2)+'\n')
for unit,readings in by_unit.items():
 path=ROOT/f'HSK4/data/practice-{unit:02}.json';data=json.loads(path.read_text());data['readings']=readings;path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(ROOT/'HSK4/content/readings-v2.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'HSK4/content/readings-v2-audit.json').write_text(json.dumps({'revision':2,'readings':50,'questions':250,'scope':'HSK 1–3 lessons/topics/examples plus HSK 4 through current Unit; personal names explicitly recorded','readingsAudit':audit},ensure_ascii=False,indent=2)+'\n')
print(f'Built 50 readings / 250 questions; {min(r["hanziCount"] for r in audit)}–{max(r["hanziCount"] for r in audit)} Han characters; zero unknown scope or gloss tokens.')
