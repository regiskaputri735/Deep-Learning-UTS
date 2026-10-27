document.documentElement.classList.add('js');

/* ============ DATA (BPS 2025 + hasil K-Means k=3 dari laporan) ============
   [provinsi, 15-24, 25-34, 35-44, 45-54, 55-64, 65+, klaster]
   Klaster: 0 = Rendah, 1 = Sedang, 2 = Tinggi */
const AGES = ['15-24','25-34','35-44','45-54','55-64','65+'];
const COL  = {0:'#2e9e6b', 1:'#e0a020', 2:'#d6453d'};
const NAME = {0:'Rendah', 1:'Sedang', 2:'Tinggi'};
const D = [
["Aceh",15.75,32.61,37.36,34.63,28.30,16.36,1],["Sumatera Utara",14.05,30.85,34.08,32.64,28.63,17.75,1],
["Sumatera Barat",18.99,35.38,38.36,36.36,30.59,20.49,2],["Riau",15.59,34.61,36.23,34.51,28.21,21.47,1],
["Jambi",21.07,32.82,36.79,36.15,30.73,19.29,2],["Sumatera Selatan",20.17,34.37,38.23,37.31,31.06,21.39,2],
["Bengkulu",20.70,36.51,37.71,36.06,32.79,26.29,2],["Lampung",23.61,37.61,41.09,39.32,34.31,26.94,2],
["Kepulauan Bangka Belitung",18.03,31.00,34.84,33.75,26.74,15.64,1],["Kepulauan Riau",12.26,28.87,28.80,31.03,25.58,17.00,0],
["DKI Jakarta",15.55,30.62,31.30,30.78,22.18,11.42,0],["Jawa Barat",21.67,35.29,38.01,36.38,33.91,25.72,2],
["Jawa Tengah",21.82,32.31,34.81,31.26,27.39,21.64,1],["DI Yogyakarta",17.55,26.03,29.96,27.21,20.17,16.74,0],
["Jawa Timur",19.56,31.19,33.96,32.48,28.22,21.26,1],["Banten",20.29,35.67,37.32,36.33,31.09,21.38,2],
["Bali",9.02,23.03,27.15,25.32,16.82,7.96,0],["Nusa Tenggara Barat",24.24,35.77,38.81,34.71,31.17,25.51,2],
["Nusa Tenggara Timur",18.21,35.37,35.30,33.14,27.70,18.61,1],["Kalimantan Barat",17.58,32.11,34.27,31.88,27.56,19.64,1],
["Kalimantan Tengah",16.84,30.93,32.29,31.85,26.97,19.25,1],["Kalimantan Selatan",12.94,28.77,30.09,26.99,21.06,16.81,0],
["Kalimantan Timur",13.07,25.82,27.02,27.32,23.31,13.93,0],["Kalimantan Utara",14.24,31.57,32.77,31.66,24.37,14.75,1],
["Sulawesi Utara",13.99,28.81,34.20,30.97,27.96,17.32,1],["Sulawesi Tengah",16.90,30.73,35.41,34.82,28.99,21.84,1],
["Sulawesi Selatan",15.13,29.16,30.91,27.45,23.22,15.11,0],["Sulawesi Tenggara",13.69,29.98,32.85,31.41,24.90,18.89,1],
["Gorontalo",18.26,33.41,37.81,36.67,32.44,24.93,2],["Sulawesi Barat",16.78,30.79,34.42,29.53,25.30,16.18,1],
["Maluku",14.39,32.38,35.00,36.13,27.37,19.66,1],["Maluku Utara",13.95,33.20,35.64,36.85,33.12,23.52,2],
["Papua Barat",15.62,33.02,35.03,32.00,25.55,21.95,1],["Papua Barat Daya",14.88,29.67,31.32,30.87,20.39,16.60,0],
["Papua",10.20,27.30,29.66,27.38,23.49,15.77,0],["Papua Selatan",17.99,41.48,39.61,33.44,30.47,25.96,2],
["Papua Tengah",12.31,25.69,29.38,29.75,27.90,21.81,0],["Papua Pegunungan",8.69,26.32,34.92,34.62,36.25,28.46,1]
];
const NAT = [18.73,32.58,35.19,33.29,28.70,20.88];

/* ============ HELPER ============ */
const avg = a => a.reduce((x,y) => x+y, 0) / a.length;
const f2  = x => x.toFixed(2).replace('.', ',');
const $   = id => document.getElementById(id);
const rows = D.map((r,i) => ({idx:i, n:r[0], v:r.slice(1,7), c:r[7], m:avg(r.slice(1,7))}));
const of   = c => rows.filter(r => r.c === c);
const prof = c => AGES.map((_,i) => avg(of(c).map(r => r.v[i])));
const mob  = () => innerWidth < 640;
const css  = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

let sel = -1, q = '', sk = 'idx', sd = 1, ch = {};
const cur = () => rows.filter(r => (sel < 0 || r.c === sel) && r.n.toLowerCase().includes(q.toLowerCase()));
function mk(id, cfg){ if(ch[id]) ch[id].destroy(); ch[id] = new Chart($(id), cfg); }

/* ============ METRIK + COUNT-UP ============ */
function renderMetrics(){
  const s = [...rows].sort((a,b) => b.m - a.m), hi = s[0], lo = s[s.length-1];
  $('metrics').innerHTML = [
    ['<b data-n="38" data-d="0">0</b>', 'Provinsi dianalisis (6 kelompok umur)'],
    ['<b>k = 3</b>', 'Silhouette 0,3317 · DBI 0,9576'],
    [`<b data-n="${hi.m}" data-d="2" data-s="%">0</b>`, 'Tertinggi: ' + hi.n],
    [`<b data-n="${lo.m}" data-d="2" data-s="%">0</b>`, 'Terendah: ' + lo.n]
  ].map(x => `<div class="card m">${x[0]}<span>${x[1]}</span></div>`).join('');
  document.querySelectorAll('[data-n]').forEach(el => {
    const to = +el.dataset.n, d = +el.dataset.d, s = el.dataset.s || '', t0 = performance.now();
    (function step(t){
      const p = Math.min((t - t0) / 1000, 1), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(d).replace('.', ',') + s;
      if(p < 1) requestAnimationFrame(step);
    })(t0);
  });
}

/* ============ KARTU KLASTER ============ */
function renderCards(){
  $('cards').innerHTML = [0,1,2].map(c => {
    const g = of(c), pct = g.length / 38 * 100;
    return `<div class="card cc ${sel >= 0 && sel !== c ? 'dim' : ''}" data-c="${c}" style="border-top-color:${COL[c]}">
      <h3>KLASTER ${c} · ${NAME[c].toUpperCase()}</h3>
      <div class="big">${g.length} <small>provinsi</small></div>
      <div><b>${f2(pct)}%</b> dari seluruh provinsi</div>
      <div class="meter"><div data-w="${pct}" style="background:${COL[c]}"></div></div>
      <div>Rata-rata perokok: <b>${f2(avg(g.map(r => r.m)))}%</b></div>
      <div class="chips">${g.map(r => `<i>${r.n}</i>`).join('')}</div>
    </div>`;
  }).join('');
  setTimeout(() => document.querySelectorAll('.meter div').forEach(m => m.style.width = m.dataset.w + '%'), 60);
}

/* ============ GRAFIK ============ */
function renderCharts(){
  if(typeof Chart === 'undefined') return;
  Chart.defaults.color = css('--mu');
  Chart.defaults.borderColor = css('--bd');
  Chart.defaults.font.family = "'DM Sans',sans-serif";
  Chart.defaults.font.size = mob() ? 11 : 12;

  mk('c1', {type:'doughnut',
    data:{labels:[0,1,2].map(c => `${NAME[c]} (${of(c).length})`),
      datasets:[{data:[0,1,2].map(c => of(c).length), backgroundColor:[0,1,2].map(c => COL[c]), borderWidth:0}]},
    options:{maintainAspectRatio:false, cutout:'58%',
      plugins:{legend:{position:'bottom'},
        tooltip:{callbacks:{label:t => ` ${t.raw} provinsi (${f2(t.raw/38*100)}%)`}}}}});

  const ds = [0,1,2].map(c => ({
    label:NAME[c], data:prof(c).map(x => +x.toFixed(2)), borderColor:COL[c], backgroundColor:COL[c], tension:.3,
    borderWidth:(sel < 0 || sel === c) ? 3.5 : 1.2, pointRadius:(sel < 0 || sel === c) ? 4 : 2
  }));
  ds.push({label:'Indonesia', data:NAT, borderColor:css('--mu'), borderDash:[5,5], borderWidth:1.5, pointRadius:0, tension:.3});
  mk('c2', {type:'line', data:{labels:AGES, datasets:ds},
    options:{maintainAspectRatio:false, interaction:{mode:'index', intersect:false},
      plugins:{legend:{position:'bottom'}}, scales:{y:{title:{display:!mob(), text:'% perokok'}}}}});

  const d = cur().sort((a,b) => b.m - a.m), rh = mob() ? 26 : 22;
  $('c3t').textContent = 'Rata-rata % Perokok per Provinsi' + (sel >= 0 ? ' · Klaster ' + sel + ' ' + NAME[sel] : '');
  $('c3box').style.height = Math.max(160, d.length * rh + 60) + 'px';
  mk('c3', {type:'bar',
    data:{labels:d.map(r => r.n), datasets:[{data:d.map(r => +r.m.toFixed(2)), backgroundColor:d.map(r => COL[r.c]), borderRadius:4}]},
    options:{indexAxis:'y', maintainAspectRatio:false,
      onClick:(e, els) => { if(els.length) openModal(d[els[0].index]); },
      onHover:(e, els) => { e.native.target.style.cursor = els.length ? 'pointer' : 'default'; },
      plugins:{legend:{display:false},
        tooltip:{callbacks:{label:t => ` ${f2(t.raw)}% · Klaster ${d[t.dataIndex].c} ${NAME[d[t.dataIndex].c]}`}}},
      scales:{y:{ticks:{autoSkip:false, font:{size:mob() ? 10 : 12}}}}}});
}

/* ============ TABEL ============ */
const COLS = [['idx','No'], ['n','Provinsi'], ['c','Klaster'], ...AGES.map((a,i) => [String(i), a + ' th']), ['m','Rata-rata']];
const val = (r,k) => /^\d$/.test(k) ? r.v[+k] : r[k];

function renderTable(){
  $('thead').innerHTML = '<tr>' + COLS.map(c =>
    `<th data-k="${c[0]}">${c[1]}${sk === c[0] ? (sd > 0 ? ' ▲' : ' ▼') : ' ↕'}</th>`).join('') + '</tr>';
  const d = cur().sort((a,b) => {
    const x = val(a,sk), y = val(b,sk);
    return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sd;
  });
  let html = d.map(r => `<tr data-i="${r.idx}">
    <td data-label="No">${r.idx+1}</td>
    <td data-label="Provinsi">${r.n}</td>
    <td data-label="Klaster"><span class="bd" style="background:${COL[r.c]}">${r.c} · ${NAME[r.c]}</span></td>
    ${r.v.map((x,i) => `<td data-label="Usia ${AGES[i]}">${f2(x)}%</td>`).join('')}
    <td class="avg" data-label="Rata-rata"><b>${f2(r.m)}%</b><div class="bar"><div style="width:${r.m/40*100}%;background:${COL[r.c]}"></div></div></td>
  </tr>`).join('');
  if(sel < 0 && !q) html += `<tr class="nat"><td></td><td data-label="">Indonesia (nasional)</td><td data-label="Klaster">—</td>
    ${NAT.map((x,i) => `<td data-label="Usia ${AGES[i]}">${f2(x)}%</td>`).join('')}<td class="avg" data-label="Rata-rata">${f2(avg(NAT))}%</td></tr>`;
  if(!d.length) html = '<tr><td colspan="10" style="text-align:center;padding:30px;display:block">Provinsi tidak ditemukan.</td></tr>';
  $('tbody').innerHTML = html;
}

function render(){
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', +t.dataset.c === sel));
  renderCards(); renderCharts(); renderTable();
}

/* ============ MODAL DETAIL PROVINSI ============ */
function openModal(r){
  const g = of(r.c), cp = prof(r.c);
  $('mhead').innerHTML = `<div class="mt">${r.n}</div>
    <div class="mrow"><span class="bd" style="background:${COL[r.c]}">Klaster ${r.c} · ${NAME[r.c]}</span>
    <span>Rata-rata <b style="color:var(--tx)">${f2(r.m)}%</b> · nasional ${f2(avg(NAT))}%</span></div>`;
  $('mbody').innerHTML = `<div class="dl">${r.v.map((x,i) => {
    const df = x - NAT[i];
    return `<div>${AGES[i]} th<b>${f2(x)}%</b><span class="${df > 0 ? 'up' : 'dn'}">${df > 0 ? '▲' : '▼'} ${f2(Math.abs(df))}</span></div>`;
  }).join('')}</div><p class="note">Panah menunjukkan selisih terhadap angka nasional (merah = lebih tinggi). Klaster ini berisi ${g.length} provinsi.</p>`;
  $('modal').classList.add('on'); document.body.style.overflow = 'hidden';
  if(typeof Chart === 'undefined') return;
  mk('cm', {type:'bar',
    data:{labels:AGES, datasets:[
      {label:r.n, data:r.v, backgroundColor:COL[r.c], borderRadius:4},
      {label:'Rata-rata klaster', data:cp.map(x => +x.toFixed(2)), backgroundColor:css('--mu'), borderRadius:4},
      {label:'Nasional', data:NAT, backgroundColor:css('--bd'), borderRadius:4}]},
    options:{maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}}});
}
function closeModal(){ $('modal').classList.remove('on'); document.body.style.overflow = ''; }

/* ============ EVENT ============ */
$('tabs').addEventListener('click', e => {
  const b = e.target.closest('.tab'); if(!b) return;
  sel = +b.dataset.c; render();
});
$('cards').addEventListener('click', e => {
  const c = e.target.closest('.cc'); if(!c) return;
  sel = (sel === +c.dataset.c) ? -1 : +c.dataset.c; render();
});
$('q').addEventListener('input', e => { q = e.target.value; renderCharts(); renderTable(); });
$('thead').addEventListener('click', e => {
  const h = e.target.closest('th'); if(!h) return;
  const k = h.dataset.k;
  if(sk === k) sd = -sd; else { sk = k; sd = (k === 'n' || k === 'idx' || k === 'c') ? 1 : -1; }
  renderTable();
});
$('sortsel').addEventListener('change', e => {
  const [k, d] = e.target.value.split(/-(?=-?1$)/); sk = k; sd = +d; renderTable();
});
$('tbody').addEventListener('click', e => {
  const tr = e.target.closest('tr[data-i]'); if(tr) openModal(rows[+tr.dataset.i]);
});
$('mx').addEventListener('click', closeModal);
$('modal').addEventListener('click', e => { if(e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

$('csv').addEventListener('click', () => {
  const head = ['No','Provinsi','Klaster','Kategori', ...AGES.map(a => 'Usia ' + a + ' (%)'), 'Rata-rata (%)'];
  const body = rows.map(r => [r.idx+1, '"'+r.n+'"', r.c, NAME[r.c], ...r.v, r.m.toFixed(2)].join(','));
  const url = URL.createObjectURL(new Blob(['\ufeff' + [head.join(','), ...body].join('\n')], {type:'text/csv'}));
  const a = document.createElement('a'); a.href = url; a.download = 'klaster_perokok_2025.csv'; a.click(); URL.revokeObjectURL(url);
});

/* Tema */
$('th').addEventListener('click', () => {
  const r = document.documentElement;
  const dark = r.dataset.theme === 'dark' || (!r.dataset.theme && matchMedia('(prefers-color-scheme:dark)').matches);
  r.dataset.theme = dark ? 'light' : 'dark';
  $('th').textContent = dark ? '🌙' : '☀️';
  renderCharts();
});

/* Navbar: hamburger, scroll-spy, back-to-top */
const menu = $('menu'), links = [...document.querySelectorAll('.lk')];
$('bg').addEventListener('click', () => {
  const o = menu.classList.toggle('open'); $('bg').setAttribute('aria-expanded', o); $('bg').textContent = o ? '✕' : '☰';
});
links.forEach(l => l.addEventListener('click', () => { menu.classList.remove('open'); $('bg').textContent = '☰'; }));
function onScroll(){
  $('nav').classList.toggle('sc', scrollY > 10);
  $('totop').classList.toggle('on', scrollY > 500);
  let cu = links[0];
  links.forEach(l => { const s = document.querySelector(l.getAttribute('href')); if(s && s.offsetTop - 140 <= scrollY) cu = l; });
  links.forEach(l => l.classList.toggle('on', l === cu));
}
addEventListener('scroll', onScroll, {passive:true});
$('totop').addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));

/* Animasi muncul saat scroll */
const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.08});
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* Render ulang grafik saat layar berubah (rotasi HP / resize) */
let lastMob = mob(), tm;
addEventListener('resize', () => {
  clearTimeout(tm);
  tm = setTimeout(() => { if(mob() !== lastMob){ lastMob = mob(); renderCharts(); } }, 200);
});

/* ============ START ============ */
renderMetrics(); render(); onScroll();
