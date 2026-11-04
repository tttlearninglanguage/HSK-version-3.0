"""Cumulative vocabulary used to audit the authored HSK 4 reading revision."""
import json,re,collections,functools
from pathlib import Path
root=Path(__file__).resolve().parents[1];first={};origin={}
dictionary={w['hanzi']:w for name in ['dictionary','dictionary-upper','dictionary-overrides'] for w in json.load(open(root/f'HSK4/data/{name}.json'))}
# Load complete headwords first, so lower-level examples can license forms such as 地址.
for n in range(1,11):
 for w in json.load(open(root/f'HSK4/data/lesson-{n:02}.json'))['words']:dictionary[w['hanzi']]=w
for level in [1,2,3]:
 s=(root/f'HSK{level}/index.html').read_text();ls=json.loads(re.search(r'window.HSK_LESSONS\s*=\s*(\[.*?\]);',s)[1]);ts=json.loads(re.search(r'const TOPICS=(\[.*\]);',s)[1])
 for group in ls+ts:
  for w in group['words']:first[w['hanzi']]=0;origin[w['hanzi']]=f'HSK {level} learned lesson/topic'
 for lesson in ls+ts:
  examples=' '.join(w.get('example','') for w in lesson['words'])+' '+' '.join(v for g in lesson.get('grammar',[]) for v in g['details'])
  for w in dictionary:
   if len(w)>1 and w in examples:first[w]=0;origin[w]=f'HSK {level} Unit {lesson["id"]} learned example/grammar form'
for n in range(1,11):
 d=json.load(open(root/f'HSK4/data/lesson-{n:02}.json'))
 for w in d['words']:
  dictionary[w['hanzi']]=w
  if w['hanzi'] not in first:first[w['hanzi']]=n;origin[w['hanzi']]=f'HSK 4 Unit {n}'
 examples=' '.join(w.get('example','') for w in d['words'])+' '+' '.join(g['formula']+' '+ ' '.join(e['hanzi'] for e in g['examples']) for g in d['grammar'])
 for w in dictionary:
  if len(w)>1 and w in examples and first.get(w,100)>n:first[w]=n;origin[w]=f'HSK 4 Unit {n} learned example/grammar form'
for w in ['拍','跳','照','李文','李','窗','盐','项']:first[w]=0;origin[w]='HSK 1–3 learned name/separable verb'
origin['窗']='HSK 2 mục 靠: 请坐靠窗的那个座位。'
origin['盐']='HSK 2 mục 克: 做这个菜只需要五克盐。'
origin['项']='HSK 3 mục 进展: 这项工作进展得怎么样？'
origin['拍']='HSK 3 Unit 5: verb component of 拍照'
origin['照']='HSK 3 Unit 5: verb component of 照相'
origin['跳']='HSK 2 Unit 14: verb component of 跳舞'
origin['李文']='HSK 1 Unit 2 title'
origin['李']='Surname in learned name 李文'
for w in ['小林','小陈','小王','小周']:first[w]=0;origin[w]='Fictional personal name (not a new vocabulary target)'
by=collections.defaultdict(list)
for w in sorted(first,key=lambda w:-len(w)):by[w[0]].append(w)
def segment(t,u):
 @functools.lru_cache(None)
 def go(i):
  if i==len(t):return 0,()
  opts=[]
  for w in by[t[i]]:
   if first[w]<=u and t.startswith(w,i):
    n,rest=go(i+len(w));opts.append((n,(w,)+rest))
  n,rest=go(i+1);opts.append((n+1,('!'+t[i],)+rest));return min(opts,key=lambda x:x[0])
 return go(0)
