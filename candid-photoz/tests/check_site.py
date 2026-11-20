"""Dependency-free checks for static navigation and essential page structures."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.ids, self.links, self.tags, self.scripts = path, [], [], [], []
        self.missing_alt = 0
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if 'id' in a: self.ids.append(a['id'])
        for key in ('src', 'href'):
            if a.get(key): self.links.append(a[key])
        if tag == 'script' and a.get('src'): self.scripts.append(urlsplit(a['src']).path)
        if tag == 'img' and 'alt' not in a: self.missing_alt += 1

pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
errors = []
assert len(pages) == 14
for name, page in pages.items():
    duplicate = [x for x, count in Counter(page.ids).items() if count > 1]
    if duplicate: errors.append(f'{name}: duplicate IDs {duplicate}')
    if sum(tag == 'h1' for tag, _ in page.tags) != 1: errors.append(f'{name}: expected one main heading')
    if page.missing_alt: errors.append(f'{name}: image alternative text missing')
    if page.scripts != ['./assets/data.js', './assets/core.js', './assets/app.js', './assets/planning.js']:
        errors.append(f'{name}: incorrect script order')
    if not any(tag == 'meta' and a.get('name') == 'robots' and a.get('content') == 'noindex,nofollow' for tag, a in page.tags):
        errors.append(f'{name}: preview must remain noindex')
    for link in page.links:
        ref = urlsplit(link)
        if ref.scheme or ref.netloc: continue
        target = (ROOT / unquote(ref.path)).resolve() if ref.path else page.path.resolve()
        if target.is_dir(): target /= 'index.html'
        if not target.is_file(): errors.append(f'{name}: missing {link}'); continue
        if ref.fragment and target.suffix == '.html':
            doc = pages.get(target.name)
            dynamic = target.name == 'work.html' and (ref.fragment.startswith('look-') or ref.fragment in ('prewedding', 'dubai'))
            if doc and ref.fragment not in doc.ids and not dynamic: errors.append(f'{name}: missing anchor {link}')

content = json.loads((ROOT / 'data/content.json').read_text())
assert len(content['faqs']) == 40
assert len(content['locations']) == 4
assert len(pages['answers.html'].ids) == len(set(pages['answers.html'].ids))
for faq in content['faqs']: assert faq['id'] in pages['answers.html'].ids
for place in content['locations']: assert place['id'] in pages['locations.html'].ids
assert sum('data-inspiration' in attrs for _, attrs in pages['work.html'].tags) == 17
assert sum('data-prep-check' in attrs for _, attrs in pages['checklists.html'].tags) == 24
assert sum('data-cost-row' in attrs for _, attrs in pages['investment.html'].tags) == 9
assert sum('data-film' in attrs for _, attrs in pages['films.html'].tags) == 5
assert not errors, '\n'.join(errors)
print('Static checks passed: 14 pages, navigation/assets/anchors, 40 FAQs, 4 guides, 17 references, 24 preparation items and 9 cost rows.')
