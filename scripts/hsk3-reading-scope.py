import re,json,functools,collections
from pathlib import Path
root=Path(__file__).resolve().parents[1];first={};origins={}
for level in [1,2,3]:
 s=(root/f'HSK{level}/index.html').read_text();lessons=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',s)[1])
 for l in lessons:
  for w in l['words']:
   first.setdefault(w['hanzi'],0 if level<3 else l['id']);origins.setdefault(w['hanzi'],f'HSK {level} Unit {l["id"]}')
for w in ['李文','李','一样','相比','比起','出来','跳','支']:first[w]=0;origins[w]='Learned HSK 1–2 title or grammar example'
# HSK 1–2 topics are already learned by entry to HSK 3; preserve their sources.
for level in [1,2]:
 s=(root/f'HSK{level}/index.html').read_text();topics=json.loads(re.search(r'const TOPICS=(\[.*\]);',s)[1])
 for topic in topics:
  for w in topic['words']:
   first[w['hanzi']]=0;origins[w['hanzi']]=f'HSK {level} topic {topic["id"]}'
# Accept explicit forms in prior/current grammar examples, not future lesson vocabulary.
dictionary=json.loads(re.search(r'window.HSK3_UPDATE=(.*);',(root/'HSK3/index.html').read_text())[1])['dictionary']
for level in [1,2,3]:
 s=(root/f'HSK{level}/index.html').read_text();lessons=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',s)[1])
 for lesson in lessons:
  u=0 if level<3 else lesson['id']
  examples=' '.join(d for g in lesson['grammar'] for d in g['details'] if re.search('[\u3400-\u9fff]',d))
  for word in dictionary:
   w=word['hanzi']
   if len(w)>1 and w in examples and first.get(w,100)>u:
    first[w]=u;origins[w]=f'HSK {level} Unit {lesson["id"]} grammar example/formula'
first['拍']=5;origins['拍']='HSK 3 Unit 5 separable verb 拍照 (拍 + 照)'
lex=sorted(first,key=lambda w:-len(w));byfirst=collections.defaultdict(list)
for w in lex:byfirst[w[0]].append(w)
def segment(t,u):
 @functools.lru_cache(None)
 def go(i):
  if i==len(t):return (0,())
  opts=[]
  for w in byfirst[t[i]]:
   if first[w]<=u and t.startswith(w,i):
    n,rest=go(i+len(w));opts.append((n,(w,)+rest))
  n,rest=go(i+1);opts.append((n+1,('!'+t[i],)+rest));return min(opts,key=lambda x:x[0])
 return go(0)
