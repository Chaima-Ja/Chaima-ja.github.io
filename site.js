// To publish a post: copy blog/hello-world.html, write it, then add an entry here (newest first is not required).
const POSTS = [
  { title: 'Hello, world: why I started writing', date: '2026-11-02', icon: '📝', tags: ['meta'], url: 'blog/hello-world.html' },
];

// theme toggle
const root = document.documentElement, btn = document.getElementById('theme');
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
const paint = () => btn.textContent = isDark() ? '☾' : '☀︎';
btn.onclick = () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  paint();
};
paint();

// post lists: <ul class="posts" data-posts="latest|all" data-base="">
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = d => new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
const item = (p, base) => `<li><span class="icon">${p.icon}</span>
  <div><h3><a class="post-link" href="${base}${p.url}">${esc(p.title)}</a></h3><span class="mono">${fmt(p.date)}</span></div>
  <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div></li>`;

const latest = document.querySelector('[data-posts="latest"]');
if (latest) latest.innerHTML = sorted.slice(0, 4).map(p => item(p, '')).join('');

const archive = document.getElementById('archive');
if (archive) {
  const search = document.getElementById('search'), chips = document.getElementById('chips');
  let tag = null;
  search.placeholder = `Search ${POSTS.length} post${POSTS.length === 1 ? '' : 's'}...`;
  chips.innerHTML = [...new Set(POSTS.flatMap(p => p.tags))].sort()
    .map(t => `<button type="button" data-tag="${esc(t)}">#${esc(t)}</button>`).join('');
  chips.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    tag = tag === b.dataset.tag ? null : b.dataset.tag;
    chips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.tag === tag));
    render();
  };
  search.oninput = render;
  function render() {
    const q = search.value.trim().toLowerCase();
    const hits = sorted.filter(p => (!tag || p.tags.includes(tag)) && (!q || (p.title + ' ' + p.tags.join(' ')).toLowerCase().includes(q)));
    const years = Map.groupBy(hits, p => p.date.slice(0, 4));
    archive.innerHTML = hits.length ? [...years].map(([y, ps]) => `<section>
      <h2>${y} <span class="pill count-pill">${ps.length} post${ps.length === 1 ? '' : 's'}</span></h2>
      <ul class="posts">${ps.map(p => item(p, '')).join('')}</ul></section>`).join('')
      : '<p class="lede" style="margin-top:32px">No posts match.</p>';
  }
  render();
}
