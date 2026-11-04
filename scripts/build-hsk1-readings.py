"""Build the 75 authored HSK 1 readings and an auditable cumulative-vocabulary report."""
from pathlib import Path
from collections import Counter
import json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
page=ROOT/'HSK1/index.html'
s=page.read_text()
lessons=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',s)[1])
first={}
for lesson in lessons:
 for w in lesson['words']:first.setdefault(w['hanzi'],lesson['id'])
first['李文']=2 # The name in Unit 2's lesson title, not an extra vocabulary requirement.
lex=sorted(first,key=lambda w:-len(w))
def tokenize(text,unit):
 out=[];i=0
 while i<len(text):
  if not re.match('[\u3400-\u9fff]',text[i]):i+=1;continue
  word=next((w for w in lex if first[w]<=unit and text.startswith(w,i)),None)
  if not word:raise ValueError(f'Unit {unit}, outside learned vocabulary: {text[i:]} in {text}')
  out.append(word);i+=len(word)
 return out
pools={
 'chao':'你好/您好/再见/谢谢/不客气/对不起/没关系/没事/大家好/老师好/同学们好/你们好',
 'nguoi':'我/你/老师/学生/同学/您/大家/你们/李文/姐姐/她/我们/爸爸/妈妈/哥哥/妹妹/儿子/女儿/他/弟弟/朋友/医生/售货员/服务员/家人/中国人/法国人/泰国人',
 'so':'一只/两只/三只/四只/四件/五件/一天/两天/四天/二十元/三十元/六十元/七十元/二十分钟/一个/两个/三个/四个/五个/六个/七个/八个/九个/十个/一口人/三口人/四口人/五口人/六口人/六岁/八岁/十岁/十二岁/十九岁/二十岁/三十九岁/四十岁/两本/三本/五本/十本/一斤/两斤/三斤/五斤/一件/两件/三天/五天/一半/三块钱/五块钱/十块钱/二十块钱/十五块钱/五十元/八十元/第一课/第二课/第三课/第十课/第十二课/五分钟/十分钟/十五分钟',
 'gio':'今天/明天/昨天/今年/明年/去年/上午/下午/晚上/早上/星期一/星期二/星期三/星期四/星期五/星期六/星期日/三月八号/四月一号/五月三号/八月十号/三点/五点/六点/七点/八点/九点/十点/六点半/七点半/八点半/六点十分/下午五点/下午两点/一点半/下课后/下班后/一年/两年/半个小时/一个小时',
 'noi':'中国/法国/泰国/家/超市/那边/电影院/医院/店里/房间里/学校/学校前/学校外/书店/桌子下/桌子前/前/后/大房间/小房间/桌子上/房间外边/前边/这边/饭店/公司/医院前边/北京/西安/机场',
 'viec':'叫/想/工作/认识/做饭/做菜/休息/买东西/吃饭/坐出租车/上课/下课/上班/下班/看电影/读书/看书/看电视/唱歌/学习/开车/睡觉/起床/喝水/吃晚饭/写字/写汉字/坐火车/坐飞机',
 'mon':'饺子和面条儿/菜和饺子/面条儿和菜/菜/饺子/面条儿/一些菜/牛奶/包子/米饭/牛奶和包子/米饭和菜/苹果/水果/水/热水/冷水/茶/热牛奶/一杯水/鸡蛋/面包',
 'do':'菜/饺子/面条儿/名字/电脑/我的电脑/桌子/猫/一只小狗/一只猫/中文课/中文书/书/医/杯子/一个杯子/一本书/雪/衣服/手机',
 'dap':'是/不是/有/没有/很忙/不忙/会/不会/想/不想/休息/不休息/去/不去/能/不能/很漂亮/不大/好吃/不贵/不在/很冷/下雨了/有点儿冷/太热了/不冷/可以/不可以/卖/不卖/很好看/看见了/很多',
 'tu':'好/很/也/不/是/叫/名字/什么/高兴/太/不太/多/少/新/喜欢/知道/正在',
}
blocks=re.split(r'^@', (ROOT/'HSK1/content/readings-v2.txt').read_text(),flags=re.M)[1:]
records=[];report=[];unit_count=Counter()
for block in blocks:
 lines=block.strip().splitlines();header=lines.pop(0);unit,title=header.split('/',1);unit=int(unit);unit_count[unit]+=1;rid=f'R{unit:02}-{unit_count[unit]}'
 vi=next(i for i,l in enumerate(lines) if l.startswith('VI: '));text='\n'.join(lines[:vi]);translation=lines[vi][4:];qa=lines[vi+1:]
 assert len(qa)==6,(rid,len(qa));assert '?' not in text,(rid,'draft marker')
 if unit<11:assert not re.search(r'正在|(?<!现)在(?:做|上课|睡觉|学习|看书|看电影)',text+' '.join(qa)),(rid,'progressive before Unit 11')
 used=set(tokenize(text,unit));questions=[]
 for index,line in enumerate(qa,1):
  fields=line.split('|');question,answer,category=fields[:3];used.update(tokenize(question,unit));used.update(tokenize(answer,unit))
  eligible=[]
  for option in pools[category].split('/'):
   try:tokenize(option,unit)
   except ValueError:continue
   if option!=answer and option not in answer and answer not in option and not ({option,answer}=={'我','李文'} and ('我叫李文' in text or '我是李文' in text)):eligible.append(option)
  # Keep distractors in the same quantity/clock/occupation class where the syllabus permits.
  suffix=next((v for v in ['口人','块钱','分钟','岁','本','斤','件','只','元','天','个','课'] if answer.endswith(v)),None) if category=='so' else None
  narrowed=[v for v in eligible if v.endswith(suffix)] if suffix else []
  if category=='gio' and '点' in answer:narrowed=[v for v in eligible if '点' in v]
  if category=='gio' and answer.startswith('星期'):narrowed=[v for v in eligible if v.startswith('星期')]
  if '什么工作' in question:narrowed=[v for v in eligible if v in ['老师','医生','售货员','服务员','学生']]
  if len(narrowed)>=3:eligible=narrowed
  if len(answer)==11 and all(c in '一二三四五六七八九零' for c in answer):eligible=[answer[:-1]+v for v in '三五七']
  if '星期日' in [answer]+eligible:eligible=[v for v in eligible if not (answer=='星期日' and v=='星期天')]
  assert len(eligible)>=3,(rid,category)
  # Rotate alternatives deterministically; stable questions retain reproducible review data.
  start=int(hashlib.sha256(f'{rid}-{index}'.encode()).hexdigest()[:6],16)%len(eligible)
  distractors=(eligible[start:]+eligible[:start])[:3];options=distractors.copy();options.insert((unit+index)%4,answer)
  for option in options:used.update(tokenize(option,unit))
  segments=[v for v in re.split(r'(?<=[。！？])|\n',text) if v.strip()];chars=set(re.findall('[\u3400-\u9fff]',question))
  def score(segment):return 2*len(chars&set(segment))+(8 if answer in segment else 0)-(8 if segment.rstrip().endswith('？') else 0)
  evidence=fields[3] if len(fields)>3 else max(segments,key=score)
  assert evidence in text,(rid,evidence)
  questions.append({'id':f'{rid}-v2-{index}','question':question,'answer':answer,'options':options,'explanation':f'Đáp án: {answer}. Thông tin đối chiếu trong bài: “{evidence.strip()}”','evidence':evidence.strip()})
 record={'id':rid,'lesson':unit,'revision':2,'format':'dialogue' if '\n' in text else 'paragraph','title':title,'text':text,'translation':translation,'questions':questions,'note':'Bài đọc biên soạn theo từ vựng và mẫu câu đã học đến Unit này.'}
 records.append(record);report.append({'id':rid,'lesson':unit,'title':title,'hanziCount':len(re.findall('[\u3400-\u9fff]',text)),'sha256':hashlib.sha256(text.encode()).hexdigest(),'vocabulary':[{'hanzi':w,'firstLesson':first[w]} for w in sorted(used)],'outsideScope':[]})
assert len(records)==75 and all(unit_count[i]==5 for i in range(1,16))
assert len({p['text'] for p in records})==75
match=re.search(r'window.HSK_READING\s*=\s*(\[.*?\]);',s)
s=s[:match.start(1)]+json.dumps(records,ensure_ascii=False)+s[match.end(1):];page.write_text(s)
(ROOT/'HSK1/content/readings-v2.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(ROOT/'HSK1/content/readings-v2-audit.json').write_text(json.dumps({'revision':2,'readings':75,'questions':450,'properNames':{'李文':{'firstLesson':2,'reason':'Unit 2 lesson title 我叫李文'}},'readingsAudit':report},ensure_ascii=False,indent=2)+'\n')
print('Built 75 unique readings / 450 questions; all text, questions and options fit cumulative vocabulary.')
