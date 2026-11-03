"""Compare the supplied DOCX with all ten shipped lessons. Never writes course data.

Usage: python scripts/audit-hsk4-upper-source.py '/path/to/HSK 4 upper.docx'
Uses only Python's standard library; the original document is not distributed.
"""
import argparse
import hashlib
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('document', type=Path)
args = parser.parse_args()
data = Path(__file__).resolve().parents[1] / 'HSK4' / 'data'
manifest = json.loads((data / 'upper-source-manifest.json').read_text())
assert hashlib.sha256(args.document.read_bytes()).hexdigest() == manifest['sourceSha256'], 'Different source document'
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
with zipfile.ZipFile(args.document) as doc:
    body = ET.fromstring(doc.read('word/document.xml'))
paragraphs = [''.join(t.text or '' for t in p.findall('.//w:t', ns)) for p in body.findall('.//w:p', ns)]
starts = [i for i, text in enumerate(paragraphs) if text.startswith('HSK 4 THƯỢNG')] + [len(paragraphs)]
assert len(starts) == 11
for n, (a, b) in enumerate(zip(starts, starts[1:]), 1):
    rows = paragraphs[a:b]
    lesson = json.loads((data / f'lesson-{n:02}.json').read_text())
    m = manifest['lessons'][n - 1]
    assert lesson['title'] == rows[1]
    count = int(re.match(r'(\d+)', rows[2])[1])
    index = rows.index('01', rows.index('VÍ DỤ · PINYIN · NGHĨA'))
    assert len(lesson['words']) == count
    for i, word in enumerate(lesson['words']):
        row = rows[index + i * 8:index + (i + 1) * 8]
        assert row[0] == f'{i + 1:02}'
        source = {**word, **word.get('sourceOriginal', {})}
        assert [source[k] for k in m['wordFields']] == row[1:], word['id']
    index = rows.index('02  NGỮ PHÁP / GRAMMAR') + 2
    for grammar in (g for g in lesson['grammar'] if g.get('sourceType') != 'user-supplement'):
        row = rows[index:index + 7]
        assert grammar['name'] == re.sub(r'^\d+\s+', '', row[0])
        assert grammar['formula'] == row[2]
        assert grammar['explanation'] == row[3]
        example = grammar['examples'][0]
        assert example['hanzi'] == re.sub(r'^Ví dụ 1\s+', '', row[4])
        assert example.get('sourcePinyin', example['pinyin']) == row[5]
        assert example['translation'] == row[6]
        index += 7
    assert not re.match(r'^\d{2}  ', rows[index] if index < len(rows) else '')
    print(f'PASS lesson {n}: {count} vocabulary rows and {len(m['grammarSource'])} grammar points match original DOCX, including recorded corrections')
