"""Snapshot the existing HSK 3 CSS without changing any earlier course."""
from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
source = (root / 'hsk3.html').read_text()
blocks = re.findall(r'<style([^>]*)>(.*?)</style>', source, re.S)
header = '/* Generated from hsk3.html by scripts/sync-hsk3-theme.py. Keep original cascade order. */\n'
(root / 'HSK4/hsk3-theme.css').write_text(header + '\n'.join('/* HSK 3 style block ' + str(i) + ' ' + a.strip() + ' */\n' + css for i, (a, css) in enumerate(blocks)) + '\n')
